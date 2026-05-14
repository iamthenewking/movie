'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  migrateGuestPersonalizationToCurrentUser,
  toggleMyList,
} from '@/lib/personalization';
import { useAuthStore } from '@/stores/auth';

export default function AuthDialog() {
  const {
    dialogOpen,
    closeDialog,
    mode,
    openDialog,
    register,
    login,
    pendingMyListShow,
    clearPendingMyListShow,
  } = useAuthStore();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!dialogOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setError('');
      setSubmitting(false);
    }
  }, [dialogOpen]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'register') {
        register({ name, email, password });
      } else {
        login({ email, password });
      }

      migrateGuestPersonalizationToCurrentUser();

      if (pendingMyListShow) {
        toggleMyList(pendingMyListShow);
        clearPendingMyListShow();
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to continue right now.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) =>
        open ? openDialog(mode, pendingMyListShow) : closeDialog()
      }>
      <DialogContent className="max-w-md rounded-3xl border-white/10 bg-[#090909] p-0 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_48%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))] p-7">
          <DialogHeader className="space-y-3 text-left">
            <p className="text-white/45 text-xs uppercase tracking-[0.24em]">
              Account
            </p>
            <DialogTitle className="text-3xl font-semibold tracking-tight text-white">
              {mode === 'register'
                ? 'Create your watch account'
                : 'Sign in to your account'}
            </DialogTitle>
            <DialogDescription className="text-white/65 text-sm leading-6">
              {mode === 'register'
                ? 'Save My List, keep your shelves tied to your account, and pick up where you left off on this browser.'
                : 'Sign in to keep My List and your saved watch activity under your account.'}
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-7 space-y-4"
            onSubmit={(event) => void handleSubmit(event)}>
            {mode === 'register' ? (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-white/80"
                  htmlFor="auth-name">
                  Name
                </label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your display name"
                  autoComplete="name"
                  className="placeholder:text-white/35 h-12 rounded-2xl border-white/10 bg-white/5 text-white"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-white/80"
                htmlFor="auth-email">
                Email
              </label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="placeholder:text-white/35 h-12 rounded-2xl border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-white/80"
                htmlFor="auth-password">
                Password
              </label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                className="placeholder:text-white/35 h-12 rounded-2xl border-white/10 bg-white/5 text-white"
              />
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90">
              {submitting
                ? mode === 'register'
                  ? 'Creating account...'
                  : 'Signing in...'
                : mode === 'register'
                ? 'Create account'
                : 'Sign in'}
            </Button>
          </form>

          <div className="text-white/55 mt-5 flex items-center justify-between text-sm">
            <span>
              {mode === 'register'
                ? 'Already have an account?'
                : 'Need a new account?'}
            </span>
            <button
              type="button"
              className="font-medium text-white transition hover:text-white/75"
              onClick={() => {
                setError('');
                openDialog(
                  mode === 'register' ? 'login' : 'register',
                  pendingMyListShow,
                );
              }}>
              {mode === 'register' ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
