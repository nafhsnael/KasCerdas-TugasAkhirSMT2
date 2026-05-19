<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MaintenanceController extends Controller
{
    /**
     * Check maintenance mode status.
     */
    public function index()
    {
        $status = Cache::get('maintenance_mode', false);

        return response()->json([
            'success' => true,
            'message' => 'Status maintenance berhasil diambil',
            'data' => [
                'maintenance_active' => $status
            ]
        ]);
    }

    /**
     * Activate maintenance mode.
     */
    public function store(Request $request)
    {
        Cache::put('maintenance_mode', true);

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Activate Maintenance Mode',
            'ip_address' => $request->ip(),
            'level' => 'warning',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mode maintenance berhasil diaktifkan',
            'data' => [
                'maintenance_active' => true
            ]
        ]);
    }

    /**
     * Deactivate maintenance mode.
     */
    public function destroy(Request $request)
    {
        Cache::forget('maintenance_mode');

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Deactivate Maintenance Mode',
            'ip_address' => $request->ip(),
            'level' => 'info',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mode maintenance berhasil dinonaktifkan',
            'data' => [
                'maintenance_active' => false
            ]
        ]);
    }
}
