<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('id', 'asc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'nombre' => $u->name,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'password' => $u->remember_token ?? '1234',
                'rol' => $u->rol === 'administrador' ? 'admin' : $u->rol,
                'turno' => 'Completo',
                'activo' => (bool) ($u->activo ?? true),
                'fechaAlta' => $u->created_at ? $u->created_at->format('Y-m-d') : '2026-01-01',
            ];
        });

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users,username',
            'password' => 'required',
        ]);

        $rolDb = ($request->rol === 'admin' || $request->rol === 'administrador') ? 'administrador' : 'cajero';

        $user = User::create([
            'name' => $request->nombre ?? $request->name ?? 'Empleado',
            'username' => $request->username,
            'email' => $request->email ?? ($request->username . '@latiendita.com'),
            'password' => $request->password,
            'remember_token' => $request->password,
            'rol' => $rolDb,
            'activo' => $request->has('activo') ? (bool) $request->activo : true,
        ]);

        return response()->json([
            'message' => 'Usuario creado con éxito',
            'user' => $user
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = [];

        if ($request->has('nombre') || $request->has('name')) {
            $data['name'] = $request->nombre ?? $request->name;
        }

        if ($request->has('username')) {
            $data['username'] = $request->username;
        }

        if ($request->has('rol')) {
            $data['rol'] = ($request->rol === 'admin' || $request->rol === 'administrador') ? 'administrador' : 'cajero';
        }

        if ($request->has('activo')) {
            $data['activo'] = filter_var($request->activo, FILTER_VALIDATE_BOOLEAN);
        }

        if (!empty($request->password)) {
            $data['password'] = $request->password;
            $data['remember_token'] = $request->password;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuario actualizado',
            'user' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}