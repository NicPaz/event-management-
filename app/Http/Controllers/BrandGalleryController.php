<?php

namespace App\Http\Controllers;

use App\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandGalleryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless(
            app()->isLocal() || $request->user()?->role === UserRole::Administrator,
            403,
        );

        return Inertia::render('brand-gallery');
    }
}
