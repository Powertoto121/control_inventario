<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || ($request->password !== $user->password && !Hash::check($request->password, $user->password))) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        return response()->json([
            'message' => 'Bienvenido al sistema',
            'user' => $user
        ]);
    }
}