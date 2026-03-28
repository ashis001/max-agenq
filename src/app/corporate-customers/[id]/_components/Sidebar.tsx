"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Megaphone,
  MessageCircle,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  FileText
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Advisors", href: "/advisors", icon: Users },
  {
    label: "Corporate Customers",
    href: "/corporate-customers",
    icon: Building2,
  },
  { label: "Members", href: "/members", icon: UserCircle },
  { label: "Claims", href: "/claims", icon: FileText },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
];

const SECONDARY_NAV = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help Center", href: "/help-center", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggleChat, isOpen } = useChat();

  return (
    <aside className='fixed left-0 top-0 h-full w-64 border-r border-slate-200 bg-white z-50 flex flex-col'>
      {/* Brand Header */}
      <div className='flex h-20 items-center px-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white'>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center -ml-1">
            <img src="/max.png" alt="Max Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <div>
            <h1 className='text-sm font-black text-slate-900 uppercase tracking-tighter leading-none'>Max Insurance</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <nav className='space-y-1.5'>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname.startsWith(item.href) ||
              (item.href.includes("/corporate-customers") &&
                pathname.includes("/corporate-customers"));
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-[#3b5a7d] text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}>
                <item.icon className={clsx("h-4 w-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>



        {/* Secondary Nav */}
        <nav className='space-y-1.5'>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Support & Config</p>
          {SECONDARY_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-[#3b5a7d] text-white shadow-md shadow-blue-900/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={clsx("h-4 w-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className='p-4 border-t border-slate-100 bg-slate-50/50'>
        <div className='flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all duration-300 group'>
          <div className='relative h-10 w-10'>
            <div className="absolute inset-0 bg-blue-400 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
            <img
              src='/image.png'
              className='relative h-full w-full object-cover object-center rounded-xl shadow-sm'
              alt='Profile'
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className='flex-1 overflow-hidden'>
            <p className='text-xs font-black text-slate-900 truncate'>John Smith</p>
            <p className='text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter'>Administrator</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
