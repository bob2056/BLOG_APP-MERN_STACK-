'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getMediaUrl } from '@/lib/utils';
import { CustomApiError } from '@/lib/api';
import { User, Lock, Upload, Check, AlertCircle } from 'lucide-react';

export default function UserSettingsPage() {
  const { user, isLoading: isAuthLoading, updateLocalUser } = useAuth();
  const router = useRouter();

  // Profile Form State
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/settings');
      return;
    }

    if (user) {
      setName(user.name);
      setUsername(user.username);
      setBio(user.bio || '');
    }
  }, [user, isAuthLoading, router]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await userService.updateProfile({ name, username, bio });
      if (res.success && res.data) {
        updateLocalUser(res.data);
        setProfileMsg({ text: 'Profile updated successfully!' });
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setProfileMsg({ text: err.message, error: true });
      } else {
        setProfileMsg({ text: 'Failed to update profile.', error: true });
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Avatar File Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setProfileMsg(null);

    try {
      const res = await userService.updateAvatar(file);
      if (res.success && res.data) {
        updateLocalUser(res.data.user);
        setProfileMsg({ text: 'Profile avatar updated successfully!' });
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setProfileMsg({ text: err.message, error: true });
      } else {
        setProfileMsg({ text: 'Failed to upload avatar.', error: true });
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ text: 'Both current and new password are required.', error: true });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', error: true });
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setPasswordMsg({ text: err.message, error: true });
      } else {
        setPasswordMsg({ text: 'Failed to change password.', error: true });
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-16 animate-pulse" />;
  }

  const avatarUrl = user.avatar ? getMediaUrl(user.avatar) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <DashboardHeader
        title="Account Settings"
        subtitle="Manage your public profile details, author avatar, and account security."
      />

      {/* 1. Profile & Avatar Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <User className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
        </div>

        {profileMsg && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
              profileMsg.error
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {profileMsg.error ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            ) : (
              <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        {/* Avatar Upload Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold ring-2 ring-indigo-500/20">
              {user.name.charAt(0)}
            </div>
          )}

          <div>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5 text-indigo-600" />
              <span>{isUploadingAvatar ? 'Uploading avatar...' : 'Change Avatar'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingAvatar}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1.5">
              JPG, PNG, GIF, or WEBP (up to 5MB)
            </p>
          </div>
        </div>

        {/* Profile Inputs */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio / About You
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about yourself, your background, and topics you cover..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Password Security Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Lock className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
        </div>

        {passwordMsg && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
              passwordMsg.error
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {passwordMsg.error ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            ) : (
              <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword || !currentPassword || !newPassword}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
