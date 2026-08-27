<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialization;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        Specialization::insert([

            [
                'name' => 'Dermatologist',
                'description' => 'Skin Specialist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Cardiologist',
                'description' => 'Heart Specialist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Dentist',
                'description' => 'Dental Specialist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Neurologist',
                'description' => 'Brain Specialist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Orthopedic',
                'description' => 'Bone Specialist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}