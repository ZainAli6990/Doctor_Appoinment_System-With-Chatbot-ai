<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 'role' was an enum('admin','user'). We need a third role ('doctor').
     * Rather than relying on ->change() for an enum column (fragile across
     * SQLite/MySQL without doctrine/dbal), we safely widen it to a plain
     * string via a copy-column technique that preserves existing data,
     * and validate the allowed values at the application layer instead.
     *
     * We also add patient-profile fields directly onto users, since a
     * logged-in 'user' account IS the patient for the new booking flow.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_new')->default('user')->after('role');
        });

        DB::table('users')->update(['role_new' => DB::raw('role')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role_new', 'role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('role');
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable()->after('phone');
            $table->unsignedInteger('age')->nullable()->after('gender');
            $table->text('address')->nullable()->after('age');
            $table->boolean('is_active')->default(true)->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'gender', 'age', 'address', 'is_active']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role_old', ['admin', 'user'])->default('user')->after('password');
        });

        DB::table('users')->update(['role_old' => DB::raw('role')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role_old', 'role');
        });
    }
};
