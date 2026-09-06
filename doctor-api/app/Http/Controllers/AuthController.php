<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new PATIENT account.
     *
     * Security: 'role' is never read from the request. Even if a client
     * sends {"role": "admin"} it is silently ignored — every public
     * registration is hard-coded to role = 'user'. Admin and Doctor
     * accounts can only be created by an existing admin.
     */
    public function registers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:Male,Female,Other',
            'age' => 'nullable|integer|min:0|max:150',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create($request->only('name', 'email', 'password', 'phone', 'gender', 'age', 'address'));
        $user->role = 'user'; // hard-coded — never trust client input for this
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully.',
            'data' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login for ANY role (user / doctor / admin). The frontend redirects
     * based on the returned `role` field — the backend doesn't need to
     * know or care which portal is calling this endpoint.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact the clinic.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => $user->role === 'doctor' ? $user->load('doctorProfile') : $user,
            'token' => $token,
        ], 200);
    }

    // Logout user (delete current token)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    // Get the currently authenticated user (any role)
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $user->role === 'doctor' ? $user->load('doctorProfile') : $user,
        ], 200);
    }

    // Update the logged-in user's own profile (works for user/doctor/admin)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:Male,Female,Other',
            'age' => 'nullable|integer|min:0|max:150',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only('name', 'email', 'phone', 'gender', 'age', 'address'));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ], 200);
    }

    // Change the logged-in user's own password (works for any role)
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'errors' => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ], 200);
    }

    /**
     * FORGOT PASSWORD — Step 1 (public, no login required).
     *
     * Identifies the account by email and issues a short-lived reset
     * token, reusing the `password_reset_tokens` table that already
     * ships with this Laravel project (see the original users table
     * migration) — no new database table is created for this.
     *
     * Only 'user' (patient) and 'doctor' accounts can use this flow.
     * Admin accounts are explicitly rejected — Admin password recovery
     * is intentionally left untouched, per project requirements.
     *
     * NOTE ON EMAIL DELIVERY: this project's MAIL_MAILER is set to
     * "log" — no real mail transport is configured, so there is no
     * working email inbox to send a reset link to. The generated token
     * is therefore returned directly in this JSON response so the
     * frontend can carry it to the "Reset Password" step. If real mail
     * is configured later, swap this for actually emailing the token
     * as a link and stop returning it in the response body.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address.',
            ], 404);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Password reset is not available for this account. Please contact the system administrator.',
            ], 403);
        }

        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($plainToken), 'created_at' => now()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset request created.',
            'email' => $user->email,
            'reset_token' => $plainToken,
        ], 200);
    }

    /**
     * FORGOT PASSWORD — Step 2 (public, no login required).
     *
     * Verifies the token issued by forgotPassword() above and, if it is
     * valid and not expired (60 minute window), updates the password.
     * The old password becomes invalid immediately because it is
     * overwritten (hashed) on the same `users` row used for login.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset request. Please start again.',
            ], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'success' => false,
                'message' => 'This password reset request has expired. Please start again.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || $user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Password reset is not available for this account.',
            ], 403);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Token is single-use — remove it now that it has been consumed.
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ], 200);
    }
}
