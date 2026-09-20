<?php

use App\EventStatus;
use App\EventType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type', 32)->default(EventType::Other->value);
            $table->string('slug')->nullable()->unique();
            $table->timestamp('starts_at')->nullable();
            $table->string('timezone', 64)->default('America/Sao_Paulo');
            $table->string('venue_name')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('welcome_text')->nullable();
            $table->text('instructions')->nullable();
            $table->string('status', 32)->default(EventStatus::Draft->value);
            $table->boolean('rsvp_open')->default(true);
            $table->boolean('reservations_open')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'published_at', 'suspended_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
