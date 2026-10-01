'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get('token');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (token) {
                const result = await authClient.resetPassword({ newPassword: password, token });
                if (result.error) throw new Error(result.error.message || 'Unable to reset password');
                toast.success('Password updated');
                router.push('/login');
            } else {
                const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` });
                if (result.error) throw new Error(result.error.message || 'Unable to send reset email');
                setSent(true);
            }
        } catch (err: any) {
            setError(err?.message || 'Unable to complete password reset');
        } finally {
            setLoading(false);
        }
    };

    return <main className="min-h-screen bg-earth-50 px-6 py-28"><div className="mx-auto max-w-md rounded-2xl border border-earth-200 bg-white p-8 shadow-sm"><h1 className="font-serif text-3xl font-bold text-herbal-950">{token ? 'Choose a new password' : 'Reset your password'}</h1><p className="mt-2 text-sm text-gray-500">{token ? 'Use at least eight characters.' : 'We will send a secure reset link to your email.'}</p>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{sent ? <div className="mt-6 rounded-lg bg-herbal-50 p-4 text-sm text-herbal-900">If an account exists for that email, a reset link has been sent.</div> : <form onSubmit={submit} className="mt-6 space-y-4">{token ? <label className="block text-sm font-bold text-gray-700">New password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" autoComplete="new-password" /></label> : <label className="block text-sm font-bold text-gray-700">Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" autoComplete="email" /></label>}<button disabled={loading} className="w-full rounded-full bg-herbal-900 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Please wait...' : token ? 'Update password' : 'Send reset link'}</button></form>}<button onClick={() => router.push('/login')} className="mt-5 w-full text-sm font-bold text-herbal-700">Back to sign in</button></div></main>;
}
