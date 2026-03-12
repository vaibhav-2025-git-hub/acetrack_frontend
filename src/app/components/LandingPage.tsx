import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Sparkles, Brain, Target, ArrowRight, ShieldCheck, Zap, LineChart, BookOpen, Users, ArrowUpRight, Award, Play, X, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onAdminLogin?: () => void;
}

const ParallaxIcon = ({ children, baseRotation = 0 }: { children: React.ReactNode, baseRotation?: number }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = (clientX / window.innerWidth) - 0.5;
            const moveY = (clientY / window.innerHeight) - 0.5;
            x.set(moveX);
            y.set(moveY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [x, y]);

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                rotateZ: baseRotation
            }}
            className="perspective-1000"
        >
            {children}
        </motion.div>
    );
};

const PulseCorrectionGrid = () => {
    const [pulse, setPulse] = useState(false);
    const [rebalanced, setRebalanced] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 1000);
            
            // Randomly trigger rebalance animation
            if (Math.random() > 0.7) {
                setRebalanced(true);
                setTimeout(() => setRebalanced(false), 2000);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const nodes = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: (i % 4) * 60 + 20,
        y: Math.floor(i / 4) * 60 + 20,
    }));

    return (
        <div className="relative w-full h-[240px] bg-slate-900/5 rounded-3xl overflow-hidden border border-slate-200/50 flex items-center justify-center">
            <svg width="280" height="200" viewBox="0 0 280 200" className="opacity-60">
                {/* Connection Lines */}
                {nodes.map((node, i) => (
                    <React.Fragment key={`lines-${i}`}>
                        {nodes.slice(i + 1).map((other, j) => {
                            const dist = Math.sqrt(Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2));
                            if (dist < 80) {
                                return (
                                    <motion.line
                                        key={`line-${i}-${j}`}
                                        x1={node.x} y1={node.y}
                                        x2={other.x} y2={other.y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        className="text-indigo-400"
                                        animate={{
                                            strokeOpacity: pulse ? [0.2, 0.6, 0.2] : 0.2,
                                            strokeWidth: pulse ? [1, 2, 1] : 1
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}
                    </React.Fragment>
                ))}
                {/* Nodes */}
                {nodes.map((node, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        cx={node.x}
                        cy={node.y}
                        r="4"
                        fill="currentColor"
                        className={i === 5 && rebalanced ? "text-rose-500" : "text-indigo-500"}
                        animate={rebalanced ? {
                            x: i === 5 ? node.x - 20 : node.x + (Math.random() * 4 - 2),
                            y: i === 5 ? node.y + 10 : node.y + (Math.random() * 4 - 2),
                            scale: i === 5 ? [1, 1.5, 0] : 1
                        } : {
                            x: node.x,
                            y: node.y,
                            scale: pulse ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: rebalanced ? 0.8 : 0.5 }}
                    />
                ))}
            </svg>
            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${rebalanced ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {rebalanced ? 'Recalculating Load...' : 'System Balanced'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onAdminLogin }) => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    // Mood Shifting Colors
    // 0: Hero (Sunrise)
    // 0.4: Features (Focus)
    // 0.8+: CTA/Footer (Reflection)
    const blob1Color = useTransform(
        scrollYProgress,
        [0, 0.4, 0.8],
        ["rgba(129, 140, 248, 0.2)", "rgba(79, 70, 229, 0.3)", "rgba(147, 51, 234, 0.2)"]
    );
    const blob2Color = useTransform(
        scrollYProgress,
        [0, 0.4, 0.8],
        ["rgba(192, 132, 252, 0.2)", "rgba(14, 165, 233, 0.3)", "rgba(219, 39, 119, 0.2)"]
    );
    const blob3Color = useTransform(
        scrollYProgress,
        [0, 0.4, 0.8],
        ["rgba(244, 114, 182, 0.2)", "rgba(45, 212, 191, 0.3)", "rgba(79, 70, 229, 0.2)"]
    );

    const focusAuraScale = useSpring(
        useTransform(scrollYProgress, [0.1, 0.3], [1, 1.2]),
        { stiffness: 100, damping: 30 }
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* Aura Background Blobs with Mood Shifting */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div 
                    style={{ backgroundColor: blob1Color }}
                    animate={{
                        x: [0, 100, 50, -50, 0],
                        y: [0, 50, 100, 50, 0],
                        scale: [1, 1.2, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 blur-[120px] rounded-full" 
                />
                <motion.div 
                    style={{ backgroundColor: blob2Color }}
                    animate={{
                        x: [0, -80, -120, -60, 0],
                        y: [0, 100, 40, 80, 0],
                        scale: [1, 0.8, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 blur-[120px] rounded-full" 
                />
                <motion.div 
                    style={{ backgroundColor: blob3Color }}
                    animate={{
                        x: [0, 60, -40, 30, 0],
                        y: [0, -70, -100, -40, 0],
                        scale: [1, 1.1, 0.8, 1.2, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 blur-[120px] rounded-full" 
                />
            </div>

            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">AceTrack</span>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <button
                                onClick={onLogin}
                                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                Log in
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
                            >
                                Get Started <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </nav>

            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
                <motion.div 
                    style={{ opacity, scale }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-indigo-100 shadow-sm backdrop-blur-sm mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-slate-800">The next generation of study planning</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8"
                    >
                        Master your studies with <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">AI-Powered Precision.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        AceTrack connects students, parents, and faculty on a single platform. We generate dynamic, personalized study plans that adapt to your progress based on the science of learning.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-2"
                        >
                            Start Learning for Free
                        </button>
                    </motion.div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        <div className="lg:col-span-8 group relative">
                            <motion.div 
                                style={{ scale: focusAuraScale }}
                                className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-[60px] pointer-events-none"
                            />
                            <ParallaxIcon>
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
                            </ParallaxIcon>
                            {/* Floating Icons for Parallax Effect */}
                            <div className="absolute -top-10 -right-10 hidden xl:block">
                                <ParallaxIcon baseRotation={15}>
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                                        <Brain className="w-10 h-10 text-indigo-600" />
                                    </div>
                                </ParallaxIcon>
                            </div>
                            <div className="absolute -bottom-10 -left-10 hidden xl:block">
                                <ParallaxIcon baseRotation={-10}>
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                                        <Target className="w-10 h-10 text-pink-600" />
                                    </div>
                                </ParallaxIcon>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="flex-1 relative rounded-[40px] p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-white/50 shadow-2xl overflow-hidden group backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'url("/assets/mobile_preview.png")' }}></div>
                                <div className="relative h-full aspect-[4/5] bg-slate-900/10 rounded-[32px] flex flex-col justify-end p-6 text-white">
                                    <div className="bg-emerald-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <h4 className="text-lg font-black mb-1">Mobile Companion</h4>
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Studying on the go</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 }}
                                className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border-2 border-white shadow-xl flex flex-col justify-center gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Adaptive AI</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic rescheduling</p>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "75%" }}
                                        transition={{ duration: 1, delay: 1 }}
                                        className="h-full bg-indigo-500 rounded-full" 
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-24 bg-white/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Everything you need to succeed.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Not just another to-do list. AceTrack is a complete ecosystem designed around the science of learning.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[300px]">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <Zap className="w-10 h-10 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Adaptive AI Scheduling</h3>
                                    <p className="text-slate-600">
                                        Our system learns your pace. Skipped a day? AceTrack automatically reschedules your sessions based on exam priority and cognitive load limits.
                                    </p>
                                </div>
                                <div className="relative">
                                    <PulseCorrectionGrid />
                                    <div className="absolute -top-4 -right-4 bg-white shadow-xl rounded-2xl p-4 border border-indigo-50 animate-bounce">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                                            <span className="text-xs font-black text-slate-900">AI Re-optimized</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 border border-purple-100 shadow-sm group hover:shadow-xl transition-all duration-500"
                        >
                            <LineChart className="w-10 h-10 text-purple-600 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Visual Analytics</h3>
                            <p className="text-slate-600">
                                Instantly spot weaknesses and track exam readiness with our beautiful, real-time KPI dashboards.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
                        >
                            <BookOpen className="w-10 h-10 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Built-in Active Recall</h3>
                            <p className="text-slate-600 max-w-md">
                                Ditch external apps. Faculty can push flashcards and quizzes directly into a student's daily study workflow.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row gap-12 items-center mb-16"
                    >
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                                One platform. <br className="hidden md:block" /> Three tailored views.
                            </h2>
                        </div>
                        <div className="md:w-1/2 text-slate-400 text-lg border-l border-slate-700 pl-6">
                            Unlike other tools that focus only on the student, AceTrack brings parents and teachers into the ecosystem without adding friction.
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "For Students",
                                icon: <Target className="w-7 h-7 text-indigo-400" />,
                                color: "indigo",
                                delay: 0.1,
                                text: "Take the guesswork out of studying. Log in, see exactly what you need to do today, take your quizzes, and watch your streak grow.",
                                features: ["Daily To-Do Lists", "Psychometric Profiling"]
                            },
                            {
                                title: "For Parents",
                                icon: <Users className="w-7 h-7 text-pink-400" />,
                                color: "pink",
                                delay: 0.2,
                                mt: "md:mt-8",
                                text: "Stay intensely informed without micro-managing. Connect your account to your child’s and view their exact exam readiness score.",
                                features: ["Exam Readiness Gauge", "Skipped Session Alerts", "Subject Weakness Tracking"]
                            },
                            {
                                title: "For Faculty",
                                icon: <BookOpen className="w-7 h-7 text-emerald-400" />,
                                color: "emerald",
                                delay: 0.3,
                                mt: "md:mt-16",
                                text: "A command center for curriculum. Easily deploy new topics, create flashcards, and publish quizzes directly to your students' feeds.",
                                features: ["Curriculum Management", "Direct Quiz Publishing", "Class Performance Stats"]
                            }
                        ].map((persona, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: persona.delay }}
                                className={`bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-[32px] hover:bg-slate-800 transition-all duration-500 hover:scale-[1.02] ${persona.mt || ""}`}
                            >
                                <div className={`w-14 h-14 bg-${persona.color}-500/20 rounded-2xl flex items-center justify-center mb-6`}>
                                    {persona.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{persona.title}</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    {persona.text}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {persona.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                            <ShieldCheck className={`w-4 h-4 text-${persona.color}-400`} /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white relative z-10 overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-8">
                            Ready to change the way you learn?
                        </h2>
                        <button
                            onClick={onGetStarted}
                            className="group relative px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 inline-flex items-center gap-3 active:scale-95"
                        >
                            Get Started Now 
                            <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
                {/* Floating Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-10 left-1/4 w-4 h-4 rounded-full bg-indigo-500 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full bg-purple-500 animate-bounce"></div>
                    <div className="absolute top-1/2 right-20 w-5 h-5 rounded-full bg-pink-500 animate-pulse animation-delay-500"></div>
                </div>
            </section>

            <footer className="bg-slate-50 border-t border-slate-200 py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">AceTrack</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        © {new Date().getFullYear()} AceTrack. Empowering student journeys.
                    </p>
                    <div className="flex gap-6 items-center">
                        <span className="text-sm font-bold text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">Privacy</span>
                        <span className="text-sm font-bold text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">Terms</span>
                        {onAdminLogin && (
                            <button
                                onClick={onAdminLogin}
                                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
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
