<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SystemConfigController extends Controller
{
    /**
     * System configuration keys yang bisa diatur
     */
    private const ALLOWED_CONFIG_KEYS = [
        'app_name',
        'max_file_upload_size',
        'transaction_limit_per_day',
        'require_email_verification',
        'two_factor_enabled',
        'api_rate_limit',
        'session_timeout',
        'notification_email',
        'backup_frequency',
    ];

    /**
     * GET /api/admin/config
     * Ambil semua system configuration.
     */
    public function index()
    {
        $configs = [];

        foreach (self::ALLOWED_CONFIG_KEYS as $key) {
            $configs[$key] = Cache::get('config_' . $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi sistem berhasil diambil',
            'data' => $configs
        ]);
    }

    /**
     * GET /api/admin/config/{key}
     * Ambil nilai konfigurasi tertentu.
     */
    public function show($key)
    {
        if (!in_array($key, self::ALLOWED_CONFIG_KEYS)) {
            return response()->json([
                'success' => false,
                'message' => 'Configuration key tidak ditemukan',
            ], 404);
        }

        $value = Cache::get('config_' . $key);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi berhasil diambil',
            'data' => [
                'key' => $key,
                'value' => $value
            ]
        ]);
    }

    /**
     * PUT /api/admin/config/{key}
     * Update system configuration.
     * 
     * Request Body:
     * {
     *   "value": "new_value"
     * }
     */
    public function update(Request $request, $key)
    {
        // Validate config key
        if (!in_array($key, self::ALLOWED_CONFIG_KEYS)) {
            return response()->json([
                'success' => false,
                'message' => 'Configuration key tidak valid',
            ], 422);
        }

        // Validate request
        $validated = $request->validate([
            'value' => ['required'],
        ]);

        // Validate specific config values
        $this->validateConfigValue($key, $validated['value']);

        // Update configuration
        Cache::put('config_' . $key, $validated['value']);

        // Log the update
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Update System Config',
            'model_type' => 'SystemConfig',
            'model_id' => null,
            'ip_address' => $request->ip(),
            'level' => 'warning',
            'data' => [
                'config_key' => $key,
                'new_value' => $validated['value']
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi sistem berhasil diperbarui',
            'data' => [
                'key' => $key,
                'value' => $validated['value']
            ]
        ]);
    }

    /**
     * POST /api/admin/config/batch-update
     * Update multiple configurations sekaligus.
     * 
     * Request Body:
     * {
     *   "configs": {
     *     "app_name": "KasCerdas v2",
     *     "session_timeout": 3600,
     *     "api_rate_limit": 100
     *   }
     * }
     */
    public function batchUpdate(Request $request)
    {
        $validated = $request->validate([
            'configs' => ['required', 'array'],
        ]);

        $configs = $validated['configs'];
        $updated = [];
        $errors = [];

        foreach ($configs as $key => $value) {
            // Validate key
            if (!in_array($key, self::ALLOWED_CONFIG_KEYS)) {
                $errors[$key] = 'Configuration key tidak valid';
                continue;
            }

            // Validate value
            try {
                $this->validateConfigValue($key, $value);
                Cache::put('config_' . $key, $value);
                $updated[$key] = $value;
            } catch (\Exception $e) {
                $errors[$key] = $e->getMessage();
            }
        }

        // Log batch update
        if (!empty($updated)) {
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'Batch Update System Config',
                'model_type' => 'SystemConfig',
                'ip_address' => $request->ip(),
                'level' => 'warning',
                'data' => [
                    'updated_count' => count($updated),
                    'updated_keys' => array_keys($updated)
                ]
            ]);
        }

        return response()->json([
            'success' => empty($errors),
            'message' => 'Batch update selesai',
            'data' => [
                'updated' => $updated,
                'errors' => $errors
            ]
        ]);
    }

    /**
     * DELETE /api/admin/config/{key}
     * Reset configuration ke default value.
     */
    public function destroy(Request $request, $key)
    {
        if (!in_array($key, self::ALLOWED_CONFIG_KEYS)) {
            return response()->json([
                'success' => false,
                'message' => 'Configuration key tidak ditemukan',
            ], 404);
        }

        Cache::forget('config_' . $key);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Reset System Config',
            'model_type' => 'SystemConfig',
            'ip_address' => $request->ip(),
            'level' => 'warning',
            'data' => [
                'config_key' => $key,
                'action' => 'reset_to_default'
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi berhasil direset ke default',
            'data' => ['key' => $key]
        ]);
    }

    /**
     * Validate configuration value based on key.
     */
    private function validateConfigValue(string $key, $value): void
    {
        switch ($key) {
            case 'max_file_upload_size':
                if (!is_numeric($value) || $value < 1) {
                    throw new \Exception('Max file upload size harus berupa angka positif');
                }
                break;

            case 'transaction_limit_per_day':
                if (!is_numeric($value) || $value < 0) {
                    throw new \Exception('Transaction limit harus berupa angka');
                }
                break;

            case 'require_email_verification':
            case 'two_factor_enabled':
                if (!is_bool($value) && !in_array($value, ['true', 'false', 1, 0])) {
                    throw new \Exception('Nilai harus berupa boolean');
                }
                break;

            case 'api_rate_limit':
                if (!is_numeric($value) || $value < 1) {
                    throw new \Exception('API rate limit harus berupa angka positif');
                }
                break;

            case 'session_timeout':
                if (!is_numeric($value) || $value < 60) {
                    throw new \Exception('Session timeout minimal 60 detik');
                }
                break;

            case 'notification_email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    throw new \Exception('Email tidak valid');
                }
                break;

            case 'backup_frequency':
                if (!in_array($value, ['daily', 'weekly', 'monthly'])) {
                    throw new \Exception('Backup frequency harus: daily, weekly, atau monthly');
                }
                break;
        }
    }
}
