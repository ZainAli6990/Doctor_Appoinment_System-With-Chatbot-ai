<?php

namespace App\Http\Controllers;

use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class SpecializationController extends Controller
{
    /**
     * Display all specializations.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Specialization::all()
        ], 200);
    }

    /**
     * Store a new specialization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specializations,name',
            'description' => 'nullable|string'
        ]);

        $specialization = Specialization::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Specialization created successfully.',
            'data' => $specialization
        ], 201);
    }

    /**
     * Display a single specialization.
     */
    public function show(Specialization $specialization)
    {
        return response()->json([
            'success' => true,
            'data' => $specialization
        ], 200);
    }

    /**
     * Not used for API.
     */
    public function create()
    {
        //
    }

    /**
     * Not used for API.
     */
    public function edit(Specialization $specialization)
    {
        //
    }

    /**
     * Update specialization.
     */
    public function update(Request $request, Specialization $specialization)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specializations,name,' . $specialization->id,
            'description' => 'nullable|string'
        ]);

        $specialization->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Specialization updated successfully.',
            'data' => $specialization
        ], 200);
    }

    /**
     * Delete specialization.
     */
    public function destroy(Specialization $specialization)
    {
        try {
            $specialization->delete();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ye specialization delete nahi ho sakti kyunke iske saath doctors jurey hain. Pehle un doctors ko dusri specialization par move ya delete karein.'
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Specialization deleted successfully.'
        ], 200);
    }
}