<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorPortalController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\SpecializationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;


/*-----------------------------------------------------------------------
| Public Routes (no login required)
|--------------------------------------------------------------------------
*/


// Authentication — register ALWAYS creates role = 'user'

Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Forgot Password (User / Doctor only — Admin is rejected inside the controller)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Doctors (public read-only — only active doctors shown to guests)
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);

// Specializations (public read-only)
Route::get('/specializations', [SpecializationController::class, 'index']);
Route::get('/specializations/{specialization}', [SpecializationController::class, 'show']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes — any logged-in role
| (user / doctor / admin)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // AI Chatbot
    Route::post('/chat', [ChatController::class, 'chat']);

    // Authentication / Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
});


/*
|--------------------------------------------------------------------------
| Patient Routes (role = 'user')
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'patient'])->group(function () {

    Route::post('/appointments', [AppointmentController::class, 'store']);

    Route::get(
        '/my-appointments',
        [AppointmentController::class, 'myAppointments']
    );

    Route::patch(
        '/my-appointments/{appointment}/cancel',
        [AppointmentController::class, 'cancelMine']
    );
});


/*
|--------------------------------------------------------------------------
| Doctor Routes (role = 'doctor')
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'doctor'])->group(function () {

    Route::get(
        '/doctor/dashboard',
        [DoctorPortalController::class, 'dashboard']
    );

    Route::get(
        '/doctor/appointments',
        [DoctorPortalController::class, 'appointments']
    );

    Route::patch(
        '/doctor/appointments/{appointment}/status',
        [DoctorPortalController::class, 'updateAppointmentStatus']
    );

    Route::put(
        '/doctor/profile',
        [DoctorPortalController::class, 'updateProfile']
    );

    Route::post(
        '/doctor/profile',
        [DoctorPortalController::class, 'updateProfile']
    ); // supports multipart photo upload w/ _method=PUT

    Route::put(
        '/doctor/availability',
        [DoctorPortalController::class, 'updateAvailability']
    );
});


/*
|--------------------------------------------------------------------------
| Admin Routes (role = 'admin')
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard Stats
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    );

    Route::get(
        '/dashboard/chart',
        [DashboardController::class, 'chart']
    );


    /*
    |--------------------------------------------------------------------------
    | Doctors (write access)
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/doctors',
        [DoctorController::class, 'store']
    );

    Route::put(
        '/doctors/{doctor}',
        [DoctorController::class, 'update']
    );

    Route::patch(
        '/doctors/{doctor}',
        [DoctorController::class, 'update']
    );

    Route::delete(
        '/doctors/{doctor}',
        [DoctorController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Specializations (write access)
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/specializations',
        [SpecializationController::class, 'store']
    );

    Route::put(
        '/specializations/{specialization}',
        [SpecializationController::class, 'update']
    );

    Route::patch(
        '/specializations/{specialization}',
        [SpecializationController::class, 'update']
    );

    Route::delete(
        '/specializations/{specialization}',
        [SpecializationController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Legacy walk-in Patients
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/patients',
        [PatientController::class, 'index']
    );

    Route::get(
        '/patients/latest',
        [PatientController::class, 'latest']
    );

    Route::post(
        '/patients',
        [PatientController::class, 'store']
    );

    Route::get(
        '/patients/{patient}',
        [PatientController::class, 'show']
    );

    Route::put(
        '/patients/{patient}',
        [PatientController::class, 'update']
    );

    Route::patch(
        '/patients/{patient}',
        [PatientController::class, 'update']
    );

    Route::delete(
        '/patients/{patient}',
        [PatientController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Registered patient accounts
    | users.role = 'user'
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/users',
        [UserController::class, 'index']
    );

    Route::get(
        '/users/{user}',
        [UserController::class, 'show']
    );

    Route::patch(
        '/users/{user}/toggle-status',
        [UserController::class, 'toggleStatus']
    );

    Route::delete(
        '/users/{user}',
        [UserController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | All appointments — full visibility & management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/appointments',
        [AppointmentController::class, 'index']
    );

    Route::get(
        '/appointments/recent',
        [AppointmentController::class, 'recent']
    );

    Route::put(
        '/appointments/{appointment}',
        [AppointmentController::class, 'update']
    );

    Route::patch(
        '/appointments/{appointment}',
        [AppointmentController::class, 'update']
    );

    Route::delete(
        '/appointments/{appointment}',
        [AppointmentController::class, 'destroy']
    );
});


/*
|--------------------------------------------------------------------------
| Shared "view a single appointment" route
| any logged-in role
|--------------------------------------------------------------------------
|
| Registered LAST so Laravel doesn't try to match the literal word
| "recent" against the {appointment} wildcard.
|
| Ownership is verified inside AppointmentController@show.
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/appointments/{appointment}',
        [AppointmentController::class, 'show']
    );
});