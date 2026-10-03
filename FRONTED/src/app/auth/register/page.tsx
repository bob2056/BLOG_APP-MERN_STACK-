'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { CustomApiError } from '@/lib/api';
import { User, AtSign, Mail, Lock, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, hyphens, and dots allowed'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  const { register: registerAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await registerAuth(data);
      router.push(redirect);
    } catch (err: unknown) {
      if (err instanceof CustomApiError) {
        setServerError(err.message);
        if (err.errors) {
          const map: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.errors)) {
            map[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setFieldErrors(map);
        }
      } else {
        setServerError('An unexpected error occurred during account creation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              DevLog<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 pt-2">
            Create your account
          </h2>
          <p className="text-sm text-slate-500">
            Start publishing articles, following writers, and sharing your insights.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          {serverError && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ada Lovelace"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.name || fieldErrors.name
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {(errors.name || fieldErrors.name) && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.name?.message || fieldErrors.name}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="adalovelace"
                  {...register('username')}
                  className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.username || fieldErrors.username
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {(errors.username || fieldErrors.username) && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.username?.message || fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="ada@example.com"
                  {...register('email')}
                  className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.email || fieldErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {(errors.email || fieldErrors.email) && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.email?.message || fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.password || fieldErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {(errors.password || fieldErrors.password) && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.password?.message || fieldErrors.password}
                </p>
              )}
            </div>

            {/* Bio (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bio <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe what you write about..."
                {...register('bio')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all mt-2"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer link to sign in */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
