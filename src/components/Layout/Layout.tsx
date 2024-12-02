import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopNav />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}