<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Everything a logged-in DOCTOR does for themselves.
 * All routes here sit behind ['auth:sanctum', 'doctor'] — see routes/api.php.
 * Every method resolves the doctor profile from $request->user()->doctorProfile,
 * never from a client-supplied doctor_id, so a doctor can never act on
 * another doctor's data.
 */
class DoctorPortalController extends Controller
{
    private function myDoctorProfile(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        abort_unless($doctor, 404, 'No doctor profile linked to this account.');

        return $doctor;
    }

    // Dashboard stats scoped to the logged-in doctor only
    public function dashboard(Request $request)
    {
        $doctor = $this->myDoctorProfile($request);

        $base = Appointment::where('doctor_id', $doctor->id);

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor->load('specialization'),
                'cards' => [
                    'total' => (clone $base)->count(),
                    'pending' => (clone $base)->where('status', 'Pending')->count(),
                    'confirmed' => (clone $base)->where('status', 'Confirmed')->count(),
                    'completed' => (clone $base)->where('status', 'Completed')->count(),
                    'cancelled' => (clone $base)->where('status', 'Cancelled')->count(),
                ],
            ],
        ], 200);
    }

    // Only this doctor's appointments — never another doctor's
    public function appointments(Request $request)
    {
        $doctor = $this->myDoctorProfile($request);

        $appointments = Appointment::with(['patient', 'user'])
            ->where('doctor_id', $doctor->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ], 200);
    }

    /**
     * Confirm / cancel / complete an appointment — but only if it belongs
     * to this doctor, and only along an allowed status transition.
     */
    public function updateAppointmentStatus(Request $request, Appointment $appointment)
    {
        $doctor = $this->myDoctorProfile($request);

        if ((int) $appointment->doctor_id !== (int) $doctor->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to manage this appointment.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['Confirmed', 'Cancelled', 'Completed'])],
        ]);

        if (! $appointment->canTransitionTo($validated['status'])) {
            return response()->json([
                'success' => false,
                'message' => "Cannot change status from {$appointment->status} to {$validated['status']}.",
            ], 422);
        }

        $appointment->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated.',
            'data' => $appointment->load(['patient', 'user']),
        ], 200);
    }

    // Doctor updates their own specialization/fee/photo/etc.
    public function updateProfile(Request $request)
    {
        $doctor = $this->myDoctorProfile($request);
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'experience' => 'sometimes|required|integer',
            'consultation_fee' => 'sometimes|required|numeric',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }
            $validated['photo'] = $request->file('photo')->store('doctors', 'public');
        }

        $doctor->update($validated);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $doctor->load('specialization'),
        ], 200);
    }

    // Doctor manages their own available days/time — nothing else
    public function updateAvailability(Request $request)
    {
        $doctor = $this->myDoctorProfile($request);

        $validated = $request->validate([
            'available_days' => 'required|string',
            'available_time' => 'required|string',
        ]);

        $doctor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully.',
            'data' => $doctor,
        ], 200);
    }
}
