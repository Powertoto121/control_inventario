<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\MermaController;
use App\Http\Controllers\Api\UserController;

// Autenticación
Route::post('/login', [AuthController::class, 'login']);

// Productos e Inventario (CRUD)
Route::get('/productos', [ProductoController::class, 'index']);
Route::post('/productos', [ProductoController::class, 'store']);
Route::put('/productos/{id}', [ProductoController::class, 'update']);
Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);

// Mermas y Catálogo
Route::get('/catalogo-mermas', [MermaController::class, 'catalogo']);
Route::get('/mermas', [MermaController::class, 'index']);
Route::post('/mermas', [MermaController::class, 'store']);

// Usuarios / Gestión de Personal
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);