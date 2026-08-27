<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    // Ek specialization ke multiple doctors ho sakte hain
    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }
}