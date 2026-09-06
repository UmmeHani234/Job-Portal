'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '../lib/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getSession().user);
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push('/login');
  }

  const dashboardPath = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'EMPLOYER'
    ? '/employer/dashboard'
    : '/candidate/dashboard';

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-brand-600">
          JobPortal
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/jobs" className="hover:text-brand-600">Browse Jobs</Link>
          {user ? (
            <>
              <Link href={dashboardPath} className="hover:text-brand-600">Dashboard</Link>
              <Link href="/profile" className="hover:text-brand-600">Profile</Link>
              {user.role === 'EMPLOYER' && (
                <Link href="/employer/post-job" className="hover:text-brand-600">Post a Job</Link>
              )}
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600">Login</Link>
              <Link
                href="/register"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
