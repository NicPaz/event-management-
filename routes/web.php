<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\ClosedEventController;
use App\Http\Controllers\EventAppearanceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GiftReservationController;
use App\Http\Controllers\GuestAttendanceController;
use App\Http\Controllers\GuestIdentityController;
use App\Http\Controllers\GuestParticipationController;
use App\Http\Controllers\PublicEventController;
use App\Http\Controllers\PublishedEventController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('e/{event:slug}', PublicEventController::class)->name('public.events.show');
Route::get('e/{event:slug}/participacao', GuestParticipationController::class)->name('public.events.participation');
Route::post('e/{event:slug}/participacao/identificacao', [GuestIdentityController::class, 'store'])
    ->middleware('throttle:guest-identification')
    ->name('public.events.identity.store')
    ->block();
Route::delete('e/{event:slug}/participacao/identificacao', [GuestIdentityController::class, 'destroy'])
    ->name('public.events.identity.destroy')
    ->block();
Route::patch('e/{event:slug}/participacao/presenca', [GuestAttendanceController::class, 'update'])
    ->name('public.events.attendance.update')
    ->block();
Route::delete('e/{event:slug}/participacao/presenca', [GuestAttendanceController::class, 'destroy'])
    ->name('public.events.attendance.destroy')
    ->block();
Route::patch('e/{event:slug}/presentes/{gift}/reserva', [GiftReservationController::class, 'update'])
    ->name('public.events.gifts.reservation.update');
Route::delete('e/{event:slug}/presentes/{gift}/reserva', [GiftReservationController::class, 'destroy'])
    ->name('public.events.gifts.reservation.destroy');

Route::middleware(['auth', 'active'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('dashboard/events/{event}/preview', [PublicEventController::class, 'preview'])->name('events.preview');
    Route::get('dashboard/events/{event}/appearance', [EventAppearanceController::class, 'edit'])->name('events.appearance.edit');
    Route::post('dashboard/events/{event}/appearance', [EventAppearanceController::class, 'update'])->name('events.appearance.update');
    Route::post('dashboard/events/{event}/publication', [PublishedEventController::class, 'store'])->name('events.publication.store');
    Route::post('dashboard/events/{event}/closure', [ClosedEventController::class, 'store'])->name('events.closure.store');
    Route::delete('dashboard/events/{event}/closure', [ClosedEventController::class, 'destroy'])->name('events.closure.destroy');
    Route::get('dashboard/events/{event}/gifts', [GiftController::class, 'index'])->name('events.gifts.index');
    Route::post('dashboard/events/{event}/gifts', [GiftController::class, 'store'])->name('events.gifts.store');
    Route::patch('dashboard/events/{event}/gifts/{gift}', [GiftController::class, 'update'])->name('events.gifts.update');
    Route::delete('dashboard/events/{event}/gifts/{gift}', [GiftController::class, 'destroy'])->name('events.gifts.destroy');
    Route::resource('dashboard/events', EventController::class)->names('events');
});

Route::middleware(['auth', 'active', 'administrator'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
