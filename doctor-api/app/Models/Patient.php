<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'gender',
        'age',
        'address',
    ];

    // Ek patient ki multiple appointments ho sakti hain
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}