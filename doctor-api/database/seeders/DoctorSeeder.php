<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::insert([

            [
                'name' => 'Dr. Sara Malik',
                'email' => 'sara.malik@example.com',
                'phone' => '03211234567',
                'specialization_id' => 1,
                'experience' => 7,
                'consultation_fee' => 2000,
                'available_days' => 'Mon-Sat',
                'available_time' => '10AM-6PM',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Dr. Ahmed Khan',
                'email' => 'ahmed@example.com',
                'phone' => '03001234567',
                'specialization_id' => 2,
                'experience' => 10,
                'consultation_fee' => 3000,
                'available_days' => 'Mon-Fri',
                'available_time' => '9AM-5PM',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Dr. Ali Hassan',
                'email' => 'ali@example.com',
                'phone' => '03111234567',
                'specialization_id' => 3,
                'experience' => 5,
                'consultation_fee' => 1500,
                'available_days' => 'Sat-Sun',
                'available_time' => '11AM-4PM',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Dr. Fatima Noor',
                'email' => 'fatima@example.com',
                'phone' => '03221234567',
                'specialization_id' => 4,
                'experience' => 8,
                'consultation_fee' => 2500,
                'available_days' => 'Mon-Thu',
                'available_time' => '1PM-7PM',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Dr. Usman Tariq',
                'email' => 'usman@example.com',
                'phone' => '03331234567',
                'specialization_id' => 5,
                'experience' => 12,
                'consultation_fee' => 3500,
                'available_days' => 'Mon-Fri',
                'available_time' => '8AM-2PM',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);

        // Give the first seeded doctor a working Doctor Portal login so the
        // portal can be demoed immediately without manual setup.
        //
        // Email:    sara.malik@example.com
        // Password: password123
        $firstDoctor = Doctor::where('email', 'sara.malik@example.com')->first();

        if ($firstDoctor && ! $firstDoctor->user_id) {
            $doctorUser = User::firstOrCreate(
                ['email' => 'sara.malik@example.com'],
                [
                    'name' => $firstDoctor->name,
                    'password' => Hash::make('password123'),
                ]
            );
            $doctorUser->role = 'doctor';
            $doctorUser->save();

            $firstDoctor->update(['user_id' => $doctorUser->id]);
        }
    }
}