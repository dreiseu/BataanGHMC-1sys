<style>
    body { font-family: Helvetica, Arial, sans-serif; font-size: 8pt; }
    h1 { text-align: center; font-size: 20pt; margin: 0; padding: 0; font-weight: bold; }
    table { width: 100%; }
    th { font-weight: bold; text-align: center; padding: 6px; font-size: 8.5pt; line-height: 10pt; color: #000000; }
    td { padding: 5px; font-size: 7.5pt; line-height: 9.5pt; }
    .header-table { width: 100%; border-bottom: 2px solid #000; margin-bottom: 5px; margin-top: 10px; padding-bottom: 14px; }
    .header-table td { border: none; }
    .section-title { font-weight: bold; font-size: 16pt; text-align: center; text-transform: uppercase; }
    .main-border { border: none; padding: 0px; height: 100%; }
    .trunk-lines td { border: none; font-size: 7pt; font-weight: bold; }
</style>

<div class="main-border">
    <table class="header-table">
        <tr>
            <!-- Logos (Left) -->
            <td width="12%" valign="middle" style="text-align: left; vertical-align: middle;"><img src="{{ base_path('resources/images/DOH.jpg') }}" width="60"></td>
            <td width="12%" valign="middle" style="text-align: left; vertical-align: middle;"><img src="{{ base_path('resources/images/BGHMC.jpg') }}" width="60"></td>
            
            <!-- Hospital Information (Center) -->
            <td width="60%" valign="middle" style="text-align: center; font-size: 11pt; vertical-align: middle;">
                <div style="font-size: 8px; line-height: 6px;">&nbsp;</div>
                <strong>BATAAN GENERAL HOSPITAL AND MEDICAL CENTER</strong><br>
                <span style="font-size: 9pt;">Balanga City, Bataan</span><br>
                <span style="font-size: 9.5pt;">ISO-QMS 9001:2015 Certified</span>
            </td>
            
            <!-- Logo (Right) -->
            <td width="12%" valign="middle" style="text-align: right; vertical-align: middle;"><img src="{{ base_path('resources/images/Bagong_Pilipinas_logo.jpg') }}" width="110"></td>
        </tr>
    </table>
 
    <!-- Main Title -->
    <div style="font-size: 2px; line-height: 0;">&nbsp;</div>
    <div style="text-align: center; font-size: 20pt; font-weight: bold; line-height: 22pt; margin: 0; padding: 0;">BGHMC Telephone Directory {{ $currentYear }}</div>
    <div style="font-size: 8px; line-height: 2px;">&nbsp;</div>

    <!-- Sub-header Details -->
    <table style="width: 100%; border: none; margin-top: 0px; margin-bottom: 0px;">
        <tr>
            <td style="border: none; text-align: left; font-size: 8pt; font-style: italic;">Updated as of: {{ $currentDate }}</td>
            <td style="border: none; text-align: right; font-size: 8pt; font-style: italic; ">**Created by: IMISS {{ $currentYear }}</td>
        </tr>
    </table>
    <div style="font-size: 12pt; line-height: 4pt;">&nbsp;</div>

    <!-- BataanGHMC Directory -->
    @if(count($chunkBataan) > 0)
        <table cellspacing="0" cellpadding="2.5">
            <thead>
                <tr>
                    @for($i=0; $i<3; $i++)
                        <th width="23.6%" bgcolor="#DDEBF7" style="border-top: 2px solid #000000; border-left: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center;">Department/Ward/Office</th>
                        <th width="9%" bgcolor="#DDEBF7" style="border-top: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center;">Local&nbsp;No.</th>
                        @if($i < 2)
                            <td width="1.1%" style="border: none;"></td>
                        @endif
                    @endfor
                </tr>
            </thead>
            @php $maxRows = max(count($chunkBataan[0] ?? []), count($chunkBataan[1] ?? []), count($chunkBataan[2] ?? [])); @endphp
            @for($row=0; $row < $maxRows; $row++)
                <tr nobr="true">
                    @for($col=0; $col<3; $col++)
                        @if(isset($chunkBataan[$col][$row]))
                            <td width="23.6%" style="border-left: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: left; text-transform: uppercase;">{{ $chunkBataan[$col][$row]->department }}</td>
                            <td width="9%" style="border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center; font-weight: bold; white-space: nowrap;">{{ $chunkBataan[$col][$row]->local_no }}</td>
                        @else
                            <td width="23.6%" style="border: none;"></td>
                            <td width="9%" style="border: none;"></td>
                        @endif
                        @if($col < 2)
                            <td width="1.1%" style="border: none;"></td>
                        @endif
                    @endfor
                </tr>
            @endfor
        </table>
    @endif

    <!-- BUCAS Directory -->
    @if(count($chunkBucas) > 0)
        <br>
        <div style="border-bottom: 2px dashed #000;"></div>
        <div class="section-title">BUCAS CENTER<br><span style="font-size: 9pt; font-style: italic; font-weight: normal;">Bagong Urgent Care and Ambulatory Services</span></div>
        <table cellspacing="0" cellpadding="2.5">
            <thead>
                <tr>
                    @for($i=0; $i<3; $i++)
                        <th width="23.6%" bgcolor="#DDEBF7" style="border-top: 2px solid #000000; border-left: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center;">Department/Ward/Office</th>
                        <th width="9%" bgcolor="#DDEBF7" style="border-top: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center;">Local&nbsp;No.</th>
                        @if($i < 2)
                            <td width="1.1%" style="border: none;"></td>
                        @endif
                    @endfor
                </tr>
            </thead>
            @php $maxRows = max(count($chunkBucas[0] ?? []), count($chunkBucas[1] ?? []), count($chunkBucas[2] ?? [])); @endphp
            @for($row=0; $row < $maxRows; $row++)
                <tr nobr="true">
                    @for($col=0; $col<3; $col++)
                        @if(isset($chunkBucas[$col][$row]))
                            <td width="23.6%" style="border-left: 2px solid #000000; border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: left; text-transform: uppercase;">{{ $chunkBucas[$col][$row]->department }}</td>
                            <td width="9%" style="border-right: 2px solid #000000; border-bottom: 2px solid #000000; text-align: center; font-weight: bold; white-space: nowrap;">{{ $chunkBucas[$col][$row]->local_no }}</td>
                        @else
                            <td width="23.6%" style="border: none;"></td>
                            <td width="9%" style="border: none;"></td>
                        @endif
                        @if($col < 2)
                            <td width="1.1%" style="border: none;"></td>
                        @endif
                    @endfor
                </tr>
            @endfor
        </table>
    @endif
    <!-- Trunk Lines -->
    <div style="font-size: 5pt; line-height: 15pt;">&nbsp;</div>
    <table class="trunk-lines" cellspacing="0" cellpadding="2" style="width: 100%; border-top: 1.5px solid #000000;">
        <tr>
            <td width="43%" style="text-align: left; padding-left: 2px;">BGHMC TRUNK LINES: {{ $trunkLines['bghmc'] }}</td>
            <td width="14%" style="text-align: center;">&nbsp;</td>
            <td width="43%" style="text-align: right; padding-right: 2px;">BUCAS TRUNK LINES: {{ $trunkLines['bucas'] }}</td>
        </tr>
    </table>
</div>
