<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_themes', function (Blueprint $table) {
            $table->string('title_font')->default('classic')->after('font_pair');
            $table->string('body_font')->default('modern')->after('title_font');
        });

        DB::table('event_themes')->update([
            'title_font' => DB::raw('font_pair'),
            'body_font' => DB::raw('font_pair'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_themes', function (Blueprint $table) {
            $table->dropColumn(['title_font', 'body_font']);
        });
    }
};
