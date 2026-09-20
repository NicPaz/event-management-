<?php

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
        Schema::table('event_themes', function (Blueprint $table) {
            $table->string('cover_layout')->default('centered')->after('font_pair');
            $table->string('card_style')->default('soft')->after('cover_layout');
            $table->string('button_style')->default('rounded')->after('card_style');
            $table->string('decoration_style')->default('arches')->after('button_style');
            $table->string('background_path')->nullable()->after('banner_position');
            $table->string('background_fill')->default('cover')->after('background_path');
            $table->string('background_position')->default('center')->after('background_fill');
            $table->string('background_overlay')->default('light')->after('background_position');
            $table->unsignedTinyInteger('background_overlay_opacity')->default(20)->after('background_overlay');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_themes', function (Blueprint $table) {
            $table->dropColumn([
                'cover_layout', 'card_style', 'button_style', 'decoration_style',
                'background_path', 'background_fill', 'background_position',
                'background_overlay', 'background_overlay_opacity',
            ]);
        });
    }
};
