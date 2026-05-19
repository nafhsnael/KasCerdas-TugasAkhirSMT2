<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MonitoringController extends Controller
{
    /**
     * Get system statistics.
     */
    public function index()
    {
        $totalUmkm = User::where('role', 'user')->where('user_type', 'umkm')->count();
        $totalMasyarakat = User::where('role', 'user')->where('user_type', 'masyarakat_umum')->count();
        $totalMahasiswa = User::where('role', 'user')->where('user_type', 'mahasiswa')->count();

        $totalAdmin = User::where('role', 'admin')->count();

        $newUsersToday = User::whereDate('created_at', Carbon::today())->count();

        $maintenanceStatus = Cache::get('maintenance_mode', false);

        $errorLogsTodayCount = ActivityLog::where('level', 'error')
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Statistik sistem berhasil diambil',
            'data' => [
                'users_by_type' => [
                    'umkm' => $totalUmkm,
                    'masyarakat_umum' => $totalMasyarakat,
                    'mahasiswa' => $totalMahasiswa,
                ],
                'total_admin' => $totalAdmin,
                'new_users_today' => $newUsersToday,
                'maintenance_active' => $maintenanceStatus,
                'error_logs_today' => $errorLogsTodayCount,
            ]
        ]);
    }

    /**
     * Get activity logs list.
     */
    public function logs(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->filled('level')) {
            $query->where('level', $request->input('level'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Log aktivitas berhasil diambil',
            'data' => $logs
        ]);
    }
}
