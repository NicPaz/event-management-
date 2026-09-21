<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\SuspendedEventController as AdminSuspendedEventController;
use App\Http\Controllers\Admin\SuspendedUserController as AdminSuspendedUserController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BrandGalleryController;
use App\Http\Controllers\ClosedEventController;
use App\Http\Controllers\EventAppearanceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventCreationController;
use App\Http\Controllers\EventGuestController;
use App\Http\Controllers\EventThemeController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\GiftReservationController;
use App\Http\Controllers\GuestAttendanceController;
use App\Http\Controllers\GuestIdentityController;
use App\Http\Controllers\GuestParticipationController;
use App\Http\Controllers\OrganizerGiftController;
use App\Http\Controllers\OrganizerGuestController;
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
    Route::get('brand-gallery', BrandGalleryController::class)->name('brand.gallery');
    Route::get('dashboard/events/{event}/preview', [PublicEventController::class, 'preview'])->name('events.preview');
    Route::get('dashboard/events/{event}/creation/finalization', [EventCreationController::class, 'show'])->name('events.creation.show');
    Route::post('dashboard/events/{event}/creation/finalization', [EventCreationController::class, 'store'])->name('events.creation.store');
    Route::get('dashboard/events/{event}/creation/complete', [EventCreationController::class, 'complete'])->name('events.creation.complete');
    Route::get('dashboard/events/{event}/appearance', [EventAppearanceController::class, 'edit'])->name('events.appearance.edit');
    Route::post('dashboard/events/{event}/appearance', [EventAppearanceController::class, 'update'])->name('events.appearance.update');
    Route::post('dashboard/events/{event}/appearance/theme', [EventThemeController::class, 'update'])->name('events.appearance.theme.update');
    Route::get('dashboard/gifts', OrganizerGiftController::class)->name('gifts.index');
    Route::get('dashboard/guests', OrganizerGuestController::class)->name('guests.index');
    Route::post('dashboard/events/{event}/publication', [PublishedEventController::class, 'store'])->name('events.publication.store');
    Route::post('dashboard/events/{event}/closure', [ClosedEventController::class, 'store'])->name('events.closure.store');
    Route::delete('dashboard/events/{event}/closure', [ClosedEventController::class, 'destroy'])->name('events.closure.destroy');
    Route::get('dashboard/events/{event}/gifts', [GiftController::class, 'index'])->name('events.gifts.index');
    Route::post('dashboard/events/{event}/gifts', [GiftController::class, 'store'])->name('events.gifts.store');
    Route::patch('dashboard/events/{event}/gifts/{gift}', [GiftController::class, 'update'])->name('events.gifts.update');
    Route::delete('dashboard/events/{event}/gifts/{gift}', [GiftController::class, 'destroy'])->name('events.gifts.destroy');
    Route::get('dashboard/events/{event}/guests', [EventGuestController::class, 'index'])->name('events.guests.index');
    Route::patch('dashboard/events/{event}/guests/{guest}', [EventGuestController::class, 'update'])
        ->scopeBindings()
        ->name('events.guests.update');
    Route::resource('dashboard/events', EventController::class)->names('events');
});

Route::middleware(['auth', 'active', 'administrator'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('users/{user}/suspension', [AdminSuspendedUserController::class, 'store'])->name('users.suspension.store');
    Route::delete('users/{user}/suspension', [AdminSuspendedUserController::class, 'destroy'])->name('users.suspension.destroy');
    Route::get('events', [AdminEventController::class, 'index'])->name('events.index');
    Route::post('events/{event}/suspension', [AdminSuspendedEventController::class, 'store'])->name('events.suspension.store');
    Route::delete('events/{event}/suspension', [AdminSuspendedEventController::class, 'destroy'])->name('events.suspension.destroy');
});

require __DIR__.'/settings.php';
