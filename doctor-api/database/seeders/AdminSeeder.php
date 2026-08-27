<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed a default admin account so the dashboard login works out of the box.
     *
     * Email:    admin@example.com
     * Password: password123
     *
     * IMPORTANT: change this password (or delete this seeder) before deploying
     * to a real/production environment.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
            ]
        );

        // 'role' is intentionally not mass-assignable (see User model), so it
        // must be set directly to guarantee this account can manage doctors.
        $admin->role = 'admin';
        $admin->save();
    }
}
