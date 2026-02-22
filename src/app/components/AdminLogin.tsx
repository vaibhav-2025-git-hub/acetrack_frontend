import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShieldAlert, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (credentials: { email: string; password: string; user_type: string }) => Promise<void>;
    onBack: () => void;
    isLoading?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack, isLoading = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        // We send 'platform_admin' as the requested user type
        onLogin({
            email,
            password,
            user_type: 'platform_admin'
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-sans">
            {/* Dark Mode Background Gradients for Admin Area */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium tracking-wide"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Public Portal
                </button>

                <Card className="border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-xl bg-slate-900/90 rounded-3xl">
                    <CardHeader className="pb-6 pt-10 px-8">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 mb-6 border border-slate-700">
                            <ShieldAlert className="w-8 h-8 text-indigo-400" />
                        </div>
                        <CardTitle className="text-3xl font-black text-white flex items-center gap-3">
                            System Admin
                        </CardTitle>
                        <CardDescription className="text-base text-slate-400 font-medium mt-2">
                            Authorized personnel only. Enter your master credentials to access the platform control center.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-300">Admin Email</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@acetrack.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 pl-4 pr-10 border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-bold text-slate-300">Master Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 pl-4 pr-10 border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all text-base"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Access Control Center'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
