import React from 'react';
import { Sparkles, Brain, Target, ArrowRight, ShieldCheck, Zap, LineChart, BookOpen, Users, ArrowUpRight, Award, Play, X, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onAdminLogin?: () => void;
}

interface VideoModalProps {
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose}></div>
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 to-slate-900/40">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <Play className="w-10 h-10 text-white fill-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">AceTrack Platform Overview</h3>
                <p className="text-slate-400 font-bold">Watch how AI transforms your study planning</p>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <Brain className="w-64 h-64 text-indigo-500" />
                </div>
            </div>
        </div>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onAdminLogin }) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* 
        ---------------------------------------------
        1. NAVIGATION BAR
        ---------------------------------------------
      */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">AceTrack</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onLogin}
                                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Log in
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2"
                            >
                                Get Started <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 
        ---------------------------------------------
        2. HERO SECTION
        ---------------------------------------------
      */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400/20 blur-[120px] rounded-full point-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/20 blur-[100px] rounded-full point-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-400/20 blur-[100px] rounded-full point-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-indigo-100 shadow-sm backdrop-blur-sm mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-800">The next generation of study planning</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 animate-fade-in-up animation-delay-100">
                        Master your studies with <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">AI-Powered Precision.</span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
                        AceTrack connects students, parents, and faculty on a single platform. We generate dynamic, personalized study plans that adapt to your progress based on the science of learning.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                        >
                            Start Learning for Free
                        </button>
                        <button
                            onClick={() => setIsVideoModalOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            Watch Demo <Play className="w-5 h-5 text-indigo-600 fill-indigo-600/10" />
                        </button>
                    </div>
                </div>

                {isVideoModalOpen && <VideoModal onClose={() => setIsVideoModalOpen(false)} />}

                {/* High-Fidelity Product Showcase */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10 animate-fade-in-up animation-delay-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Dashboard Preview */}
                        <div className="lg:col-span-8 group">
                            <div className="relative rounded-[40px] p-2 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-white/50 shadow-2xl overflow-hidden backdrop-blur-sm">
                                <div className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: 'url("/assets/dashboard_showcase.png")' }}></div>
                                <div className="relative aspect-[16/10] bg-slate-900/10 rounded-[32px] flex flex-col justify-end p-8 text-white">
                                    <div className="absolute top-8 left-8 flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/20 inline-block max-w-sm">
                                        <h4 className="text-xl font-black mb-1">Student Mission Control</h4>
                                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Real-time study adaptive logic</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile & Side Features */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="flex-1 relative rounded-[40px] p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-white/50 shadow-2xl overflow-hidden group backdrop-blur-sm">
                                <div className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'url("/assets/mobile_preview.png")' }}></div>
                                <div className="relative h-full aspect-[4/5] bg-slate-900/10 rounded-[32px] flex flex-col justify-end p-6 text-white">
                                    <div className="bg-emerald-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <h4 className="text-lg font-black mb-1">Mobile Companion</h4>
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Studying on the go</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border-2 border-white shadow-xl flex flex-col justify-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Adaptive AI</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic rescheduling</p>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[75%] bg-indigo-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 
        ---------------------------------------------
        3. BENTO GRID FEATURES SECTION
        ---------------------------------------------
      */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Everything you need to succeed.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Not just another to-do list. AceTrack is a complete ecosystem designed around the science of learning.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[300px]">
                        {/* Feature 1 - Large */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 blur-3xl rounded-full group-hover:bg-indigo-400/20 transition-colors" />
                            <Zap className="w-10 h-10 text-indigo-600 mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Adaptive AI Scheduling</h3>
                            <p className="text-slate-600 max-w-md">
                                Our system learns your pace. Skipped a day? AceTrack automatically reschedules your sessions based on exam priority and cognitive load limits.
                            </p>
                            <div className="absolute bottom-6 right-6 flex -space-x-3">
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center"><Target className="w-5 h-5 text-indigo-600" /></div>
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center"><LineChart className="w-5 h-5 text-purple-600" /></div>
                            </div>
                        </div>

                        {/* Feature 3 - Small */}
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 border border-purple-100 shadow-sm group hover:shadow-md transition-shadow">
                            <LineChart className="w-10 h-10 text-purple-600 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Visual Analytics</h3>
                            <p className="text-slate-600">
                                Instantly spot weaknesses and track exam readiness with our beautiful, real-time KPI dashboards.
                            </p>
                        </div>

                        {/* Feature 4 - Large -> Small to fit 2-col grid */}
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                            <BookOpen className="w-10 h-10 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Built-in Active Recall</h3>
                            <p className="text-slate-600 max-w-md">
                                Ditch external apps. Faculty can push flashcards and quizzes directly into a student's daily study workflow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 
        ---------------------------------------------
        4. USER PERSONAS SECTION
        ---------------------------------------------
      */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                                One platform. <br className="hidden md:block" /> Three tailored views.
                            </h2>
                        </div>
                        <div className="md:w-1/2 text-slate-400 text-lg border-l border-slate-700 pl-6">
                            Unlike other tools that focus only on the student, AceTrack brings parents and teachers into the ecosystem without adding friction.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Student Card */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
                            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">For Students</h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Take the guesswork out of studying. Log in, see exactly what you need to do today, take your quizzes, and watch your streak grow.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-indigo-400" /> Daily To-Do Lists</li>
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-indigo-400" /> Psychometric Profiling</li>
                            </ul>
                        </div>

                        {/* Parent Card */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors mt-0 md:mt-8">
                            <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-pink-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">For Parents</h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Stay intensely informed without micro-managing. Connect your account to your child’s and view their exact exam readiness score.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-pink-400" /> Exam Readiness Gauge</li>
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-pink-400" /> Skipped Session Alerts</li>
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-pink-400" /> Subject Weakness Tracking</li>
                            </ul>
                        </div>

                        {/* Faculty Card */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors mt-0 md:mt-16">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <BookOpen className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">For Faculty</h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                A command center for curriculum. Easily deploy new topics, create flashcards, and publish quizzes directly to your students' feeds.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Curriculum Management</li>
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Direct Quiz Publishing</li>
                                <li className="flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Class Performance Stats</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 
        ---------------------------------------------
        5. BOTTOM CTA & FOOTER
        ---------------------------------------------
      */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-8">
                        Ready to change the way you learn?
                    </h2>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 inline-flex items-center gap-2"
                    >
                        Get Started Now <ArrowUpRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <footer className="bg-slate-50 border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-indigo-600" />
                        <span className="text-xl font-black tracking-tight text-slate-900">AceTrack</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} AceTrack. All rights reserved.
                    </p>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Privacy</span>
                        <span className="text-sm font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Terms</span>
                        {onAdminLogin && (
                            <button
                                onClick={onAdminLogin}
                                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors ml-4"
                            >
                                System Admin
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};
