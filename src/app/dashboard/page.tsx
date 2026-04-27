"use client";

import AgentUI from "@/components/AgentUi";
import MaxGreeting from "@/components/MaxGreeting";
import { useChat } from "@/context/ChatContext";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Mock Data
const STATS_DATA = {
  Today: { corps: 124, members: 8543, revenue: "1.2M", claims: 432 },
  "This Week": { corps: 130, members: 8600, revenue: "1.25M", claims: 450 },
  "This Month": { corps: 145, members: 9200, revenue: "1.4M", claims: 600 },
};

const CHART_DATA = [
  { name: "Jan", revenue: 4000, claims: 2400 },
  { name: "Feb", revenue: 3000, claims: 1398 },
  { name: "Mar", revenue: 2000, claims: 9800 },
  { name: "Apr", revenue: 2780, claims: 3908 },
  { name: "May", revenue: 1890, claims: 4800 },
  { name: "Jun", revenue: 2390, claims: 3800 },
  { name: "Jul", revenue: 3490, claims: 4300 },
];

const PIE_DATA = [
  { name: "Active", value: 400 },
  { name: "Pending", value: 300 },
  { name: "Onboarding", value: 300 },
  { name: "Draft", value: 200 },
];

const COLORS = ["#3b82f6", "#6366f1", "#06b6d4", "#f59e0b"];

const AnimatedGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 30, 59, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

export default function DashboardPage() {
  const { toggleChat, openChat } = useChat();
  const [timeRange, setTimeRange] = useState<"Today" | "This Week" | "This Month">("Today");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = STATS_DATA[timeRange];

  if (!mounted) return null;

  return (
    <div className='flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10'>
      <MaxGreeting />
      <Sidebar />

      <main className='flex-1 md:ml-64 relative overflow-hidden flex flex-col'>
        <AnimatedGrid />

        {/* Dynamic Background Accents */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

        {/* Premium Header */}
        <header className='relative z-20 flex min-h-[5rem] md:h-20 flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0'>
          <div className='flex flex-col'>
            <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise overview & real-time analytics</p>
          </div>

          <div className='flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto mt-4 md:mt-0'>
            <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
              {["Today", "This Week", "This Month"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${timeRange === range
                    ? "bg-white text-blue-600 shadow-md border border-slate-200 scale-105"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className='h-8 w-px bg-slate-200' />

            <div className='flex items-center gap-3'>
              <button
                onClick={() => openChat("Hi, I’m Nina. Your Assistant. Ask me anything")}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Ask Nina
              </button>
            </div>
          </div>
        </header>

        <div className='relative z-10 p-6 space-y-6 animate-fade-in'>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard
              title='Total Corporations'
              value={stats.corps}
              icon={Building2}
              color='blue'
              trend='+12%'
              delay="100ms"
            />
            <StatCard
              title='Active Members'
              value={stats.members.toLocaleString()}
              icon={Users}
              color='indigo'
              trend='+5.4%'
              delay="200ms"
            />
            <StatCard
              title='Total Revenue'
              value={`$${stats.revenue}`}
              icon={DollarSign}
              color='emerald'
              trend='+8%'
              delay="300ms"
            />
            <StatCard
              title='Claims Processed'
              value={stats.claims}
              icon={Activity}
              color='amber'
              trend='Safe'
              delay="400ms"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Growth Chart */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col animate-slide-up [animation-delay:500ms]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <LineIcon className="w-4 h-4 text-blue-600" />
                    Performance Analytics
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Monthly revenue vs claims distribution</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-slate-600">Claims</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-[220px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="claims"
                      stroke="#6366f1"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorClaims)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col animate-slide-up [animation-delay:600ms]">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Case Distribution
              </h3>
              <div className="flex-1 min-h-[160px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3.5 mt-6">
                {PIE_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value} Units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table Area */}
            <div className="animate-slide-up [animation-delay:700ms]">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden h-full">
                <div className="p-6 pb-0 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Onboarding Activity</h3>
                      <p className="text-xs text-slate-500 font-medium">Recent applications</p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200">
                    View Full
                  </button>
                </div>

                <div className='p-3 overflow-x-auto'>
                  <table className='w-full text-left min-w-[500px]'>
                    <tbody className='divide-y divide-slate-50'>
                      {[
                        { name: "Acme Corp Inc.", status: "Active", date: "Oct 24", color: "emerald", icon: ShieldCheck },
                        { name: "TechFlow Solutions", status: "Pending", date: "Oct 23", color: "amber", icon: Clock },
                        { name: "Global Logistics Ltd", status: "Onboarding", date: "Oct 21", color: "indigo", icon: Zap },
                        { name: "Starlight Media", status: "Draft", date: "Oct 19", color: "slate", icon: Activity },
                      ].map((row, i) => (
                        <tr key={i} className='group hover:bg-slate-50 transition-all duration-300'>
                          <td className='px-6 py-5'>
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {row.name.charAt(0)}
                              </div>
                              <span className='text-sm font-bold text-slate-800'>{row.name}</span>
                            </div>
                          </td>
                          <td className='px-4 py-5'>
                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-${row.color}-50 text-${row.color}-600 border border-${row.color}-100 shadow-sm`}>
                              {row.status}
                            </div>
                          </td>
                          <td className='px-6 py-5 text-right'>
                            <span className='text-xs text-slate-400 font-bold'>{row.date}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Growth Bar Chart */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-sm p-6 flex flex-col animate-slide-up [animation-delay:800ms]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarIcon className="w-4 h-4 text-blue-600" />
                  Member Growth
                </h3>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-black rounded-lg border border-blue-100 uppercase tracking-wider shadow-sm">
                  +15% Growth
                </div>
              </div>
              <div className="flex-1 min-h-[220px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#colorBar)"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-entrance {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-card-entrance { animation: card-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>
    </div>
  );
}



function StatCard({ title, value, icon: Icon, color, trend, delay }: any) {
  const themes: any = {
    blue: "from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-100",
    indigo: "from-indigo-600 to-violet-600 text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "from-emerald-600 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "from-amber-600 to-orange-600 text-amber-600 bg-amber-50 border-amber-100",
  };

  const theme = themes[color] || themes.blue;

  return (
    <div
      className='animate-card-entrance group bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 p-6 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 relative z-0 hover:z-10'
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div className='flex items-start justify-between'>
        <div className={`p-3.5 rounded-xl ${theme.split(' border-')[0].split(' text-')[1]} border border-slate-100 group-hover:border-current opacity-80 transition-all duration-500 shadow-sm`}>
          <Icon className='h-6 w-6' />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>

      <div className='mt-5'>
        <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-1'>
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h4 className='text-3xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors duration-300'>{value}</h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
        </div>
      </div>
    </div>
  );
}
