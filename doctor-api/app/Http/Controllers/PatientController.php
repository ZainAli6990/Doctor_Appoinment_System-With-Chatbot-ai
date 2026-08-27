<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class PatientController extends Controller
{
    /**
     * Display all patients.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Patient::latest()->get()
        ], 200);
    }

    /**
     * Latest 5 Patients (Dashboard Widget)
     */
    public function latest()
    {
        $patients = Patient::latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $patients
        ], 200);
    }

    /**
     * Store a newly created (walk-in) patient. If a patient with this email
     * already exists, their details are refreshed and the existing record
     * is reused instead of erroring out.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'gender' => 'required|in:Male,Female,Other',
            'age' => 'required|integer|min:0|max:150',
            'address' => 'required|string',
        ]);

        $patient = Patient::updateOrCreate(
            ['email' => $validated['email']],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Patient created successfully.',
            'data' => $patient
        ], 201);
    }

    /**
     * Display a single patient.
     */
    public function show(Patient $patient)
    {
        return response()->json([
            'success' => true,
            'data' => $patient->load('appointments')
        ], 200);
    }

    /**
     * Update patient.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:patients,email,' . $patient->id,
            'phone' => 'sometimes|required|string|max:20',
            'gender' => 'sometimes|required|in:Male,Female,Other',
            'age' => 'sometimes|required|integer|min:0|max:150',
            'address' => 'sometimes|required|string',
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Patient updated successfully.',
            'data' => $patient
        ], 200);
    }

    /**
     * Delete patient.
     */
    public function destroy(Patient $patient)
    {
        try {
            $patient->delete();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'This patient cannot be deleted because appointment records exist.'
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Patient deleted successfully.'
        ], 200);
    }
}