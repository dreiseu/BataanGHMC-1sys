<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('directory_entries')) {
            return;
        }

        $connection = Schema::getConnection();

        if ($connection->getDriverName() !== 'sqlsrv') {
            return;
        }

        $result = $connection->selectOne(
            "SELECT COLUMNPROPERTY(OBJECT_ID('directory_entries'), 'id', 'IsIdentity') AS is_identity"
        );

        if ((int) ($result->is_identity ?? 0) === 1) {
            return;
        }

        $hasIsActive = Schema::hasColumn('directory_entries', 'is_active');
        $isActiveSelect = $hasIsActive ? 'is_active' : 'CAST(1 AS BIT)';

        DB::unprepared("
            IF OBJECT_ID('directory_entries_identity_fix', 'U') IS NOT NULL
                DROP TABLE directory_entries_identity_fix;

            CREATE TABLE directory_entries_identity_fix (
                id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                department NVARCHAR(255) NOT NULL,
                local_no NVARCHAR(20) NOT NULL,
                section NVARCHAR(255) NOT NULL CONSTRAINT DF_directory_entries_section DEFAULT 'BataanGHMC',
                is_active BIT NOT NULL CONSTRAINT DF_directory_entries_is_active DEFAULT 1,
                sort_order INT NOT NULL CONSTRAINT DF_directory_entries_sort_order DEFAULT 0,
                created_at DATETIME2 NULL,
                updated_at DATETIME2 NULL
            );

            SET IDENTITY_INSERT directory_entries_identity_fix ON;

            INSERT INTO directory_entries_identity_fix (
                id, department, local_no, section, is_active, sort_order, created_at, updated_at
            )
            SELECT
                id,
                department,
                local_no,
                section,
                {$isActiveSelect},
                ISNULL(sort_order, 0),
                created_at,
                updated_at
            FROM directory_entries;

            SET IDENTITY_INSERT directory_entries_identity_fix OFF;

            DECLARE @maxId BIGINT;
            SELECT @maxId = ISNULL(MAX(id), 0) FROM directory_entries_identity_fix;
            DBCC CHECKIDENT ('directory_entries_identity_fix', RESEED, @maxId);

            DROP TABLE directory_entries;
            EXEC sp_rename 'directory_entries_identity_fix', 'directory_entries';
        ");
    }

    public function down(): void
    {
        // Intentionally left empty to avoid dropping shared directory data.
    }
};
