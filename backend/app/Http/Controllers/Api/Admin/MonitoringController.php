<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MonitoringController extends Controller
{
    /**
     * GET /api/admin/monitoring
     * Get system statistics and overview.
     */
    public function index()
    {
        $totalUmkm = User::where('role', 'user')->where('user_type', 'umkm')->count();
        $totalMasyarakat = User::where('role', 'user')->where('user_type', 'masyarakat_umum')->count();
        $totalMahasiswa = User::where('role', 'user')->where('user_type', 'mahasiswa')->count();

        $totalAdmin = User::where('role', 'admin')->count();
        $totalActiveUsers = User::where('is_active', true)->count();

        $newUsersToday = User::whereDate('created_at', Carbon::today())->count();

        $maintenanceStatus = Cache::get('maintenance_mode', false);

        $errorLogsTodayCount = ActivityLog::where('level', 'error')
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Transaction statistics
        $totalTransactions = Transaction::count();
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Statistik sistem berhasil diambil',
            'data' => [
                'users_overview' => [
                    'by_type' => [
                        'umkm' => $totalUmkm,
                        'masyarakat_umum' => $totalMasyarakat,
                        'mahasiswa' => $totalMahasiswa,
                    ],
                    'total_admin' => $totalAdmin,
                    'total_active' => $totalActiveUsers,
                    'new_users_today' => $newUsersToday,
                ],
                'system_status' => [
                    'maintenance_active' => $maintenanceStatus,
                    'error_logs_today' => $errorLogsTodayCount,
                ],
                'transaction_overview' => [
                    'total_transactions' => $totalTransactions,
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'net_balance' => $totalIncome - $totalExpense,
                ]
            ]
        ]);
    }

    /**
     * GET /api/admin/monitoring/logs
     * Get activity logs dari semua user dengan filter dan search.
     * 
     * Query Parameters:
     * - level: 'error', 'warning', 'info'
     * - search: search in action & user name/email
     * - per_page: pagination size (default 15)
     * - page: page number
     */
    public function logs(Request $request)
    {
        $query = ActivityLog::with('user')->select('activity_logs.*');

        // Filter by log level
        if ($request->filled('level')) {
            $query->where('level', $request->input('level'));
        }

        // Search in action and user info
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

        // Date range filter
        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->input('end_date'));
        }

        $logs = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Log aktivitas berhasil diambil',
            'data' => $logs
        ]);
    }

    /**
     * GET /api/admin/monitoring/transactions
     * Monitor semua transaksi dari semua user (Admin-only feature).
     * 
     * Query Parameters:
     * - user_id: filter by specific user
     * - start_date: filter from date
     * - end_date: filter to date
     * - type: 'income' or 'expense'
     * - category: filter by category
     * - search: search in title, note, description
     * - per_page: pagination size (default 15)
     */
    public function transactions(Request $request)
    {
        $query = Transaction::with(['user:id,name,email,user_type', 'wallet:id,name,user_id'])
            ->select('transactions.*');

        // Filter by specific user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->input('end_date'));
        }

        // Filter by transaction type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Search in description fields
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%")
                  ->orWhere('description_detail', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('date', 'desc')
                              ->paginate($request->input('per_page', 15));

        // Calculate summary based on filters
        $summaryQuery = Transaction::query();
        
        if ($request->filled('user_id')) {
            $summaryQuery->where('user_id', $request->input('user_id'));
        }
        if ($request->filled('start_date')) {
            $summaryQuery->where('date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $summaryQuery->where('date', '<=', $request->input('end_date'));
        }
        if ($request->filled('category')) {
            $summaryQuery->where('category', $request->input('category'));
        }

        $totalIncome = (clone $summaryQuery)
            ->where('type', 'income')
            ->sum('amount');

        $totalExpense = (clone $summaryQuery)
            ->where('type', 'expense')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi semua user berhasil diambil',
            'data' => $transactions,
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_balance' => $totalIncome - $totalExpense,
                'total_transactions' => $transactions->total(),
            ]
        ]);
    }

    /**
     * GET /api/admin/monitoring/dashboard
     * Comprehensive dashboard data untuk admin.
     */
    public function dashboard()
    {
        // Get data for dashboard charts & widgets
        $today = Carbon::today();
        $lastMonth = $today->clone()->subMonth();

        // Transactions trend (last 30 days)
        $transactionsTrend = Transaction::whereBetween('date', [$lastMonth, $today])
            ->select(
                DB::raw('DATE(date) as date'),
                DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top categories by amount
        $topCategories = Transaction::selectRaw('category, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Top users by transaction count
        $topUsers = User::withCount('transactions')
            ->orderBy('transactions_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email', 'user_type', 'transactions_count']);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data berhasil diambil',
            'data' => [
                'transactions_trend' => $transactionsTrend,
                'top_categories' => $topCategories,
                'top_users' => $topUsers,
            ]
        ]);
    }

    /**
     * GET /api/admin/monitoring/database/tables
     * Get all tables in the database with their row counts.
     */
    public function getTables()
    {
        $tables = [];
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $tableNames = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            foreach ($tableNames as $table) {
                $name = $table->name;
                $count = DB::table($name)->count();
                $tables[] = [
                    'name' => $name,
                    'rows' => $count,
                ];
            }
        } else {
            // Support for MySQL/PostgreSQL if needed later
            $tableNames = DB::select('SHOW TABLES');
            $key = "Tables_in_" . DB::getDatabaseName();
            foreach ($tableNames as $table) {
                $name = $table->$key;
                $count = DB::table($name)->count();
                $tables[] = [
                    'name' => $name,
                    'rows' => $count,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $tables
        ]);
    }

    /**
     * GET /api/admin/monitoring/database/tables/{table}
     * Get data from a specific table with pagination.
     */
    public function getTableData(Request $request, $table)
    {
        // Simple security check: prevent access to system tables or common sensitive patterns
        if (in_array($table, ['migrations', 'personal_access_tokens', 'password_reset_tokens'])) {
            return response()->json(['success' => false, 'message' => 'Akses ke tabel sistem dilarang'], 403);
        }

        try {
            $perPage = $request->input('per_page', 10);
// Removed erroneous wallet creation code that referenced undefined $wallet.
            $data = DB::table($table)->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tabel: ' . $e->getMessage()
            ], 500);
        }
    }
}
