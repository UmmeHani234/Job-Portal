'use client';

import { useEffect, useState } from 'react';
import { getSession } from '../../lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSession().user);
  }, []);

  if (!user) return <p className="text-gray-500">Please log in to view your profile.</p>;

  return (
    <div className="max-w-lg mx-auto bg-white border rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="space-y-3 text-sm">
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
