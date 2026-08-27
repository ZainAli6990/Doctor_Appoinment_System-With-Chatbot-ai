<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Storage;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors with search & filter.
     * Public visitors only see active doctors; a logged-in admin sees all.
     * (This route is public — authorization for write actions below is
     * enforced entirely via route middleware, see routes/api.php.)
     */
    public function index(Request $request)
    {
        $query = Doctor::with('specialization');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('specialization')) {
            $query->where('specialization_id', $request->specialization);
        }

        if (! auth('sanctum')->user()) {
            $query->where('status', true);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get()
        ], 200);
    }

    /**
     * Store a newly created doctor (admin only — enforced by route middleware).
     * Optionally creates a Doctor Portal login account in the same request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:doctors,email',
            'phone' => 'required|string|max:20',
            'specialization_id' => 'required|exists:specializations,id',
            'experience' => 'required|integer',
            'consultation_fee' => 'required|numeric',
            'available_days' => 'required|string',
            'available_time' => 'required|string',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
            'create_login' => 'boolean',
            'login_password' => 'required_if:create_login,1,true|nullable|string|min:6',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('doctors', 'public');
        }

        $userId = null;

        if ($request->boolean('create_login')) {
            if (User::where('email', $validated['email'])->exists()) {
                return response()->json([
                    'success' => false,
                    'errors' => ['email' => ['A login account with this email already exists.']],
                ], 422);
            }

            $doctorUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['login_password'], // auto-hashed by the 'hashed' cast
            ]);
            $doctorUser->role = 'doctor';
            $doctorUser->save();

            $userId = $doctorUser->id;
        }

        $doctor = Doctor::create([
            ...collect($validated)->except(['create_login', 'login_password'])->all(),
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Doctor created successfully.',
            'data' => $doctor->load('specialization')
        ], 201);
    }

    public function show(Doctor $doctor)
    {
        return response()->json([
            'success' => true,
            'data' => $doctor->load('specialization')
        ], 200);
    }

    public function create() {}
    public function edit(Doctor $doctor) {}

    /**
     * Update the specified doctor (admin only — enforced by route middleware).
     * Can also create-or-reset the doctor's Doctor Portal login in the same request.
     */
    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:doctors,email,' . $doctor->id,
            'phone' => 'sometimes|required|string|max:20',
            'specialization_id' => 'sometimes|required|exists:specializations,id',
            'experience' => 'sometimes|required|integer',
            'consultation_fee' => 'sometimes|required|numeric',
            'available_days' => 'sometimes|required|string',
            'available_time' => 'sometimes|required|string',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
            'login_password' => 'nullable|string|min:6',
        ]);

        if ($request->hasFile('photo')) {
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }
            $validated['photo'] = $request->file('photo')->store('doctors', 'public');
        }

        // Keep the linked login account's name/email in sync with the doctor
        // profile, even when the admin isn't resetting the password.
        if ($doctor->user_id && (isset($validated['name']) || isset($validated['email']))) {
            $linkedUser = User::find($doctor->user_id);

            if ($linkedUser) {
                if (isset($validated['email']) && $validated['email'] !== $linkedUser->email
                    && User::where('email', $validated['email'])->where('id', '!=', $linkedUser->id)->exists()) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['email' => ['A login account with this email already exists.']],
                    ], 422);
                }

                $linkedUser->update([
                    'name' => $validated['name'] ?? $linkedUser->name,
                    'email' => $validated['email'] ?? $linkedUser->email,
                ]);
            }
        }

        // Create or reset the doctor's login in the same request, if requested.
        if (! empty($validated['login_password'])) {
            $email = $validated['email'] ?? $doctor->email;

            if ($doctor->user_id) {
                $doctorUser = User::findOrFail($doctor->user_id);
            } else {
                if (User::where('email', $email)->exists()) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['email' => ['A login account with this email already exists.']],
                    ], 422);
                }
                $doctorUser = new User(['name' => $validated['name'] ?? $doctor->name, 'email' => $email]);
            }

            $doctorUser->password = $validated['login_password']; // auto-hashed by the 'hashed' cast
            $doctorUser->role = 'doctor';
            $doctorUser->save();

            $validated['user_id'] = $doctorUser->id;
        }

        $doctor->update(collect($validated)->except(['login_password'])->all());

        return response()->json([
            'success' => true,
            'message' => 'Doctor updated successfully.',
            'data' => $doctor->load('specialization')
        ], 200);
    }

    public function destroy(Doctor $doctor)
    {
        try {
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }

            $doctor->delete();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'This doctor cannot be deleted because appointment records exist. Delete related appointments first.'
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Doctor deleted successfully.'
        ], 200);
    }
}
