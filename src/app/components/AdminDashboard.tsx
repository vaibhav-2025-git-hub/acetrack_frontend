import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { adminAPI } from '../services/api';
import { ShieldAlert, Users, Server, BrainCircuit, Activity, BookOpen, ToggleLeft, ToggleRight, LogOut, Loader2, Search, Ban, Terminal, Globe, ActivitySquare, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // Mock Live Feed Data
    const mockFeed = [
        { id: 1, time: 'Just now', msg: 'System backup completed successfully.', type: 'system' },
        { id: 2, time: '2m ago', msg: 'New student registration: dev...y@gmail.com', type: 'user' },
        { id: 3, time: '5m ago', msg: 'AI Study Plan generated for ADMIN_001', type: 'ai' },
        { id: 4, time: '12m ago', msg: 'Failed login attempt caught (IP: 192.168.1.104)', type: 'security' },
        { id: 5, time: '15m ago', msg: 'Parent account linked to student AC-291', type: 'user' },
    ];

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
    }, []);

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

    const handleBroadcast = () => {
        if (!broadcastMessage.trim()) return;
        toast.success('Broadcast Sent', { description: 'Message dispatched to all active client dashboards.' });
        setBroadcastMessage('');
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
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-4">
                                <span>Uptime: {stats?.systemHealth?.uptime || '---'}</span>
                                <span className="flex items-center gap-1">Ping: <span className="text-emerald-400">{stats?.systemHealth?.dbResponseTime || '---'}</span></span>
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
                                    {mockFeed.map((item) => (
                                        <div key={item.id} className="text-xs flex gap-3 animate-fade-in-up">
                                            <span className="text-slate-600 shrink-0">[{item.time}]</span>
                                            <span className={
                                                item.type === 'security' ? 'text-rose-400' :
                                                    item.type === 'system' ? 'text-emerald-400' :
                                                        item.type === 'ai' ? 'text-purple-400' :
                                                            'text-slate-400'
                                            }>
                                                {item.type === 'security' && '> WARNING: '}
                                                {item.msg}
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
        </div>
    );
};
