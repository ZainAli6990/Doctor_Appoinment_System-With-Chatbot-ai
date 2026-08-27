<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'patient_id',
        'user_id',
        'appointment_date',
        'appointment_time',
        'status',
        'notes',
    ];

    // Appointment ek doctor ki hoti hai
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    // Legacy walk-in patient record (older/admin-created bookings)
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    // Authenticated patient (role = 'user') who owns this appointment
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Allowed status transitions. Used to reject illegal jumps
     * (e.g. Completed -> Cancelled) both for doctors and patients.
     */
    public static function allowedTransitions(): array
    {
        return [
            'Pending' => ['Confirmed', 'Cancelled'],
            'Confirmed' => ['Completed', 'Cancelled'],
            'Completed' => [],
            'Cancelled' => [],
        ];
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, static::allowedTransitions()[$this->status] ?? [], true);
    }
}