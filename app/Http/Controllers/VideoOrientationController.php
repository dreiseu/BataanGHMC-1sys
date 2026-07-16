<?php

namespace App\Http\Controllers;

use App\Models\VideoOrientation;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VideoOrientationController extends Controller
{
    public function index()
    {
        $videos = Cache::remember('video_orientations_all', 3600, function () {
            return VideoOrientation::orderBy('sort_order')->orderBy('created_at', 'desc')->get()->values()->toArray();
        });
        return Inertia::render('utilities/video-orientations', [
            'entries' => $videos
        ]);
    }

    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'embed_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimetypes:video/mp4,video/x-m4v,video/*|max:512000', // 500MB max
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $maxSortOrder = VideoOrientation::max('sort_order') ?? 0;

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'embed_url' => $validated['embed_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $maxSortOrder + 1,
        ];

        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('videos', 'public');
            $data['video_path'] = $path;
        }

        $video = VideoOrientation::create($data);

        $auditLog->log(
            action: 'created',
            auditableType: 'video_orientation',
            auditableId: (string) $video->id,
            auditableLabel: $video->title,
            newValues: $video->toArray(),
        );

        Cache::forget('video_orientations_all');
        return redirect()->back()->with('success', 'Video orientation added successfully.');
    }

    public function update(Request $request, VideoOrientation $videoOrientation, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'embed_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimetypes:video/mp4,video/x-m4v,video/*|max:512000',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $oldValues = $videoOrientation->toArray();

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'embed_url' => $validated['embed_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ];

        if ($request->hasFile('video_file')) {
            // Delete old video if it exists
            if ($videoOrientation->video_path && Storage::disk('public')->exists($videoOrientation->video_path)) {
                Storage::disk('public')->delete($videoOrientation->video_path);
            }
            
            $path = $request->file('video_file')->store('videos', 'public');
            $data['video_path'] = $path;
        }

        $videoOrientation->update($data);
        $videoOrientation->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'video_orientation',
            auditableId: (string) $videoOrientation->id,
            auditableLabel: $videoOrientation->title,
            oldValues: $oldValues,
            newValues: $videoOrientation->toArray(),
        );

        Cache::forget('video_orientations_all');
        return redirect()->back()->with('success', 'Video orientation updated successfully.');
    }

    public function destroy(VideoOrientation $videoOrientation, AuditLogService $auditLog)
    {
        $oldValues = $videoOrientation->toArray();
        $label = $videoOrientation->title;
        $id = (string) $videoOrientation->id;

        if ($videoOrientation->video_path && Storage::disk('public')->exists($videoOrientation->video_path)) {
            Storage::disk('public')->delete($videoOrientation->video_path);
        }
        
        $videoOrientation->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'video_orientation',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        Cache::forget('video_orientations_all');
        return redirect()->back()->with('success', 'Video orientation deleted successfully.');
    }

    public function reorder(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:video_orientations,id'
        ]);

        foreach ($validated['ordered_ids'] as $index => $id) {
            VideoOrientation::where('id', $id)->update(['sort_order' => $index]);
        }

        $auditLog->log(
            action: 'reordered',
            auditableType: 'video_orientation',
            auditableLabel: 'Video Orientations',
            newValues: ['ordered_ids' => $validated['ordered_ids']],
        );

        Cache::forget('video_orientations_all');
        return redirect()->back()->with('success', 'Video order updated successfully.');
    }
}
