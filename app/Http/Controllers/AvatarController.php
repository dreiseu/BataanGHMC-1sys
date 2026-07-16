<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Cache;

class AvatarController extends Controller
{
    /**
     * Display the specified avatar.
     */
    public function show($bioid)
    {
        // Release the session lock immediately so concurrent requests can run in parallel
        session_write_close();

        try {
            // Cache the base64-encoded employee photo for 24 hours to prevent slow queries on the hris database connection
            $photoBase64 = Cache::remember("avatar_photo_{$bioid}", 86400, function () use ($bioid) {
                $photo = DB::connection('hris')->table('tblEmployee')->where('bioID', $bioid)->value('photo');
                return $photo ? base64_encode($photo) : 'NO_PHOTO';
            });

            if ($photoBase64 && $photoBase64 !== 'NO_PHOTO') {
                return Response::make(base64_decode($photoBase64), 200, [
                    'Content-Type' => 'image/png',
                    'Cache-Control' => 'public, max-age=86400', // Cache for 1 day
                ]);
            }
        } catch (\Exception $e) {
            // Ignore DB errors and return default
        }

        // Return a default transparent 1x1 pixel if no photo is found
        return Response::make(base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='), 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}

