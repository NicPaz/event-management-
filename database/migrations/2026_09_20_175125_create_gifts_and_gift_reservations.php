<?php

use App\GiftReservationStatus;
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
        Schema::create('gifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->string('purchase_url', 2048)->nullable();
            $table->unsignedInteger('quantity_total');
            $table->unsignedInteger('quantity_reserved')->default(0);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'archived_at', 'position']);
        });

        Schema::create('gift_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gift_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('status', 24)->default(GiftReservationStatus::Active->value);
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['event_guest_id', 'gift_id']);
            $table->index(['gift_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_reservations');
        Schema::dropIfExists('gifts');
    }
};
