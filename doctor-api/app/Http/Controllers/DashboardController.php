<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Specialization;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            "success" => true,

            "cards" => [
                "doctors" => Doctor::count(),
                "patients" => Patient::count() + User::where('role', 'user')->count(),
                "users" => User::where('role', 'user')->count(),
                "appointments" => Appointment::count(),
                "specializations" => Specialization::count(),
                "pending" => Appointment::where('status', 'Pending')->count(),
                "confirmed" => Appointment::where('status', 'Confirmed')->count(),
                "completed" => Appointment::where('status', 'Completed')->count(),
                "cancelled" => Appointment::where('status', 'Cancelled')->count(),
            ]
        ]);
    }

    public function chart()
    {
        return response()->json([

            "success" => true,

            "appointmentStatus" => [
                "Pending" => Appointment::where("status", "Pending")->count(),
                "Confirmed" => Appointment::where("status", "Confirmed")->count(),
                "Completed" => Appointment::where("status", "Completed")->count(),
                "Cancelled" => Appointment::where("status", "Cancelled")->count(),
            ],

            "monthlyAppointments" => [
                Appointment::whereMonth('created_at',1)->count(),
                Appointment::whereMonth('created_at',2)->count(),
                Appointment::whereMonth('created_at',3)->count(),
                Appointment::whereMonth('created_at',4)->count(),
                Appointment::whereMonth('created_at',5)->count(),
                Appointment::whereMonth('created_at',6)->count(),
                Appointment::whereMonth('created_at',7)->count(),
                Appointment::whereMonth('created_at',8)->count(),
                Appointment::whereMonth('created_at',9)->count(),
                Appointment::whereMonth('created_at',10)->count(),
                Appointment::whereMonth('created_at',11)->count(),
                Appointment::whereMonth('created_at',12)->count(),
            ]

        ]);
    }
}
