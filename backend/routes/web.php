<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'name' => 'FieldSyncLedger API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});
