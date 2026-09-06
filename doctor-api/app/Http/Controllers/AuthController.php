<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationOtpMail;
use App\Mail\WelcomeUserMail;
use App\Models\RegistrationOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new PATIENT account.
     *
     * Registration does NOT create the user immediately.
     * Instead, registration data is temporarily stored in
     * registration_otps and a 6-digit OTP is sent ONLY
     * to the email address entered by the user.
     */
    public function registers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
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

        // Check whether an account already exists.
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'An account with this email already exists.',
            ], 422);
        }

        // Generate a secure 6-digit OTP.
        $otp = (string) random_int(100000, 999999);

        // Remove any previous pending registration for this email.
        RegistrationOtp::where('email', $request->email)->delete();

        // Store temporary registration data.
        RegistrationOtp::create([
            'name' => $request->name,
            'email' => $request->email,

            // Store hashed password temporarily.
            'password' => Hash::make($request->password),

            'phone' => $request->phone,
            'gender' => $request->gender,
            'age' => $request->age,
            'address' => $request->address,

            // Store hashed OTP.
            'otp_hash' => Hash::make($otp),

            // OTP expires after 10 minutes.
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        /*
         * IMPORTANT:
         * OTP is sent ONLY to the email entered during registration.
         *
         * No SMS/phone OTP is used.
         */
        try {
            Mail::to($request->email)
                ->send(new RegistrationOtpMail($otp, $request->name));
        } catch (\Throwable $e) {
            Log::error(
                'Registration OTP email failed: ' . $e->getMessage()
            );

            // Remove temporary registration if email could not be sent.
            RegistrationOtp::where('email', $request->email)->delete();

            return response()->json([
                'success' => false,
                'message' => 'Unable to send verification email. Please try again.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully. Please check your email.',
            'email' => $request->email,
        ], 200);
    }

    /**
     * Verify registration OTP.
     *
     * Only after successful OTP verification:
     * 1. Actual User account is created.
     * 2. Sanctum token is generated.
     * 3. Welcome email is queued.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find pending registration by email.
        $pending = RegistrationOtp::where(
            'email',
            $request->email
        )->first();

        if (! $pending) {
            return response()->json([
                'success' => false,
                'message' => 'No pending registration found. Please register again.',
            ], 404);
        }

        // Check OTP expiry.
        if (now()->greaterThan($pending->otp_expires_at)) {
            $pending->delete();

            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please register again.',
            ], 422);
        }

        // Check submitted OTP against hashed OTP.
        if (! Hash::check($request->otp, $pending->otp_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP. Please enter the correct OTP.',
            ], 422);
        }

        // Final safety check: do not create duplicate account.
        if (User::where('email', $pending->email)->exists()) {
            $pending->delete();

            return response()->json([
                'success' => false,
                'message' => 'An account with this email already exists.',
            ], 422);
        }

        // Create the actual user account only after OTP verification.
        $user = User::create([
            'name' => $pending->name,
            'email' => $pending->email,

            // Password is already hashed in registration_otps.
            'password' => $pending->password,

            'phone' => $pending->phone,
            'gender' => $pending->gender,
            'age' => $pending->age,
            'address' => $pending->address,
        ]);

        // Public registration can only create patient/user accounts.
        $user->role = 'user';
        $user->save();

        // Delete temporary OTP registration after successful verification.
        $pending->delete();

        // Automatically authenticate the newly created user.
        $token = $user->createToken('auth_token')->plainTextToken;

        /*
         * Send welcome email to the SAME verified email address.
         */
        try {
            Mail::to($user->email)
                ->queue(new WelcomeUserMail($user));
        } catch (\Throwable $e) {
            Log::error(
                'Welcome email failed to queue: ' . $e->getMessage()
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Email verified and account created successfully.',
            'data' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login for ANY role (user / doctor / admin).
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
            'data' => $user->role === 'doctor'
                ? $user->load('doctorProfile')
                : $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user (delete current token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    /**
     * Get the currently authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $user->role === 'doctor'
                ? $user->load('doctorProfile')
                : $user,
        ], 200);
    }

    /**
     * Update the logged-in user's own profile.
     */
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

        $user->update(
            $request->only(
                'name',
                'email',
                'phone',
                'gender',
                'age',
                'address'
            )
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ], 200);
    }

    /**
     * Change the logged-in user's own password.
     */
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
                'errors' => [
                    'current_password' => [
                        'Current password is incorrect.'
                    ]
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ], 200);
    }

    /**
     * FORGOT PASSWORD — Step 1.
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
            [
                'token' => Hash::make($plainToken),
                'created_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset request created.',
            'email' => $user->email,
            'reset_token' => $plainToken,
        ], 200);
    }

    /**
     * FORGOT PASSWORD — Step 2.
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

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset request. Please start again.',
            ], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

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

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Token is single-use.
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ], 200);
    }
}