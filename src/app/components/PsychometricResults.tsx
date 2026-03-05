import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
    Brain,
    Zap,
    Clock,
    BookOpen,
    Headphones,
    Eye,
    Hand,
    Lightbulb,
    Target,
    TrendingUp,
    Activity,
    CheckCircle2,
    Calculator,
    MessageSquare,
    Puzzle,
    Grid3x3,
    Sparkles
} from 'lucide-react';
import { useStudyPlan } from '../context/StudyPlanContext';
import { UserProfile, LearningSpeed } from '../types';

interface PsychometricResultsProps {
    profile?: UserProfile | null;
}

export const PsychometricResults: React.FC<PsychometricResultsProps> = ({ profile }) => {
    const { userProfile: contextProfile } = useStudyPlan();

    // Use provided profile or fall back to context
    const userProfile = profile !== undefined ? profile : contextProfile;

    if (!userProfile) return null;

    const { learningSpeed, learningStyle, psychometricDetails } = userProfile;

    // Helper to get style details
    const getStyleDetails = (style?: string) => {
        const normalizedStyle = (style || '').toLowerCase();
        if (normalizedStyle.includes('visual')) {
            return {
                icon: Eye,
                label: 'Visual Learner',
                color: 'text-blue-600',
                bg: 'bg-blue-100',
                borderColor: 'border-blue-200',
                description: 'You learn best by seeing. Diagrams, charts, and written notes are your best friends.',
                tips: [
                    'Use color codes for different topics',
                    'Create mind maps and flowcharts',
                    'Watch video tutorials and demonstrations'
                ]
            };
        }
        if (normalizedStyle.includes('auditory')) {
            return {
                icon: Headphones,
                label: 'Auditory Learner',
                color: 'text-purple-600',
                bg: 'bg-purple-100',
                borderColor: 'border-purple-200',
                description: 'You learn best by listening. Explanations, discussions, and audiobooks work well for you.',
                tips: [
                    'Record lectures and listen to them later',
                    'Participate in group discussions',
                    'Read notes aloud to yourself'
                ]
            };
        }
        if (normalizedStyle.includes('kinesthetic')) {
            return {
                icon: Activity,
                label: 'Kinesthetic Learner',
                color: 'text-orange-600',
                bg: 'bg-orange-100',
                borderColor: 'border-orange-200',
                description: 'You learn best by doing. Hands-on practice and real-world applications help you retain information.',
                tips: [
                    'Use physical objects or models',
                    'Take frequent breaks to move around',
                    'Teach what you learned to someone else'
                ]
            };
        }
        return {
            icon: Brain,
            label: style || 'Balanced Learner',
            color: 'text-slate-600',
            bg: 'bg-slate-100',
            borderColor: 'border-slate-200',
            description: 'You have a mixed learning style. You can adapt to various teaching methods.',
            tips: [
                'Experiment with different study techniques',
                'Combine visual aids with active practice',
                'Find what works best for each subject'
            ]
        };
    };

    const styleDetails = getStyleDetails(learningStyle);
    const StyleIcon = styleDetails.icon;

    // Helper to get speed details
    const getSpeedDetails = (speed: LearningSpeed) => {
        switch (speed) {
            case 'fast':
                return {
                    label: 'Fast Paced',
                    score: 85,
                    color: 'bg-green-500',
                    textColor: 'text-green-700',
                    description: 'You grasp new concepts quickly. You typically need less repetition.'
                };
            case 'average':
                return {
                    label: 'Steady Paced',
                    score: 60,
                    color: 'bg-blue-500',
                    textColor: 'text-blue-700',
                    description: 'You have a balanced learning speed. Consistent practice yields good results.'
                };
            case 'slow':
                return {
                    label: 'Thorough Paced',
                    score: 35,
                    color: 'bg-orange-500',
                    textColor: 'text-orange-700',
                    description: 'You take time to understand deeply. You prefer mastering one concept before moving on.'
                };
            default:
                return {
                    label: 'Assessing...',
                    score: 50,
                    color: 'bg-slate-300',
                    textColor: 'text-slate-700',
                    description: 'Your learning speed is being calibrated.'
                };
        }
    };

    const speedDetails = getSpeedDetails(learningSpeed);

    return (
        <Card className="border-none shadow-md bg-white overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-600" />
                            Learning Profile
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">
                            AI-driven psychometric analysis
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100">
                        High Fidelity
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Learning Style Section */}
                    <div className={`rounded-3xl p-6 border-2 ${styleDetails.borderColor} ${styleDetails.bg} transition-all hover:shadow-md relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-start gap-4 h-full">
                            <div className={`p-4 rounded-2xl bg-white shadow-xl ${styleDetails.color}`}>
                                <StyleIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-black text-xl ${styleDetails.color} tracking-tight`}>
                                    {styleDetails.label}
                                </h3>
                                <p className="text-sm text-slate-700 font-bold mt-2 leading-relaxed opacity-90">
                                    {styleDetails.description}
                                </p>

                                <div className="mt-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-3.5 h-3.5 text-indigo-500" /> Optimized Study Strategy
                                    </p>
                                    <ul className="space-y-2">
                                        {styleDetails.tips.map((tip, i) => (
                                            <li key={i} className="text-sm text-slate-800 flex items-center gap-3 font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Learning Speed Section */}
                        <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                    <Zap className="w-5 h-5 text-indigo-500" />
                                    Cognitive Pace
                                </h3>
                                <Badge className={`${speedDetails.color} text-white border-none font-black px-3 rounded-lg`}>
                                    {speedDetails.label}
                                </Badge>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Thorough</span>
                                    <span>Balanced</span>
                                    <span>Rapid</span>
                                </div>
                                <Progress value={speedDetails.score} className="h-4 rounded-full bg-slate-200 [&>div]:bg-indigo-600" />
                            </div>

                            <p className="text-sm text-slate-600 font-bold leading-relaxed">
                                {speedDetails.description}
                            </p>
                        </div>

                        {/* AI Recommendation */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors"></div>
                            <h4 className="font-black text-white text-xs mb-3 flex items-center gap-2 uppercase tracking-widest opacity-80">
                                <Sparkles className="w-4 h-4" />
                                Smart Recommendation
                            </h4>
                            <div className="text-base font-bold leading-snug">
                                {learningSpeed === 'fast' ? (
                                    "Accelerated revision modules & advanced problem sets injected into the final exam prep phase."
                                ) : learningSpeed === 'slow' ? (
                                    "Deep-diving sessions with multi-stage review loops to ensure absolute concept mastery before transitions."
                                ) : (
                                    "Standard balanced curriculum with periodic cognitive resets and optimized subject alternation."
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Cognitive Precision Section */}
                {psychometricDetails && (
                    <div className="bg-white rounded-[32px] p-8 border-2 border-indigo-50 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Target className="w-6 h-6 text-emerald-500" />
                                    Cognitive Precision
                                </h3>
                                <p className="text-sm font-bold text-slate-400 mt-1">Detailed performance across reasoning domains</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aptitude Score</p>
                                    <p className="text-2xl font-black text-emerald-600">{Math.round(psychometricDetails.accuracy || 0)}%</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Numerical', icon: Calculator, color: 'indigo', value: psychometricDetails.categoryScores?.numerical || 0 },
                                { label: 'Verbal', icon: MessageSquare, color: 'purple', value: psychometricDetails.categoryScores?.verbal || 0 },
                                { label: 'Logical', icon: Puzzle, color: 'fuchsia', value: psychometricDetails.categoryScores?.logical || 0 },
                                { label: 'Spatial', icon: Grid3x3, color: 'blue', value: psychometricDetails.categoryScores?.spatial || 0 }
                            ].map((cat, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl bg-${cat.color}-50/50 border border-${cat.color}-100 flex flex-col gap-4 group hover:bg-${cat.color}-50 transition-colors`}>
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2 rounded-xl bg-${cat.color}-100 text-${cat.color}-600 group-hover:scale-110 transition-transform`}>
                                            <cat.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-black text-slate-900">{Math.round(cat.value * 100)}%</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{cat.label}</p>
                                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                            <div
                                                className={`h-full bg-${cat.color}-500 transition-all duration-1000`}
                                                style={{ width: `${cat.value * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Processed</p>
                                    <p className="font-black text-slate-900 text-lg">{psychometricDetails.correctAnswers || 0} / {psychometricDetails.totalQuestions || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processing Speed</p>
                                    <p className="font-black text-slate-900 text-lg">{(psychometricDetails.avgTimePerQuestion || 0).toFixed(1)}s <span className="text-xs text-slate-400 font-bold">/ q</span></p>
                                </div>
                            </div>
                            <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-black text-emerald-700">Cognitive Load Optimized for syllabus generation</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
