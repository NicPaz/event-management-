<?php

use App\EventSectionType;
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
        Schema::create('event_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('template_key', 32)->default('neutral');
            $table->string('background_color', 7)->default('#FAF7F2');
            $table->string('surface_color', 7)->default('#FFFFFF');
            $table->string('text_color', 7)->default('#3E352E');
            $table->string('accent_color', 7)->default('#88715B');
            $table->string('border_color', 7)->default('#DFD4C7');
            $table->string('font_pair', 32)->default('classic');
            $table->string('banner_path')->nullable();
            $table->string('banner_position', 16)->default('center');
            $table->timestamps();
        });

        Schema::create('event_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32)->default(EventSectionType::Cover->value);
            $table->boolean('enabled')->default(true);
            $table->unsignedSmallInteger('position');
            $table->timestamps();

            $table->unique(['event_id', 'type']);
            $table->unique(['event_id', 'position']);
        });

        Schema::create('event_palette_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('label', 80);
            $table->string('color_hex', 7)->nullable();
            $table->string('material', 80)->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestamps();

            $table->index(['event_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_palette_items');
        Schema::dropIfExists('event_sections');
        Schema::dropIfExists('event_themes');
    }
};
