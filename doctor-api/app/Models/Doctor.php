<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'specialization_id',
        'experience',
        'consultation_fee',
        'available_days',
        'available_time',
        'status',
        'photo',
    ];

    protected $appends = ['photo_url'];

    /**
     * The login account this doctor uses to access the Doctor Portal
     * (null if the admin hasn't created one yet).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Full public URL for the doctor's photo, or null if none uploaded.
     */
    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}