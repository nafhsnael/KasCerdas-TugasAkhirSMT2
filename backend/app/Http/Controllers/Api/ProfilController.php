<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
class ProfilController extends Controller
{
    /**
     * Get user profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'user_type' => $user->user_type,
                'is_active' => $user->is_active,
                'phone' => $user->phone ?? '',
                'address' => $user->address ?? '',
                'profileImage' => $user->avatar,
            ]
        ]);
    }

    /**
     * Update user profile.
     */
    
    /**
    * Update user profile.
    */
/**
 * Update user profile.
 */
    public function update(Request $request)
    {
        Log::info('Payload Masuk Profil:', $request->all());
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'username' => 'required|string|max:50|unique:users,username,' . $user->id,
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'user_type' => 'nullable|string|in:umkm,masyarakat_umum,mahasiswa,masyarakat',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'avatar' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            if ($request->has('name')) {
                $user->name = $request->input('name');
            }
            if ($request->has('username')) {
                $user->username = $request->input('username');
            }
            if ($request->has('email')) {
                $user->email = $request->input('email');
            }
            if ($request->has('user_type')) {
                $user->user_type = $request->input('user_type');
            }
            if ($request->has('phone')) {
                $user->phone = $request->input('phone');
            }
            if ($request->has('address')) {
                $user->address = $request->input('address');
            }

            if ($request->has('avatar')) {
                $avatarData = $request->input('avatar');
                if ($avatarData && preg_match('/^data:image\/(\w+);base64,/', $avatarData, $type)) {
                    $base64Data = substr($avatarData, strpos($avatarData, ',') + 1);
                    $ext = strtolower($type[1]);
                    if (in_array($ext, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                        $decoded = base64_decode($base64Data);
                        if ($decoded !== false) {
                            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $ext;
                            $path = public_path('avatars/' . $filename);
                            if (!file_exists(public_path('avatars'))) {
                                mkdir(public_path('avatars'), 0755, true);
                            }
                            file_put_contents($path, $decoded);
                            
                            // Construct absolute url to frontend
                            $user->avatar = url('avatars/' . $filename);
                        }
                    }
                } elseif (empty($avatarData)) {
                    // Only clear avatar if the frontend sent an empty string explicitly
                    // If it sends the existing URL, it won't match base64 regex and won't be empty, so it's kept.
                    $user->avatar = null;
                }
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                    'user_type' => $user->user_type,
                    'is_active' => $user->is_active,
                    'phone' => $user->phone ?? '',
                    'address' => $user->address ?? '',
                    'avatar' => $user->avatar ?? null,
                    'profileImage' => $user->avatar ?? null,
                ]
            ], 200);
        } catch (\Throwable $e) {
            Log::error('CRASH TOTAL PROFIL 500: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal server',
                'error_system' => $e->getMessage()
            ], 500);
        }
    }
}
