<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class NasStorage
{
    public static function basePath(): string
    {
        $host = env('NAS_HOST');
        $share = env('NAS_SHARE');
        $folder = env('NAS_FOLDER');

        return "\\\\{$host}\\{$share}\\{$folder}";
    }

    public static function path(string $relativePath): string
    {
        return self::basePath() . '\\' . str_replace('/', '\\', $relativePath);
    }

    public static function store(UploadedFile $file, string $folder): ?string
    {
        $filename = $file->hashName();
        $relativePath = $folder . '/' . $filename;

        $targetDir = self::path($folder);
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        $copied = copy($file->getPathname(), self::path($relativePath));

        return $copied ? $relativePath : null;
    }

    public static function exists(string $relativePath): bool
    {
        return file_exists(self::path($relativePath));
    }

    public static function delete(string $relativePath): bool
    {
        return @unlink(self::path($relativePath));
    }
}
