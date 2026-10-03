'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, PaginationMeta } from '@/types';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import Pagination from '@/components/common/Pagination';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, getMediaUrl } from '@/lib/utils';
import { Search, Trash2, ToggleLeft, ToggleRight, Shield, ShieldOff } from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    if (!isAuthLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (currentUser && isAdmin) {
      fetchUsers();
    }
  }, [currentUser, isAdmin, isAuthLoading, router, fetchUsers]);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = !user.isActive;
    try {
      await adminService.updateUserStatus(user._id, nextStatus);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their articles?')) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminHeader
        title="User Accounts Directory"
        subtitle="Manage registered members, inspect roles, and enable or disable accounts."
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="USER">Standard Users</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : users.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => {
                    const isSelf = currentUser?._id === u._id;
                    const avatar = u.avatar ? getMediaUrl(u.avatar) : null;

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatar}
                                alt={u.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{u.name}</p>
                              <p className="text-xs text-slate-400">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role === 'ADMIN' ? (
                              <Shield className="h-3 w-3 text-amber-600" />
                            ) : (
                              <ShieldOff className="h-3 w-3 text-slate-400" />
                            )}
                            <span>{u.role}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle active status */}
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`rounded-lg p-1.5 transition-colors ${
                                  u.isActive
                                    ? 'text-slate-400 hover:text-amber-600'
                                    : 'text-emerald-600 hover:text-emerald-700'
                                }`}
                                title={u.isActive ? 'Deactivate user' : 'Activate user'}
                              >
                                {u.isActive ? (
                                  <ToggleRight className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 text-slate-400" />
                                )}
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No users found"
          description="Try adjusting your search criteria."
        />
      )}
    </div>
  );
}
