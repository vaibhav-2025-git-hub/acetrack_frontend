import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { GlobalAnnouncement } from './GlobalAnnouncement';
import { adminAPI } from '../services/api';
import { ShieldAlert, Users, Server, BrainCircuit, Activity, BookOpen, ToggleLeft, ToggleRight, LogOut, Loader2, Search, Ban, Terminal, Globe, ActivitySquare, Send, MessageSquare, TrendingUp, Megaphone, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // Journey Modal State
    const [selectedUserJourney, setSelectedUserJourney] = useState<any[] | null>(null);
    const [journeyModalUser, setJourneyModalUser] = useState<{ id: string | number, name: string } | null>(null);
    const [isLoadingJourney, setIsLoadingJourney] = useState(false);

    const [systemLogs, setSystemLogs] = useState<any[]>([]);

    // Features state
    const [features, setFeatures] = useState({
        aiStudyPlans: true,
        quizGeneration: true,
        parentMonitoring: true,
        analyticsDashboard: true
    });

    useEffect(() => {
        fetchStats();
        fetchUsersList();
        fetchAnalytics();
        fetchAnnouncements();
        fetchSystemLogs();

        // Refresh logs every 15 seconds for a "live" feel
        const logInterval = setInterval(fetchSystemLogs, 15000);
        return () => clearInterval(logInterval);
    }, []);

    const fetchSystemLogs = async () => {
        try {
            const res = await adminAPI.getSystemLogs();
            if (res.success && res.data) {
                setSystemLogs(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch system logs:', error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await adminAPI.getAnnouncements();
            if (res.success && res.data) {
                setAnnouncements(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };


    const fetchAnalytics = async () => {
        try {
            const res = await adminAPI.getAnalytics();
            if (res.success && res.data?.trendData) {
                setAnalyticsData(res.data.trendData);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await adminAPI.getStats();
            if (res.success) {
                setStats(res.data);
                setFeatures(res.data.activeFeatures);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            toast.error('Failed to connect to the platform database.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsersList = async () => {
        try {
            const res = await adminAPI.getUsers();
            if (res.success && res.data) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch user list:', error);
        }
    };

    const handleToggleFeature = async (featureKey: string, currentValue: boolean) => {
        try {
            // Optimistic update
            setFeatures(prev => ({ ...prev, [featureKey]: !currentValue }));

            const res = await adminAPI.toggleFeature(featureKey, !currentValue);
            if (res.success) {
                toast.success(`Feature updated successfully`);
            } else {
                // Revert on failure
                setFeatures(prev => ({ ...prev, [featureKey]: currentValue }));
                toast.error('Failed to toggle feature');
            }
        } catch (error) {
            setFeatures(prev => ({ ...prev, [featureKey]: currentValue }));
            toast.error('Network error during feature toggle');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        try {
            const res = await adminAPI.createAnnouncement(broadcastMessage);
            if (res.success) {
                toast.success('Broadcast Sent', { description: 'Message dispatched to all active client dashboards.' });
                setBroadcastMessage('');
                fetchAnnouncements(); // Refresh the history
            } else {
                toast.error('Failed to send broadcast');
            }
        } catch (error) {
            toast.error('Network error while sending broadcast');
        }
    };

    const fetchAndShowUserJourney = async (userId: string | number, userName: string) => {
        setJourneyModalUser({ id: userId, name: userName });
        setIsLoadingJourney(true);
        setSelectedUserJourney(null);
        try {
            const res = await adminAPI.getUserJourney(userId);
            if (res.success && res.data) {
                setSelectedUserJourney(res.data);
            } else {
                toast.error('Failed to load user journey');
                setJourneyModalUser(null);
            }
        } catch (error) {
            console.error('Failed to fetching journey', error);
            toast.error('Network error fetching journey');
            setJourneyModalUser(null);
        } finally {
            setIsLoadingJourney(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-medium tracking-widest uppercase text-sm">Connecting to secure server...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 md:p-8 relative overflow-hidden">
            <GlobalAnnouncement />
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-center justify-between mb-12 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40">
                            <ShieldAlert className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-wide">Command Center</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">AceTrack Platform Administration</p>
                        </div>
                    </div>
                    <Button
                        onClick={onLogout}
                        className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </header>

                {/* Global Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Total Users */}
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                        {/* Sparkline */}
                        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40">
                            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-indigo-500 fill-indigo-500/10 stroke-[2px]">
                                <path d="M0,30 L0,25 C10,25 15,10 25,15 C35,20 40,5 50,10 C60,15 65,25 75,20 C85,15 90,5 100,2 L100,30 Z" />
                            </svg>
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Registered</CardDescription>
                            <CardTitle className="text-4xl font-black text-white flex justify-between items-end mt-2">
                                {stats?.users?.total || 0}
                                <Users className="w-8 h-8 text-indigo-500 mb-1" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-4">
                                <span>Students: {stats?.users?.totalStudents || 0}</span>
                                <span>Parents: {stats?.users?.totalParents || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Study Plans */}
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                        {/* Sparkline */}
                        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40">
                            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-purple-500 fill-purple-500/10 stroke-[2px]">
                                <path d="M0,30 L0,20 C15,20 20,25 35,15 C50,5 55,20 70,10 C85,0 90,15 100,5 L100,30 Z" />
                            </svg>
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-wider text-xs">Active Study Plans</CardDescription>
                            <CardTitle className="text-4xl font-black text-white flex justify-between items-end mt-2">
                                {stats?.engagement?.totalStudyPlans || 0}
                                <BookOpen className="w-8 h-8 text-purple-500 mb-1" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-xs font-semibold text-slate-500 mt-4">+12% from last week</p>
                        </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <CardHeader className="pb-2 relative z-10">
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-wider text-xs">Node.js Server Status</CardDescription>
                            <CardTitle className="text-2xl font-black text-emerald-400 flex justify-between items-end mt-2">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    {stats?.systemHealth?.status || 'Unknown'}
                                </span>
                                <Server className="w-8 h-8 text-emerald-500/50 mb-1" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500 mt-4">
                                <div className="flex justify-between">
                                    <span>Uptime: {stats?.systemHealth?.uptime || '---'}</span>
                                    <span>RAM: <span className="text-emerald-400">{stats?.systemHealth?.memoryUsage || '---'}</span></span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Load: {stats?.systemHealth?.loadAvg || '---'}</span>
                                    <span>CPU Cores: <span className="text-emerald-400">{stats?.systemHealth?.cpuCores || '---'}</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Traffic */}
                    <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                            <Globe className="w-32 h-32 text-indigo-400" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-wider text-xs">Live Active Sessions</CardDescription>
                            <CardTitle className="text-4xl font-black text-indigo-400 flex justify-between items-end mt-2">
                                24
                                <ActivitySquare className="w-8 h-8 text-indigo-500/50 mb-1" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-4">
                                <span>Peak today: 89</span>
                                <span>Avg length: 42m</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* God Mode Dashboard - Engagement Trends */}
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl mb-12">
                    <CardHeader className="border-b border-slate-800/80 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                    Platform Engagement Trends (Last 7 Days)
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Visual tracking of new registrations vs study plans generated.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="users" name="New Users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="plans" name="Study Plans" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPlans)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Action Center & User Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Action Center - Left Column */}
                    <div className="space-y-8">
                        {/* Global Feature Flags */}
                        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    Global Feature Toggles
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Instantly enable or disable core platform modules across all active client connections.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Toggle 1 */}
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                                    <div>
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-purple-400" />
                                            AI Study Plan Generation
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Allow students to construct new AI-driven study calendars.</p>
                                    </div>
                                    <button onClick={() => handleToggleFeature('aiStudyPlans', features.aiStudyPlans)} className="text-slate-400 hover:text-white transition-colors">
                                        {features.aiStudyPlans ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                                    </button>
                                </div>

                                {/* Toggle 2 */}
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                                    <div>
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                            <span className="text-xl mb-1">📝</span>
                                            Dynamic Quiz Engine
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Enable live quiz generation based on syllabus progress.</p>
                                    </div>
                                    <button onClick={() => handleToggleFeature('quizGeneration', features.quizGeneration)} className="text-slate-400 hover:text-white transition-colors">
                                        {features.quizGeneration ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                                    </button>
                                </div>

                                {/* Toggle 3 */}
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                                    <div>
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-400" />
                                            Parent/Guardian Portal
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Allow parents to link accounts and monitor analytics.</p>
                                    </div>
                                    <button onClick={() => handleToggleFeature('parentMonitoring', features.parentMonitoring)} className="text-slate-400 hover:text-white transition-colors">
                                        {features.parentMonitoring ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Global Broadcast Center */}
                        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-pink-400" />
                                    Platform Broadcaster
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Push a high-priority alert to all connected Student and Parent dashboards instantly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="e.g., Scheduled Maintenance at 12:00 AM UTC..."
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    />
                                    <Button
                                        onClick={handleBroadcast}
                                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Deploy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Announcements History */}
                        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl">
                            <CardHeader className="pb-4 border-b border-slate-800/80">
                                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-indigo-400" />
                                    Announcements History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto max-h-[300px] custom-scrollbar">
                                <div className="divide-y divide-slate-800/50">
                                    {announcements.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 text-sm">No recent announcements.</div>
                                    ) : (
                                        announcements.map((ann) => (
                                            <div key={ann.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                                                <p className="text-sm text-slate-300 mb-2">{ann.message}</p>
                                                <div className="flex justify-between items-center text-xs text-slate-500">
                                                    <span>By: {ann.admin_name || 'System'}</span>
                                                    <span>{new Date(ann.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operational Center - Right Column */}
                    <div className="space-y-8">
                        {/* User Management Module */}
                        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl flex flex-col h-[500px]">
                            <CardHeader className="border-b border-slate-800/80 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                            <ShieldAlert className="w-5 h-5 text-indigo-400" />
                                            Advanced User Management
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Monitor accounts, audit access, and enforce platform security protocols.
                                        </CardDescription>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64 transition-all"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="min-w-full divide-y divide-slate-800/50">
                                    {users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm font-medium">No users found matching query.</div>
                                    ) : (
                                        users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                                                   ${user.user_type === 'student' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                            user.user_type === 'parent' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                                                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                                                    >
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 pr-4">
                                                        <h4 className="text-white font-bold text-sm truncate">{user.name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                                                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                            <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded-sm border border-slate-800">
                                                                {user.user_type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                                        onClick={() => fetchAndShowUserJourney(user.id, user.name)}
                                                    >
                                                        <ActivitySquare className="w-3 h-3 mr-1" />
                                                        Journey
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                                        onClick={() => toast.error('Action Restricted', { description: 'Contact Tier 2 Admin to suspend accounts.' })}
                                                        title="Suspend User"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Activity Terminal */}
                        <Card className="bg-[#0A0A0A] border-slate-800 backdrop-blur-xl font-mono relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"></div>
                            <CardHeader className="pb-2 border-b border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-emerald-500" />
                                    <CardTitle className="text-sm font-bold text-emerald-500 tracking-wider">LIVE_PLATFORM_FEED_v1.0</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 h-48 overflow-y-auto custom-scrollbar">
                                <div className="space-y-3">
                                    {systemLogs.map((log) => (
                                        <div key={log.id} className="text-xs flex gap-3 animate-fade-in-up">
                                            <span className="text-slate-600 shrink-0">
                                                [{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                            </span>
                                            <span className={
                                                log.level === 'error' ? 'text-rose-400' :
                                                    log.level === 'warning' ? 'text-amber-400' :
                                                        log.source === 'ai' ? 'text-purple-400' :
                                                            'text-emerald-400'
                                            }>
                                                {log.level === 'error' && '> ERROR: '}
                                                {log.level === 'warning' && '> WARNING: '}
                                                <span className="uppercase text-[10px] opacity-70 mr-1">[{log.source}]</span>
                                                {log.message}
                                                {log.user_name && <span className="text-slate-500 ml-1">({log.user_name})</span>}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="text-xs flex gap-3 animate-pulse mt-2">
                                        <span className="text-emerald-500">_</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>

            {/* User Journey Modal */}
            {journeyModalUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setJourneyModalUser(null)} />
                    <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 shadow-2xl relative z-10 animate-scale-in flex flex-col max-h-[80vh]">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                        <ActivitySquare className="w-5 h-5 text-indigo-400" />
                                        User Journey Explorer
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 mt-1">
                                        Chronological log for <span className="text-indigo-300 font-semibold">{journeyModalUser.name}</span>
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setJourneyModalUser(null)}>
                                    <span className="sr-only">Close</span>
                                    <ShieldAlert className="w-5 h-5 opacity-0" /> {/* Spacer */}
                                    Close
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                            {isLoadingJourney ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : selectedUserJourney && selectedUserJourney.length > 0 ? (
                                <div className="relative p-6">
                                    <div className="absolute left-10 top-6 bottom-6 w-px bg-slate-800"></div>
                                    <div className="space-y-6">
                                        {selectedUserJourney.map((log, index) => (
                                            <div key={log.id} className="relative pl-12">
                                                <div className="absolute left-[-21px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900 z-10"></div>
                                                <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-indigo-300 text-sm">{log.action_type.toUpperCase().replace(/_/g, ' ')}</span>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {log.details && Object.keys(log.details).length > 0 && (
                                                        <div className="mt-2 p-3 bg-slate-950/50 rounded text-xs font-mono text-slate-400 overflow-x-auto">
                                                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                    No journey data recorded for this user yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
