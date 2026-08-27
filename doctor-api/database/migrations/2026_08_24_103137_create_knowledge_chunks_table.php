<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This table stores the AI chatbot's "knowledge chunks" — small pieces of
     * text generated from the live SQLite data (doctors, specializations,
     * FAQs) that get searched via keyword matching and fed to the AI model
     * as context (RAG-style retrieval).
     */
    public function up(): void
    {
        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('source_type'); // doctor | specialization | faq
            $table->unsignedBigInteger('source_id')->nullable();
            $table->text('content');   // human-readable chunk text fed to the AI
            $table->text('keywords')->nullable(); // extra searchable keywords
            $table->timestamps();

            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
    }
};
