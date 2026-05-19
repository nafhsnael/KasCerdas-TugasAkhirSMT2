<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'user_type' => ['nullable', 'in:umkm,masyarakat_umum,mahasiswa'],
        ]);

        $user = User::create([
            'name' => $validated['name'] ?? Str::title($validated['username']),
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'user_type' => $validated['user_type'] ?? null,
            'is_active' => true,
        ]);

        $token = $user->createToken('kas-cerdas')->plainTextToken;

        // Log Activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Register',
            'model_type' => User::class,
            'model_id' => $user->id,
            'ip_address' => $request->ip(),
            'level' => 'info',
            'data' => ['email' => $user->email, 'user_type' => $user->user_type],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Register berhasil',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'user_type' => $user->user_type,
                ],
            ],
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required_without:email', 'string'],
            'email' => ['required_without:username', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = $request->input('username') ?? $request->input('email');
        $loginField = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginField, $loginInput)->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            // Log failed login attempt
            ActivityLog::create([
                'action' => 'Failed Login Attempt',
                'ip_address' => $request->ip(),
                'level' => 'warning',
                'data' => ['login_input' => $loginInput],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Username/Email atau password salah',
            ], 401);
        }

        if (!$user->is_active) {
            // Log suspended user login attempt
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'Blocked Login Attempt (Inactive)',
                'ip_address' => $request->ip(),
                'level' => 'warning',
                'data' => ['email' => $user->email],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi admin.',
            ], 403);
        }

        $token = $user->createToken('kas-cerdas')->plainTextToken;

        // Log successful login
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Login',
            'model_type' => User::class,
            'model_id' => $user->id,
            'ip_address' => $request->ip(),
            'level' => 'info',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'user_type' => $user->user_type,
                ],
            ],
        ]);
    }

    /**
     * Logout.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            // Log logout
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'Logout',
                'model_type' => User::class,
                'model_id' => $user->id,
                'ip_address' => $request->ip(),
                'level' => 'info',
            ]);

            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Me (Profile data).
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
            ],
        ]);
    }
}
