'use client';

import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow-md">
      <h1 className="text-xl font-bold">Bhuvan Dev Environment</h1>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Logout
      </button>
    </header>
  );
}
