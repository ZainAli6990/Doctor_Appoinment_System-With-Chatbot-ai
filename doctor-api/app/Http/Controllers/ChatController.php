<?php

namespace App\Http\Controllers;

use App\Services\KnowledgeBaseService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function __construct(private KnowledgeBaseService $knowledgeBase)
    {
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $userMessage = $request->message;

        $apiKey = trim((string) config('services.groq.api_key'));
        $model = config('services.groq.model', 'openai/gpt-oss-120b');

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Chatbot abhi setup nahi hai. .env file mein GROQ_API_KEY add karein.',
            ], 500);
        }

        // ---- RAG retrieval: pull relevant chunks + live user context from SQLite ----
        $relevantChunks = $this->knowledgeBase->search($userMessage);
        $userContext = $this->knowledgeBase->getUserContext($request->user());

        $contextParts = [];

        if (!empty($relevantChunks)) {
            $contextParts[] = "Relevant information from the clinic database:\n"
                . implode("\n", array_map(fn ($c) => "- {$c}", $relevantChunks));
        }

        if ($userContext) {
            $contextParts[] = $userContext;
        }

        $contextBlock = $contextParts
            ? implode("\n\n", $contextParts)
            : 'No specific matching data was found in the database for this question.';

        $systemPrompt = <<<PROMPT
You are "MediCare AI", the assistant embedded inside a Doctor Appointment System (SehatCare).
Answer using ONLY the context data given below, plus general, safe help about using the platform.
If the answer is not present in the context, politely say you don't have that specific information rather than guessing, and suggest what the user can check instead (e.g. the Doctors page or My Appointments page).
Never invent doctor names, fees, or timings that are not in the context.
Never give medical diagnosis or treatment advice - only appointment/system related help.
Keep answers short, clear and friendly. Match the user's language style (English or Roman Urdu).

Context:
{$contextBlock}
PROMPT;

        try {
            $response = Http::timeout(30)
                ->withToken($apiKey)
                ->acceptJson()
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                    'temperature' => 0.4,
                    'max_tokens' => 500,
                ]);

            if ($response->failed()) {
                $status = $response->status();
                $errorBody = $response->json();
                $groqCode = $errorBody['error']['code'] ?? null;

                Log::error('Groq API request failed', [
                    'status' => $status,
                    'body' => $errorBody,
                ]);

                $friendly = match (true) {
                    $status === 429 => 'AI provider ki free limit abhi khatam ho gayi hai. 1-2 minute baad dobara try karein.',
                    $groqCode === 'model_decommissioned' => 'AI model purana ho chuka hai (Groq ne band kar diya). .env mein GROQ_MODEL update karein.',
                    $status === 401 => 'GROQ_API_KEY invalid ya expire ho chuki hai. .env file check karein.',
                    default => 'AI assistant se abhi jawab nahi mil raha. Thori dair baad dobara koshish karein.',
                };

                return response()->json([
                    'success' => false,
                    'message' => $friendly,
                    'debug' => config('app.debug') ? $errorBody : null,
                ], 500);
            }

            $data = $response->json();
            $answer = $data['choices'][0]['message']['content'] ?? null;

            if (!$answer) {
                return response()->json([
                    'success' => false,
                    'message' => 'AI se jawab generate nahi ho saka. Dobara try karein.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => trim($answer),
            ]);
        } catch (ConnectionException $e) {
            Log::error('Groq connection error', ['error' => $e->getMessage()]);

            $isSsl = str_contains(strtolower($e->getMessage()), 'ssl')
                || str_contains(strtolower($e->getMessage()), 'certificate');

            return response()->json([
                'success' => false,
                'message' => $isSsl
                    ? 'Server SSL certificate verify nahi kar saka. XAMPP ke php.ini mein curl.cainfo path set karein.'
                    : 'AI server se connect nahi ho saka. Internet connection check karein.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        } catch (\Throwable $e) {
            Log::error('Chatbot unexpected error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Kuch masla ho gaya hai. Dobara try karein.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
