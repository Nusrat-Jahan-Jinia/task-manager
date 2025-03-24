<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskSearchController;

// Auth routes
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/user', [AuthController::class, 'user']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);

    // Task search routes (must be before resource routes)
    Route::get('tasks/search', [TaskSearchController::class, 'search']);
    Route::get('tasks/stats', [TaskSearchController::class, 'stats']);
    Route::get('tasks/timeline', [TaskSearchController::class, 'timeline']);

    // Task resource routes
    Route::apiResource('tasks', TaskController::class);
}); 