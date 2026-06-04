"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Navbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
