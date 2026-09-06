'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { saveSession } from '../../lib/auth';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CANDIDATE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      saveSession(res.data.token, res.data.user);
      const path = form.role === 'EMPLOYER' ? '/employer/dashboard' : '/candidate/dashboard';
      router.push(path);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">I am a...</label>
          <div className="flex gap-3">
            {['CANDIDATE', 'EMPLOYER'].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2 rounded-lg border font-medium ${
                  form.role === role ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700'
                }`}
              >
                {role === 'CANDIDATE' ? 'Candidate' : 'Employer'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full border rounded-lg px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
