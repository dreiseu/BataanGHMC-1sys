<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DirectoryEntry;

class DirectoryEntrySeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            ['department' => 'Accounting IP', 'local_no' => '6904', 'section' => 'BataanGHMC'],
            ['department' => 'ER Office', 'local_no' => '6071', 'section' => 'BataanGHMC'],
            ['department' => 'Laboratory', 'local_no' => '5201', 'section' => 'BataanGHMC'],
            ['department' => 'PHU', 'local_no' => '6088', 'section' => 'BataanGHMC'],
            ['department' => 'Telemed Hub', 'local_no' => '6081', 'section' => 'BataanGHMC'],
        ];

        foreach ($entries as $entry) {
            DirectoryEntry::create($entry);
        }
    }
}
