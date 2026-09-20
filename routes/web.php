<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('dashboard/events', [EventController::class, 'index'])->name('events.index');
    Route::get('dashboard/events/{event}', [EventController::class, 'show'])->name('events.show');
});

Route::middleware(['auth', 'active', 'administrator'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
