<?php

namespace App\Console\Commands;

use App\Services\KnowledgeBaseService;
use Illuminate\Console\Command;

class ReindexChatbotKnowledge extends Command
{
    protected $signature = 'chatbot:reindex';

    protected $description = 'Rebuild the AI chatbot knowledge chunks from the current database (doctors, specializations, FAQs).';

    public function handle(KnowledgeBaseService $knowledgeBase): int
    {
        $this->info('Rebuilding chatbot knowledge chunks from SQLite data...');

        $knowledgeBase->rebuild();

        $this->info('Done. knowledge_chunks table refreshed.');

        return self::SUCCESS;
    }
}
