<?php

namespace App\Http\Controllers;

use App\Models\Recognition;
use App\Models\RecognitionLike;
use App\Http\Requests\StoreRecognitionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RecognitionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $bioid = $user->bioid ?? $user->bio_id ?? Auth::id();

        $recognitions = Recognition::withCount('likes')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Attach liked_by_current_user to each recognition
        $recognitions = $recognitions->map(function ($recognition) use ($bioid) {
            $recognition->liked_by_current_user = $recognition->isLikedByUser($bioid);
            return $recognition;
        });

        return Inertia::render('modules/recognition', [
            'recognitions' => $recognitions,
            'currentUser' => $user ? ($user->name ?? ($user->firstname . ' ' . $user->lastname ?? '')) : '',
            'currentDepartment' => $user->department ?? $user->SectionName ?? '',
        ]);
    }

    public function store(StoreRecognitionRequest $request)
    {
        $user = Auth::user();
        $senderName = $user->name ?? ($user->firstname . ' ' . $user->lastname ?? 'Anonymous');
        $senderDepartment = $user->department ?? $user->SectionName ?? '';

        Recognition::create([
            'sender_name' => $senderName,
            'sender_department' => $senderDepartment,
            'recipient_name' => $request->recipient_name,
            'recipient_department' => $request->recipient_department,
            'message' => $request->message,
        ]);

        return redirect()->back()->with('success', 'Recognition posted!');
    }

    public function like(Recognition $recognition)
    {
        $user = Auth::user();
        $bioid = $user->bioid ?? $user->bio_id ?? Auth::id();

        $existingLike = RecognitionLike::where('recognition_id', $recognition->id)
            ->where('bioid', $bioid)
            ->first();

        if ($existingLike) {
            // Unlike
            $existingLike->delete();
        } else {
            // Like
            RecognitionLike::create([
                'recognition_id' => $recognition->id,
                'bioid' => $bioid,
            ]);
        }

        return redirect()->back();
    }

    public function destroy(Recognition $recognition)
    {
        $user = Auth::user();
        $senderName = $user->name ?? ($user->firstname . ' ' . $user->lastname ?? '');

        if ($recognition->sender_name !== $senderName) {
            abort(403, 'You can only delete your own recognitions.');
        }

        $recognition->delete();

        return redirect()->back()->with('success', 'Recognition deleted.');
    }
}