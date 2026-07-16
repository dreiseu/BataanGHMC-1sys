<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\UserAuthority::where('BiometricID', '5467')->first();

if (!$user) {
    echo "User 5467 not found in UserAuthority\n";
    exit;
}

// We need to simulate the soap_user_data session
$sessionData = [
    'bioid' => '5467',
    'password' => 'Password1'
];

$modules = ['/dashboard', '/petro', '/events', '/imiss', '/hr-portal'];

foreach ($modules as $module) {
    $request = Illuminate\Http\Request::create($module, 'GET');
    $request->setSession($app->make('session')->driver());
    $request->session()->put('soap_user_data', $sessionData);
    // Pretend to be an Inertia request
    $request->headers->set('X-Inertia', 'true');
    
    $start = microtime(true);
    $response = $kernel->handle($request);
    $time = microtime(true) - $start;
    
    echo "Module: $module | Status: {$response->getStatusCode()} | Time: " . round($time, 4) . "s\n";
}

