<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

/**
 * Admin-only management of patient/user accounts.
 * All routes using this controller sit behind ['auth:sanctum', 'admin'].
 */
class UserController extends Controller
{
    /**
     * List patient accounts (role = 'user'). Doctors/Admins are managed
     * from their own dedicated screens, so they're excluded here.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'user');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ], 200);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user->load('appointments.doctor'),
        ], 200);
    }

    /**
     * Toggle a patient account active/inactive. Deactivated accounts
     * can't log in (see AuthController::login).
     */
    public function toggleStatus(User $user)
    {
        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only patient accounts can be toggled from here.',
            ], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Account activated.' : 'Account deactivated.',
            'data' => $user,
        ], 200);
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only patient accounts can be deleted from here.',
            ], 422);
        }

        try {
            $user->delete();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'This user cannot be deleted because appointment records exist.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ], 200);
    }
}
