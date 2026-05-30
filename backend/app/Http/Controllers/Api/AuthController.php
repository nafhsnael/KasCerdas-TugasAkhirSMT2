<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect user to Google login page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle Google callback.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $googleId = $googleUser->getId();
            $googleName = $googleUser->getName();
            $googleEmail = $googleUser->getEmail();
            $googleAvatar = $googleUser->getAvatar();

            if (!$googleEmail) {
                return redirect()->away($this->frontendUrl() . '/login?error=google_email_not_found');
            }

            $user = User::where('google_id', $googleId)
                ->orWhere('email', $googleEmail)
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleName ?: 'User Google',
                    'username' => $this->generateUniqueUsername($googleEmail, $googleName),
                    'email' => $googleEmail,
                    'password' => Hash::make(Str::random(32)),
                    'google_id' => $googleId,
                    'avatar' => $googleAvatar,
                    'role' => 'user',
                    'user_type' => null,
                    'is_active' => true,
                ]);

                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'Register with Google',
                    'model_type' => User::class,
                    'model_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'level' => 'info',
                    'data' => [
                        'email' => $user->email,
                        'google_id' => $googleId,
                    ],
                ]);
            } else {
                if (!$user->google_id) {
                    $user->google_id = $googleId;
                }

                if (!$user->avatar && $googleAvatar) {
                    $user->avatar = $googleAvatar;
                }

                if (!$user->name && $googleName) {
                    $user->name = $googleName;
                }

                $user->save();
            }

            if (!$user->is_active) {
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'Blocked Google Login Attempt (Inactive)',
                    'model_type' => User::class,
                    'model_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'level' => 'warning',
                    'data' => ['email' => $user->email],
                ]);

                return redirect()->away($this->frontendUrl() . '/login?error=inactive');
            }

            $token = $user->createToken('kas-cerdas')->plainTextToken;

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'Login with Google',
                'model_type' => User::class,
                'model_id' => $user->id,
                'ip_address' => $request->ip(),
                'level' => 'info',
                'data' => ['email' => $user->email],
            ]);

            return redirect()->away(
                $this->frontendUrl() . '/auth/google/callback?token=' . urlencode($token)
            );
        } catch (\Throwable $e) {
            ActivityLog::create([
                'action' => 'Google Login Failed',
                'ip_address' => $request->ip(),
                'level' => 'error',
                'data' => [
                    'message' => $e->getMessage(),
                ],
            ]);

            return redirect()->away($this->frontendUrl() . '/login?error=google_failed');
        }
    }

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
                    'is_active' => $user->is_active,
                    'avatar' => $user->avatar ?? null,
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
                    'is_active' => $user->is_active,
                    'avatar' => $user->avatar ?? null,
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
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
                'avatar' => $user->avatar ?? null,
            ],
        ]);
    }

    /**
     * Generate username for Google account.
     */
    private function generateUniqueUsername(string $email, ?string $name = null): string
    {
        $base = Str::slug($name ?: Str::before($email, '@'), '_');

        if (!$base) {
            $base = 'user';
        }

        $username = Str::limit($base, 40, '');
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = Str::limit($base, 35, '') . '_' . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Get frontend URL.
     */
    private function frontendUrl(): string
    {
        return rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
    }
}