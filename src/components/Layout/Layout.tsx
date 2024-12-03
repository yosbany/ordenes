import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopNav />
      <main className="flex-1 container mx-auto px-2 py-4 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}