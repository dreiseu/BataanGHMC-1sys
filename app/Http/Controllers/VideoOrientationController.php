<?php

namespace App\Http\Controllers;

use App\Models\VideoOrientation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VideoOrientationController extends Controller
{
    public function index()
    {
        $videos = VideoOrientation::orderBy('sort_order')->orderBy('created_at', 'desc')->get();
        return Inertia::render('utilities/video-orientations', [
            'entries' => $videos
        ]);
    }

    public function store(Request $request)
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

        VideoOrientation::create($data);

        return redirect()->back()->with('success', 'Video orientation added successfully.');
    }

    public function update(Request $request, VideoOrientation $videoOrientation)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'embed_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimetypes:video/mp4,video/x-m4v,video/*|max:512000',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

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

        return redirect()->back()->with('success', 'Video orientation updated successfully.');
    }

    public function destroy(VideoOrientation $videoOrientation)
    {
        if ($videoOrientation->video_path && Storage::disk('public')->exists($videoOrientation->video_path)) {
            Storage::disk('public')->delete($videoOrientation->video_path);
        }
        
        $videoOrientation->delete();

        return redirect()->back()->with('success', 'Video orientation deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:video_orientations,id'
        ]);

        foreach ($validated['ordered_ids'] as $index => $id) {
            VideoOrientation::where('id', $id)->update(['sort_order' => $index]);
        }

        return redirect()->back()->with('success', 'Video order updated successfully.');
    }
}
