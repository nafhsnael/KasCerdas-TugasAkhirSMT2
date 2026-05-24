# 🚀 Frontend Admin Services & Components

> Contoh code untuk Admin Service Layer dan Key Components

---

## 📦 Admin Service Layer

```typescript
// services/adminService.ts

import api from './api';

// Type definitions
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  user_type?: 'umkm' | 'masyarakat_umum' | 'mahasiswa' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions_count?: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  title: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  note?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    user_type: string;
  };
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  level: 'error' | 'warning' | 'info';
  ip_address: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SystemStats {
  users_overview: {
    by_type: {
      umkm: number;
      masyarakat_umum: number;
      mahasiswa: number;
    };
    total_admin: number;
    total_active: number;
    new_users_today: number;
  };
  system_status: {
    maintenance_active: boolean;
    error_logs_today: number;
  };
  transaction_overview: {
    total_transactions: number;
    total_income: number;
    total_expense: number;
    net_balance: number;
  };
}

// ========== USER MANAGEMENT ==========

export const getUserList = async (params: {
  search?: string;
  role?: string;
  user_type?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserDetail = async (id: number) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: number,
  data: {
    name: string;
    email: string;
    role: 'user' | 'admin';
    user_type?: string | null;
    is_active: boolean;
  }
) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// ========== MONITORING ==========

export const getSystemStats = async () => {
  const response = await api.get('/admin/monitoring');
  return response.data;
};

export const getActivityLogs = async (params: {
  level?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get('/admin/monitoring/logs', { params });
  return response.data;
};

export const getAllTransactions = async (params: {
  user_id?: number;
  type?: 'income' | 'expense';
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get('/admin/monitoring/transactions', { params });
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/admin/monitoring/dashboard');
  return response.data;
};

// ========== MAINTENANCE ==========

export const getMaintenanceStatus = async () => {
  const response = await api.get('/admin/maintenance');
  return response.data;
};

export const activateMaintenance = async () => {
  const response = await api.post('/admin/maintenance');
  return response.data;
};

export const deactivateMaintenance = async () => {
  const response = await api.delete('/admin/maintenance');
  return response.data;
};

// ========== SYSTEM CONFIG ==========

export const getSystemConfig = async () => {
  const response = await api.get('/admin/config');
  return response.data;
};

export const getConfigValue = async (key: string) => {
  const response = await api.get(`/admin/config/${key}`);
  return response.data;
};

export const updateConfigValue = async (key: string, value: any) => {
  const response = await api.put(`/admin/config/${key}`, { value });
  return response.data;
};

export const batchUpdateConfig = async (configs: Record<string, any>) => {
  const response = await api.post('/admin/config/batch-update', { configs });
  return response.data;
};

export const resetConfig = async (key: string) => {
  const response = await api.delete(`/admin/config/${key}`);
  return response.data;
};

export default {
  // User Management
  getUserList,
  getUserDetail,
  updateUser,
  deleteUser,
  // Monitoring
  getSystemStats,
  getActivityLogs,
  getAllTransactions,
  getDashboardData,
  // Maintenance
  getMaintenanceStatus,
  activateMaintenance,
  deactivateMaintenance,
  // System Config
  getSystemConfig,
  getConfigValue,
  updateConfigValue,
  batchUpdateConfig,
  resetConfig,
};
```

---

## 🎣 Admin Hooks

```typescript
// hooks/useAdmin.ts

import { useState, useEffect, useCallback } from 'react';
import adminService, { User, Transaction, ActivityLog } from '../services/adminService';

// ========== useUsers Hook ==========

export const useUsers = (page = 1, perPage = 10) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (search?: string, role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getUserList({
        page,
        per_page: perPage,
        search,
        role,
      });
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    }
  }, [users]);

  const updateUser = useCallback(async (userId: number, data: any) => {
    try {
      const response = await adminService.updateUser(userId, data);
      setUsers(users.map(u => u.id === userId ? response.data : u));
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    }
  }, [users]);

  return {
    users,
    total,
    loading,
    error,
    fetchUsers,
    deleteUser,
    updateUser,
  };
};

// ========== useTransactions Hook ==========

export const useAdminTransactions = (page = 1, perPage = 15) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllTransactions({
        page,
        per_page: perPage,
        ...filters,
      });
      setTransactions(response.data.data);
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  return {
    transactions,
    summary,
    loading,
    error,
    fetchTransactions,
  };
};

// ========== useActivityLogs Hook ==========

export const useActivityLogs = (page = 1, perPage = 15) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getActivityLogs({
        page,
        per_page: perPage,
        ...filters,
      });
      setLogs(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  return {
    logs,
    total,
    loading,
    error,
    fetchLogs,
  };
};

// ========== useSystemStats Hook ==========

export const useSystemStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getSystemStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

// ========== useMaintenance Hook ==========

export const useMaintenance = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await adminService.getMaintenanceStatus();
      setIsActive(response.data.maintenance_active);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const toggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isActive) {
        await adminService.deactivateMaintenance();
        setIsActive(false);
      } else {
        await adminService.activateMaintenance();
        setIsActive(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isActive]);

  return {
    isActive,
    loading,
    error,
    fetchStatus,
    toggle,
  };
};

// ========== useSystemConfig Hook ==========

export const useSystemConfig = () => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getSystemConfig();
      setConfig(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key: string, value: any) => {
    try {
      const response = await adminService.updateConfigValue(key, value);
      setConfig(prev => ({ ...prev, [key]: response.data.value }));
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const batchUpdate = useCallback(async (configs: Record<string, any>) => {
    try {
      const response = await adminService.batchUpdateConfig(configs);
      setConfig(prev => ({ ...prev, ...response.data.updated }));
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    batchUpdate,
  };
};
```

---

## 🧩 Key Admin Components

### 1. User Table Component

```typescript
// components/Admin/UserTable.tsx

import React, { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useAdmin';

interface UserTableProps {
  onEditUser?: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({ onEditUser }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { users, loading, error, fetchUsers, deleteUser } = useUsers(page, 10);

  useEffect(() => {
    fetchUsers(search);
  }, [page, search]);

  const handleDeleteUser = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await deleteUser(id);
        alert('User berhasil dihapus');
      } catch (err) {
        alert('Gagal menghapus user');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 py-8">{error}</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Nama</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Role</th>
              <th className="border p-3 text-left">Tipe User</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border p-3">{user.name}</td>
                <td className="border p-3">{user.email}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="border p-3">{user.user_type || '-'}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="border p-3 text-center space-x-2">
                  <button
                    onClick={() => onEditUser?.(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
```

### 2. Transaction Monitoring Table

```typescript
// components/Admin/TransactionTable.tsx

import React, { useEffect, useState } from 'react';
import { useAdminTransactions } from '../../hooks/useAdmin';

const TransactionTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { transactions, summary, loading, fetchTransactions } = useAdminTransactions(page, 15);

  useEffect(() => {
    fetchTransactions(filters);
  }, [page, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expense)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Net Balance</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.net_balance)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <input
          type="date"
          onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Start Date"
        />
        <input
          type="date"
          onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="End Date"
        />
        <select
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Semua Tipe</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Tanggal</th>
              <th className="border p-3 text-left">User</th>
              <th className="border p-3 text-left">Title</th>
              <th className="border p-3 text-left">Kategori</th>
              <th className="border p-3 text-left">Tipe</th>
              <th className="border p-3 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="border p-3 text-sm">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td className="border p-3 text-sm">{tx.user?.name || 'N/A'}</td>
                <td className="border p-3 text-sm">{tx.title}</td>
                <td className="border p-3 text-sm">{tx.category}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="border p-3 text-right font-semibold text-sm">
                  <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
```

### 3. Maintenance Toggle Component

```typescript
// components/Admin/MaintenanceToggle.tsx

import React, { useEffect } from 'react';
import { useMaintenance } from '../../hooks/useAdmin';

const MaintenanceToggle: React.FC = () => {
  const { isActive, loading, fetchStatus, toggle } = useMaintenance();

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-400">
      <h3 className="text-lg font-semibold mb-4">Maintenance Mode</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mb-2">
            Ketika maintenance mode aktif, hanya admin yang bisa akses aplikasi.
          </p>
          <p className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-green-600'}`}>
            Status: {isActive ? '🔴 Aktif' : '🟢 Nonaktif'}
          </p>
        </div>

        <button
          onClick={toggle}
          disabled={loading}
          className={`px-6 py-2 rounded font-semibold text-white transition ${
            isActive
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } disabled:opacity-50`}
        >
          {loading ? 'Loading...' : isActive ? 'Deaktifkan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceToggle;
```

---

## 📚 Usage Example

```typescript
// pages/Admin/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import UserTable from '../../components/Admin/UserTable';
import UserModal from '../../components/Admin/UserModal';

const UserManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen User</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Tambah User
        </button>
      </div>

      <UserTable onEditUser={handleEditUser} />

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            // Refresh table
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
```

---

## ✅ Implementation Checklist

- [ ] Create `services/adminService.ts`
- [ ] Create `hooks/useAdmin.ts` with all hooks
- [ ] Create `components/Admin/UserTable.tsx`
- [ ] Create `components/Admin/TransactionTable.tsx`
- [ ] Create `components/Admin/MaintenanceToggle.tsx`
- [ ] Create `components/Admin/UserModal.tsx` (untuk edit user)
- [ ] Create `components/Admin/SystemConfigForm.tsx`
- [ ] Create `components/Admin/ActivityLogTable.tsx`
- [ ] Create `components/Admin/StatCard.tsx`
- [ ] Create pages yang menggunakan components di atas

