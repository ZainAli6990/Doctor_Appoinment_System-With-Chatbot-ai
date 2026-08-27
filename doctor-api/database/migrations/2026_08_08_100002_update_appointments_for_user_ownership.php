<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * - Adds user_id (the authenticated patient who booked/owns the appointment).
     * - Makes patient_id nullable (new bookings use user_id; the legacy
     *   'patients' table + patient_id stays for old/walk-in records).
     * - Widens status from enum('Pending','Approved','Cancelled') to a plain
     *   string so we can safely introduce 'Confirmed' and 'Completed'
     *   without a fragile enum ALTER, then migrates old 'Approved' rows to
     *   'Confirmed' to match the new status vocabulary.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('doctor_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        // --- make patient_id nullable ---
        Schema::table('appointments', function (Blueprint $table) {
            $table->unsignedBigInteger('patient_id_new')->nullable()->after('patient_id');
        });

        DB::table('appointments')->update(['patient_id_new' => DB::raw('patient_id')]);

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropColumn('patient_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->renameColumn('patient_id_new', 'patient_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('patient_id')->references('id')->on('patients')->nullOnDelete();
        });

        // --- widen status enum -> string, keep default, migrate values ---
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('status_new')->default('Pending')->after('status');
        });

        DB::table('appointments')->update(['status_new' => DB::raw('status')]);
        DB::table('appointments')->where('status_new', 'Approved')->update(['status_new' => 'Confirmed']);

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->renameColumn('status_new', 'status');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
