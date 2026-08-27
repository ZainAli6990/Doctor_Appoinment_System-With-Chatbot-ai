<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\KnowledgeChunk;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Lightweight RAG (Retrieval Augmented Generation) helper.
 *
 * It does NOT use vector embeddings (no extra API cost / dependency needed
 * for an FYP-scale app). Instead it:
 *   1. Turns SQLite rows (doctors, specializations) + static FAQs into small
 *      text "chunks" and stores them in the knowledge_chunks table.
 *   2. When the user asks something, it tokenizes the question, expands
 *      Roman Urdu medical/intent words to their English equivalents, and
 *      scores every stored chunk by keyword overlap.
 *   3. The best matching chunks are handed to the AI model as context, so
 *      answers are grounded in the real database instead of the model
 *      guessing.
 */
class KnowledgeBaseService
{
    /**
     * Roman Urdu / English synonym map so "dil ka doctor chahiye" also
     * matches chunks containing "cardiologist", etc. Extend freely.
     */
    private array $synonyms = [
        'dil' => ['cardiologist', 'heart'],
        'qalb' => ['cardiologist', 'heart'],
        'dant' => ['dentist', 'dental', 'teeth'],
        'daant' => ['dentist', 'dental', 'teeth'],
        'dando' => ['dentist', 'dental'],
        'ankh' => ['eye', 'ophthalmologist'],
        'ankho' => ['eye', 'ophthalmologist'],
        'aankh' => ['eye', 'ophthalmologist'],
        'chamdi' => ['skin', 'dermatologist'],
        'jild' => ['skin', 'dermatologist'],
        'haddi' => ['bone', 'orthopedic', 'orthopaedic'],
        'hadi' => ['bone', 'orthopedic', 'orthopaedic'],
        'jor' => ['bone', 'orthopedic', 'joint'],
        'bacha' => ['child', 'pediatrician', 'pediatrics'],
        'bachay' => ['child', 'pediatrician', 'pediatrics'],
        'bachon' => ['child', 'pediatrician', 'pediatrics'],
        'aurat' => ['women', 'gynecologist'],
        'aurton' => ['women', 'gynecologist'],
        'zanana' => ['women', 'gynecologist'],
        'hamal' => ['pregnancy', 'gynecologist'],
        'dimagh' => ['brain', 'neurologist', 'neurology'],
        'nas' => ['nerve', 'neurologist'],
        'pait' => ['stomach', 'gastroenterologist'],
        'moti' => ['obesity', 'nutrition'],
        'sugar' => ['diabetes', 'endocrinologist'],
        'bukhar' => ['fever', 'physician'],
        'buhkar' => ['fever', 'physician'],
        'khansi' => ['cough', 'pulmonologist', 'physician'],
        'saans' => ['breathing', 'pulmonologist'],
        'fee' => ['fee', 'consultation', 'charges'],
        'fees' => ['fee', 'consultation', 'charges'],
        'paisay' => ['fee', 'consultation', 'charges'],
        'charges' => ['fee', 'consultation'],
        'waqt' => ['time', 'available', 'schedule', 'timing'],
        'timing' => ['time', 'available', 'schedule'],
        'appointment' => ['appointment', 'booking'],
        'booking' => ['appointment', 'booking'],
        'cancel' => ['cancel', 'appointment'],
        'radd' => ['cancel', 'appointment'],
        'mansookh' => ['cancel', 'appointment'],
    ];

    /**
     * Rebuild all doctor / specialization / FAQ chunks from current DB data.
     * Safe to call anytime — it fully replaces the previous chunk set.
     */
    public function rebuild(): void
    {
        DB::transaction(function () {
            KnowledgeChunk::whereIn('source_type', ['doctor', 'specialization', 'faq'])->delete();

            $specializations = Specialization::with(['doctors' => function ($q) {
                $q->where('status', true);
            }])->get();

            foreach ($specializations as $spec) {
                $doctorNames = $spec->doctors->pluck('name')->implode(', ');

                $content = "Specialization: {$spec->name}. "
                    . ($spec->description ? $spec->description . ' ' : '')
                    . ($doctorNames !== ''
                        ? "Doctors currently available in this specialization: {$doctorNames}."
                        : 'No active doctors are currently listed under this specialization.');

                KnowledgeChunk::create([
                    'source_type' => 'specialization',
                    'source_id' => $spec->id,
                    'content' => $content,
                    'keywords' => mb_strtolower($spec->name),
                ]);
            }

            $doctors = Doctor::with('specialization')->get();

            foreach ($doctors as $doc) {
                $status = $doc->status ? 'currently accepting appointments' : 'currently not accepting appointments';
                $specName = $doc->specialization?->name ?? 'General';

                $content = "Dr. {$doc->name} is a {$specName} specialist with {$doc->experience} years of experience. "
                    . "Consultation fee is Rs. {$doc->consultation_fee}. "
                    . "Available on {$doc->available_days} during {$doc->available_time}. "
                    . "This doctor is {$status}.";

                KnowledgeChunk::create([
                    'source_type' => 'doctor',
                    'source_id' => $doc->id,
                    'content' => $content,
                    'keywords' => mb_strtolower($doc->name . ' ' . $specName),
                ]);
            }

            foreach ($this->faqChunks() as $faq) {
                KnowledgeChunk::create([
                    'source_type' => 'faq',
                    'source_id' => null,
                    'content' => $faq['content'],
                    'keywords' => $faq['keywords'],
                ]);
            }
        });
    }

    /**
     * Rebuild automatically if the chunk table looks stale/empty compared
     * to current doctor + specialization counts (e.g. admin added a new
     * doctor since the last reindex). Cheap count comparison, no heavy work.
     */
    public function maybeAutoRebuild(): void
    {
        $expected = Doctor::count() + Specialization::count();

        $actual = KnowledgeChunk::whereIn('source_type', ['doctor', 'specialization'])->count();

        $hasFaqs = KnowledgeChunk::where('source_type', 'faq')->exists();

        if ($expected !== $actual || !$hasFaqs) {
            $this->rebuild();
        }
    }

    /**
     * Search stored chunks for the ones most relevant to the user's message.
     *
     * @return string[] plain chunk text, best matches first
     */
    public function search(string $query, int $limit = 6): array
    {
        $this->maybeAutoRebuild();

        $queryTokens = $this->expandTokens($this->tokenize($query));

        if (empty($queryTokens)) {
            return [];
        }

        $chunks = KnowledgeChunk::query()->select(['content', 'keywords'])->get();

        $scored = [];

        foreach ($chunks as $chunk) {
            $haystack = mb_strtolower($chunk->content . ' ' . $chunk->keywords);
            $score = 0;

            foreach ($queryTokens as $token) {
                if ($token === '') {
                    continue;
                }

                $occurrences = preg_match_all('/' . preg_quote($token, '/') . '/u', $haystack);

                if ($occurrences > 0) {
                    // Longer / more specific words (e.g. "cardiologist") count more
                    // than short generic ones (e.g. "ka", "hai").
                    $score += $occurrences * (mb_strlen($token) >= 4 ? 2 : 1);
                }
            }

            if ($score > 0) {
                $scored[] = ['content' => $chunk->content, 'score' => $score];
            }
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice(array_column($scored, 'content'), 0, $limit);
    }

    /**
     * Live, non-chunked, user-specific context (kept separate from the
     * persisted knowledge chunks because it's personal + time-sensitive
     * data that should never be cached/shared).
     */
    public function getUserContext(?User $user): ?string
    {
        if (!$user) {
            return null;
        }

        if ($user->isPatient()) {
            $appointments = Appointment::where('user_id', $user->id)
                ->where('appointment_date', '>=', now()->toDateString())
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->with('doctor')
                ->limit(5)
                ->get();

            if ($appointments->isEmpty()) {
                return "This patient ({$user->name}) currently has no upcoming appointments.";
            }

            $lines = $appointments->map(function ($a) {
                $doctorName = $a->doctor?->name ?? 'Unknown';
                return "- {$a->appointment_date} at {$a->appointment_time} with Dr. {$doctorName} — status: {$a->status}.";
            })->implode("\n");

            return "Upcoming appointments for this patient ({$user->name}):\n{$lines}";
        }

        if ($user->isDoctor() && $user->doctorProfile) {
            $appointments = Appointment::where('doctor_id', $user->doctorProfile->id)
                ->where('appointment_date', '>=', now()->toDateString())
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->limit(5)
                ->get();

            if ($appointments->isEmpty()) {
                return "Dr. {$user->name} has no upcoming appointments scheduled.";
            }

            $lines = $appointments->map(function ($a) {
                return "- {$a->appointment_date} at {$a->appointment_time} — status: {$a->status}.";
            })->implode("\n");

            return "Upcoming appointments for Dr. {$user->name}:\n{$lines}";
        }

        return null;
    }

    private function tokenize(string $text): array
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text) ?? '';
        $words = preg_split('/\s+/u', trim($text)) ?: [];

        return array_values(array_filter($words, fn ($w) => mb_strlen($w) >= 2));
    }

    private function expandTokens(array $tokens): array
    {
        $expanded = $tokens;

        foreach ($tokens as $token) {
            if (isset($this->synonyms[$token])) {
                $expanded = array_merge($expanded, $this->synonyms[$token]);
            }
        }

        return array_values(array_unique($expanded));
    }

    /**
     * Static help content about how the platform itself works. Feel free to
     * add more (payment methods, working hours, contact info, etc.).
     */
    private function faqChunks(): array
    {
        return [
            [
                'content' => 'To book an appointment: login as a patient, go to the Doctors page, choose a doctor, pick an available slot and confirm. The appointment status starts as Pending until the doctor confirms it.',
                'keywords' => 'book appointment booking how to',
            ],
            [
                'content' => 'Patients can cancel their own appointment from the My Appointments page as long as it has not been marked Completed. Once an appointment is Completed it cannot be cancelled.',
                'keywords' => 'cancel appointment mansookh radd',
            ],
            [
                'content' => 'Appointment status meanings: Pending (waiting for doctor confirmation), Confirmed (doctor accepted it), Completed (visit finished), Cancelled (no longer active).',
                'keywords' => 'status pending confirmed completed cancelled meaning',
            ],
            [
                'content' => 'This assistant can help with information about doctors, specializations, consultation fees, timings, and appointments in this system. It does not provide medical diagnosis or emergency medical advice — in an emergency, contact a hospital directly.',
                'keywords' => 'diagnosis emergency medical advice disclaimer',
            ],
        ];
    }
}
