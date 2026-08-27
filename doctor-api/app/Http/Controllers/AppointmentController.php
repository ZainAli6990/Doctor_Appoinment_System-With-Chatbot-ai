<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Admin-only: every appointment in the system.
     * (Route is behind ['auth:sanctum', 'admin'] — see routes/api.php.)
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Appointment::with(['doctor', 'patient', 'user'])->latest()->get()
        ], 200);
    }

    /**
     * Admin dashboard widget — 5 most recent appointments.
     */
    public function recent()
    {
        $appointments = Appointment::with(['doctor', 'patient', 'user'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments
        ], 200);
    }

    /**
     * Patient-only: appointments the logged-in patient booked for themselves.
     * (Route is behind ['auth:sanctum', 'patient'].)
     */
    public function myAppointments(Request $request)
    {
        $appointments = Appointment::with(['doctor.specialization'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ], 200);
    }

    /**
     * Book a new appointment.
     *
     * - role = user   : books for themselves. user_id always comes from
     *                   the authenticated session — never from the request
     *                   body — so a patient can never book "as" someone else.
     * - role = admin  : can record a walk-in (patient_id) or book on behalf
     *                   of a registered patient (user_id), preserving the
     *                   existing admin "Book Appointment" workflow.
     * - role = doctor : not permitted (403).
     */
    public function store(Request $request)
    {
        $actor = $request->user();

        if ($actor->role === 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Doctors cannot create appointments.',
            ], 403);
        }

        if ($actor->role === 'admin') {
            $request->merge([
                'patient_id' => $request->patient_id ?: null,
                'user_id' => $request->user_id ?: null,
            ]);
        }

        $rules = [
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'notes' => 'nullable|string',
        ];

        if ($actor->role === 'admin') {
            $rules['patient_id'] = 'nullable|exists:patients,id';
            $rules['user_id'] = 'nullable|exists:users,id';
            $rules['status'] = ['nullable', Rule::in(['Pending', 'Confirmed', 'Cancelled', 'Completed'])];
        }

        $validated = $request->validate($rules);

        $doctor = Doctor::findOrFail($validated['doctor_id']);

        if (! $doctor->status) {
            return response()->json([
                'success' => false,
                'message' => 'This doctor is not currently accepting appointments.',
            ], 422);
        }

        if ($actor->role === 'user') {
            $validated['user_id'] = $actor->id;
            $validated['patient_id'] = null;
        } else {
            // admin: must specify exactly one of patient_id / user_id
            if (empty($validated['patient_id']) && empty($validated['user_id'])) {
                return response()->json([
                    'success' => false,
                    'errors' => ['patient_id' => ['Select an existing patient or a registered user.']],
                ], 422);
            }
        }

        // Prevent an obvious duplicate: same doctor, date & time, not already cancelled.
        $clash = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('status', '!=', 'Cancelled')
            ->exists();

        if ($clash) {
            return response()->json([
                'success' => false,
                'message' => 'This doctor already has an appointment at that date & time. Please choose another slot.',
            ], 422);
        }

        $validated['status'] = $validated['status'] ?? 'Pending';

        $appointment = Appointment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Appointment created successfully.',
            'data' => $appointment->load(['doctor', 'patient', 'user'])
        ], 201);
    }

    /**
     * View a single appointment.
     * - admin  : can view any appointment.
     * - user   : only their own (403 otherwise).
     * - doctor : only their own (403 otherwise).
     */
    public function show(Request $request, Appointment $appointment)
    {
        $actor = $request->user();

        $owns = match ($actor->role) {
            'admin' => true,
            'user' => (int) $appointment->user_id === (int) $actor->id,
            'doctor' => $actor->doctorProfile && (int) $appointment->doctor_id === (int) $actor->doctorProfile->id,
            default => false,
        };

        if (! $owns) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this appointment.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $appointment->load(['doctor.specialization', 'patient', 'user'])
        ], 200);
    }

    public function create() {}
    public function edit(Appointment $appointment) {}

    /**
     * Admin-only general update (status / reschedule / notes).
     * (Route is behind ['auth:sanctum', 'admin'].)
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'patient_id' => 'sometimes|nullable|exists:patients,id',
            'user_id' => 'sometimes|nullable|exists:users,id',
            'appointment_date' => 'sometimes|required|date',
            'appointment_time' => 'sometimes|required',
            'status' => ['sometimes', Rule::in(['Pending', 'Confirmed', 'Cancelled', 'Completed'])],
            'notes' => 'nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'data' => $appointment->load(['doctor', 'patient', 'user'])
        ], 200);
    }

    /**
     * Patient cancels their own appointment.
     * (Route is behind ['auth:sanctum', 'patient'].)
     */
    public function cancelMine(Request $request, Appointment $appointment)
    {
        if ((int) $appointment->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to cancel this appointment.',
            ], 403);
        }

        if (! $appointment->canTransitionTo('Cancelled')) {
            return response()->json([
                'success' => false,
                'message' => "An appointment that is already {$appointment->status} cannot be cancelled.",
            ], 422);
        }

        $appointment->update(['status' => 'Cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment cancelled successfully.',
            'data' => $appointment,
        ], 200);
    }

    /**
     * Admin-only delete.
     * (Route is behind ['auth:sanctum', 'admin'].)
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully.'
        ], 200);
    }
}
