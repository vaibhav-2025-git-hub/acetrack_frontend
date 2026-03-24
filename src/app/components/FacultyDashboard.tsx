import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Download,
  Search,
  Filter,
  GraduationCap,
  Settings,
  LogOut,
  Zap,
  Lock,
  Unlock,
  Send,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  LayoutDashboard,
  Library,
  BarChart,
  Map,
  Workflow,
  PenTool,
  ArrowRight,
  Eye,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authAPI, quizzesAPI, curriculumAPI, flashcardsAPI } from '../services/api';
import { GlobalAnnouncement } from './GlobalAnnouncement';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  class: string;
  questions: Question[];
  createdAt: string;
  is_published?: boolean;
}

interface Question {
  id: string; // Backend uses int but string is safer for TS
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CurriculumTopic {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  estimatedHours: number;
  resources: any[];
}

interface Flashcard {
  id: string;
  subject_id: string;
  topic_id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  next_review_date?: string;
  is_published?: boolean;
}

interface FacultyDashboardProps {
  onLogout: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Initialize empty
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Quiz Management
  const [newQuizData, setNewQuizData] = useState({
    title: '',
    subject: '',
    class: '12',
  });

  const [newQuestionData, setNewQuestionData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  // Curriculum Management
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>([]);

  // Flashcard Management
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [newFlashcardData, setNewFlashcardData] = useState({
    subject_id: 'physics',
    topic_id: '',
    question: '',
    answer: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    activeStudents: 0,
    avgScore: 0
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await quizzesAPI.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch stats");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'quizzes') {
        const response = await quizzesAPI.getAll();
        if (response.success) {
          // Map backend data to frontend structure if needed
          // Backend returns: { id, title, subject, class, questions: [...] }
          // Questions in backend: { quiz_id, question, options (stringified), correct_answer, ... }
          const mappedQuizzes = response.data.map((q: any) => ({
            ...q,
            questions: q.questions ? q.questions.map((qn: any) => ({
              ...qn,
              options: typeof qn.options === 'string' ? JSON.parse(qn.options) : qn.options
            })) : []
          }));
          setQuizzes(mappedQuizzes);
        }
      } else if (activeTab === 'curriculum') {
        const res = await curriculumAPI.getAll();
        if (res.success && Array.isArray(res.data)) {
          setCurriculumTopics(res.data);
        }
      } else if (activeTab === 'flashcards') {
        const res = await flashcardsAPI.get();
        if (res.success && Array.isArray(res.data)) {
          setFlashcards(res.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data', error);
      // toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };


  // Sync currentQuiz when quizzes list updates (e.g. after adding question)
  useEffect(() => {
    if (currentQuiz) {
      const updated = quizzes.find(q => q.id === currentQuiz.id);
      if (updated) {
        setCurrentQuiz(updated);
      }
    }
  }, [quizzes]);

  const [newTopicData, setNewTopicData] = useState({
    subject: 'Physics',
    chapter: '',
    topic: '',
    estimatedHours: 1
  });

  const handleAddTopic = async () => {
    if (!newTopicData.chapter || !newTopicData.topic) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await curriculumAPI.add({
        subject: newTopicData.subject,
        chapter: newTopicData.chapter,
        topic: newTopicData.topic,
        estimatedHours: newTopicData.estimatedHours,
        resources: []
      });
      toast.success("Topic added to curriculum");
      setNewTopicData({ ...newTopicData, topic: '', estimatedHours: 1 });
      fetchData(); // Reload
    } catch (error) {
      toast.error("Failed to add topic");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await curriculumAPI.delete(id);
      toast.success("Topic removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete topic");
    }
  };

  const handleCreateQuiz = async () => {
    if (!newQuizData.title || !newQuizData.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await quizzesAPI.create({
        title: newQuizData.title,
        subject: newQuizData.subject,
        class: newQuizData.class,
        questions: []
      });
      toast.success('Quiz created successfully!');
      setNewQuizData({ title: '', subject: '', class: '11' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  const handleCreateFlashcard = async () => {
    if (!newFlashcardData.question || !newFlashcardData.answer) {
      toast.error('Question and Answer are required');
      return;
    }

    try {
      if (editingFlashcard) {
        await flashcardsAPI.update(editingFlashcard.id, newFlashcardData);
        toast.success('Flashcard updated');
        setEditingFlashcard(null);
      } else {
        await flashcardsAPI.create(newFlashcardData);
        toast.success('Flashcard created');
      }
      setNewFlashcardData({
        subject_id: 'physics',
        topic_id: '',
        question: '',
        answer: '',
        difficulty: 'medium',
      });
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (!confirm('Delete this flashcard?')) return;
    try {
      await flashcardsAPI.delete(id);
      toast.success('Flashcard deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const startEditFlashcard = (card: Flashcard) => {
    setEditingFlashcard(card);
    setNewFlashcardData({
      subject_id: card.subject_id,
      topic_id: card.topic_id,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
    });
  };

  const handleAddQuestion = async () => {
    if (!currentQuiz) {
      toast.error('Please select a quiz first');
      return;
    }

    if (!newQuestionData.question || !newQuestionData.option1 || !newQuestionData.option2) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await quizzesAPI.addQuestion(currentQuiz.id, {
        question: newQuestionData.question,
        options: [
          newQuestionData.option1,
          newQuestionData.option2,
          newQuestionData.option3,
          newQuestionData.option4
        ].filter(opt => opt !== ''),
        correctAnswer: newQuestionData.correctAnswer,
        explanation: newQuestionData.explanation,
        difficulty: newQuestionData.difficulty
      });

      toast.success('Question added successfully!');

      // Reset form
      setNewQuestionData({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: 0,
        explanation: '',
        difficulty: 'medium',
      });

      // Refetch to update UI
      fetchData();

      // We also need to update currentQuiz because it drives the right-side view
      // But fetchData updates 'quizzes'. We need to re-find currentQuiz from updated quizzes.
      // Since fetchData is async and state update is batched, we might lose selection or need a useEffect to sync currentQuiz.
      // For now, simpler to just re-fetch and rely on user re-selecting or manual sync?
      // Better: Update currentQuiz manually with a temp ID or fetch the single quiz?
      // Best: Add a 'reload' helper or simple re-selection logic.
    } catch (error) {
      toast.error('Failed to add question');
      console.error(error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await quizzesAPI.delete(quizId);
      toast.success('Quiz deleted successfully!');
      if (currentQuiz?.id === quizId) {
        setCurrentQuiz(null);
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentQuiz) return;
    if (!confirm("Delete this question?")) return;

    try {
      await quizzesAPI.deleteQuestion(questionId);
      toast.success('Question deleted successfully!');
      fetchData();
      // Optimistically remove for smoother UI? 
      // Or wait for refetch.
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to publish this quiz? Students will be able to see it immediately.")) return;
    try {
      await quizzesAPI.publish(quizId);
      toast.success("Quiz published successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to publish quiz");
    }
  };

  const handlePublishFlashcards = async (subjectId: string) => {
    if (!confirm(`Publish all draft flashcards for ${subjectId}?`)) return;
    try {
      await flashcardsAPI.publish(subjectId);
      toast.success("Flashcards published successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to publish flashcards");
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 p-6 overflow-hidden">
      <GlobalAnnouncement />
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/3 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* New Premium Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[40px] opacity-10 blur-2xl group-hover:opacity-20 transition duration-700"></div>
          <div className="relative bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[38px] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 transform transition-transform group-hover:scale-105">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Faculty Control Active</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Faculty Studio<span className="text-emerald-500">.</span>
                </h1>
                <p className="text-slate-500 font-bold mt-1 max-w-md">Architecting excellence through curriculum curation and content mastery.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="bg-white/50 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-emerald-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                    <DialogDescription>Update your faculty profile details here.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" defaultValue="Dr. Sarah Wilson" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={() => toast.success("Settings saved successfully!")}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleLogout}
                className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-sm hover:bg-rose-500 hover:text-white transition-all text-rose-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Redesigned */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Quizzes', value: quizzes.length, icon: <FileText className="w-6 h-6" />, color: 'emerald', sub: 'Active Collection' },
            { label: 'Questions', value: quizzes.reduce((sum, q) => sum + q.questions.length, 0), icon: <CheckCircle className="w-6 h-6" />, color: 'teal', sub: 'Verified Items' },
            { label: 'Active Students', value: stats.activeStudents, icon: <Users className="w-6 h-6" />, color: 'cyan', sub: 'Currently Engaged' },
            { label: 'Average Score', value: `${stats.avgScore}%`, icon: <BarChart3 className="w-6 h-6" />, color: 'purple', sub: 'Cohort Mastery' }
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/70 backdrop-blur-2xl shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12`}>
                  <div className={`text-${stat.color}-600`}>{stat.icon}</div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {stat.sub}
                </p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          ))}
        </div>

        {/* Tabs - Advanced Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/50 backdrop-blur-3xl border-2 border-white/60 p-2 rounded-[28px] h-fit flex gap-4 shadow-xl">
            {[
              { id: 'quizzes', label: 'Quiz Studio Pro', icon: <PenTool className="w-5 h-5" /> },
              { id: 'curriculum', label: 'Curriculum Architect', icon: <Library className="w-5 h-5" /> },
              { id: 'flashcards', label: 'Flashcard Vault', icon: <Zap className="w-5 h-5" /> }
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200 px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-emerald-600"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Quiz Management Tab */}
          <TabsContent value="quizzes" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Side - Quiz Collection */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Library className="w-6 h-6 text-emerald-500" />
                      Quiz Collection
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{filteredQuizzes.length} Items</span>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      placeholder="Search by title or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-3xl font-bold text-slate-700 shadow-sm focus:shadow-md transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="max-h-[700px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {filteredQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => setCurrentQuiz(quiz)}
                        className={`group relative p-6 rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden ${currentQuiz?.id === quiz.id
                          ? 'bg-white border-emerald-500 shadow-2xl scale-[1.02]'
                          : 'bg-white/40 border-white/60 hover:border-emerald-200 hover:bg-white/60'
                          }`}
                      >
                        {currentQuiz?.id === quiz.id && (
                          <div className="absolute top-0 right-0 p-4">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${currentQuiz?.id === quiz.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {quiz.subject.charAt(0)}
                          </div>
                          <div className="flex gap-2">
                            {!quiz.is_published ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePublishQuiz(quiz.id); }}
                                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            ) : (
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                              className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-2">{quiz.title}</h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {quiz.subject}</span>
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {quiz.questions.length} Items</span>
                          <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Class {quiz.class}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create New Quiz - Redesigned */}
                  <div className="relative group p-8 rounded-[38px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 shadow-lg overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-500" />
                      New Blueprint
                    </h4>
                    <div className="space-y-4 relative z-10">
                      <Input
                        placeholder="Project Title"
                        value={newQuizData.title}
                        onChange={(e) => setNewQuizData({ ...newQuizData, title: e.target.value })}
                        className="h-12 bg-white/80 border-white rounded-2xl font-bold shadow-sm"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Subject"
                          value={newQuizData.subject}
                          onChange={(e) => setNewQuizData({ ...newQuizData, subject: e.target.value })}
                          className="h-12 bg-white/80 border-white rounded-2xl font-bold shadow-sm"
                        />
                        <select
                          value={newQuizData.class}
                          onChange={(e) => setNewQuizData({ ...newQuizData, class: e.target.value })}
                          className="h-12 bg-white/80 border-white rounded-2xl font-bold shadow-sm px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="12">Class 12</option>
                        </select>
                      </div>
                      <button
                        onClick={handleCreateQuiz}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95"
                      >
                        Initialize Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Question Studio */}
              <div className="lg:col-span-7">
                <div className="bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[40px] shadow-2xl overflow-hidden min-h-[800px] flex flex-col">
                  {currentQuiz ? (
                    <>
                      <div className="p-8 border-b border-slate-100 bg-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full">Active Studio Session</span>
                          <div className="flex gap-2">
                            <button className="text-slate-400 hover:text-slate-600"><Info className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentQuiz.title}</h2>
                        <p className="text-slate-500 font-bold text-sm mt-1">{currentQuiz.subject} • {currentQuiz.questions.length} Questions Drafted</p>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        {/* Questions List */}
                        {currentQuiz.questions.length > 0 && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="h-0.5 flex-1 bg-slate-100"></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blueprint Content</span>
                              <div className="h-0.5 flex-1 bg-slate-100"></div>
                            </div>

                            <div className="space-y-4">
                              {currentQuiz.questions.map((question, index) => (
                                <div key={question.id} className="group p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-100 hover:shadow-xl transition-all">
                                  <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800 text-lg leading-tight">{question.question}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteQuestion(question.id)}
                                      className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pl-14">
                                    {question.options.map((opt, idx) => (
                                      <div key={idx} className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 ${idx === question.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}>
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${idx === question.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                                          }`}>
                                          {String.fromCharCode(65 + idx)}
                                        </div>
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Question Editor */}
                        <div className="space-y-6 pt-6">
                          <div className="flex items-center gap-3">
                            <div className="h-0.5 flex-1 bg-emerald-100"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">New Entry Component</span>
                            <div className="h-0.5 flex-1 bg-emerald-100"></div>
                          </div>

                          <div className="bg-emerald-50/30 border-2 border-emerald-100/50 rounded-[38px] p-8 space-y-6">
                            <div className="space-y-4">
                              <Label className="text-xs font-black text-emerald-600 uppercase tracking-widest pl-2">Inquiry Prompt</Label>
                              <textarea
                                placeholder="Type your advanced question here..."
                                value={newQuestionData.question}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                                className="w-full h-24 p-5 bg-white border-2 border-white rounded-3xl font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[
                                { id: '1', label: 'Option A' },
                                { id: '2', label: 'Option B' },
                                { id: '3', label: 'Option C' },
                                { id: '4', label: 'Option D' }
                              ].map((opt, i) => (
                                <div key={i} className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{opt.label}</Label>
                                  <Input
                                    placeholder={`Enter ${opt.label}...`}
                                    value={(newQuestionData as any)[`option${opt.id}`]}
                                    onChange={(e) => setNewQuestionData({ ...newQuestionData, [`option${opt.id}`]: e.target.value })}
                                    className="h-12 bg-white border-white rounded-2xl font-bold shadow-sm"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Accuracy Key</Label>
                                <select
                                  value={newQuestionData.correctAnswer}
                                  onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: parseInt(e.target.value) })}
                                  className="w-full h-12 bg-white border-white rounded-2xl font-bold shadow-sm px-4 focus:outline-none"
                                >
                                  <option value={0}>Option A is Correct</option>
                                  <option value={1}>Option B is Correct</option>
                                  <option value={2}>Option C is Correct</option>
                                  <option value={3}>Option D is Correct</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Complexity Level</Label>
                                <select
                                  value={newQuestionData.difficulty}
                                  onChange={(e) => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value as any })}
                                  className="w-full h-12 bg-white border-white rounded-2xl font-bold shadow-sm px-4 focus:outline-none"
                                >
                                  <option value="easy">Elementary</option>
                                  <option value="medium">Intermediate</option>
                                  <option value="hard">Advanced</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Insight / Explanation</Label>
                              <Input
                                placeholder="Describe the logic path..."
                                value={newQuestionData.explanation}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
                                className="h-12 bg-white border-white rounded-2xl font-bold shadow-sm"
                              />
                            </div>

                            <button
                              onClick={handleAddQuestion}
                              className="w-full h-14 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-2xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all group"
                            >
                              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                              Commit Question to Blueprint
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-8">
                        <Library className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Initialize Architect Workspace</h3>
                      <p className="text-slate-500 font-bold max-w-xs mx-auto">Select a quiz project from the collection to begin content orchestration.</p>
                      <div className="mt-8 flex gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>


          {/* Curriculum Architect Tab */}
          <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Side - Topic Blueprint */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                      <Map className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Add Topic</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blueprint Generator</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Subject Category</Label>
                      <Input
                        value={newTopicData.subject}
                        onChange={(e) => setNewTopicData({ ...newTopicData, subject: e.target.value })}
                        placeholder="e.g. Physics"
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Chapter / Module</Label>
                      <Input
                        value={newTopicData.chapter}
                        onChange={(e) => setNewTopicData({ ...newTopicData, chapter: e.target.value })}
                        placeholder="e.g. Kinematics"
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Specific Topic</Label>
                      <Input
                        value={newTopicData.topic}
                        onChange={(e) => setNewTopicData({ ...newTopicData, topic: e.target.value })}
                        placeholder="e.g. Projectile Motion"
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Estimated Mastery Time (Hrs)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newTopicData.estimatedHours}
                        onChange={(e) => setNewTopicData({ ...newTopicData, estimatedHours: parseInt(e.target.value) || 1 })}
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddTopic}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <Plus className="w-5 h-5" />
                      Inject into Syllabus
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side - Syllabus Explorer */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Workflow className="w-7 h-7 text-blue-500" />
                      Curriculum Roadmap
                    </h3>
                    <div className="bg-white/50 backdrop-blur border border-white px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {curriculumTopics.length} Modules Active
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {curriculumTopics.map((topic) => (
                      <div key={topic.id} className="group relative p-6 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-[32px] hover:border-blue-200 hover:shadow-2xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {topic.subject}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">• {topic.chapter}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="opacity-0 group-hover:opacity-100 w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4">{topic.topic}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">{topic.estimatedHours} hrs <span className="text-slate-300 italic">mastery</span></span>
                          </div>
                          <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/3 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {curriculumTopics.length === 0 && (
                      <div className="md:col-span-2 py-20 bg-white/40 border-2 border-dashed border-white rounded-[40px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-6">
                          <Map className="w-10 h-10 text-slate-300" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Architectural Blueprint Empty</h4>
                        <p className="text-slate-400 font-bold max-w-xs px-8">Define your primary curriculum modules to begin student path orchestration.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Flashcard Vault Tab */}
          <TabsContent value="flashcards" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Side - Flashcard Factory */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Flashcard Factory</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rapid Recall Engine</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Subject Anchor</Label>
                      <Input
                        value={newFlashcardData.subject_id}
                        onChange={(e) => setNewFlashcardData({ ...newFlashcardData, subject_id: e.target.value })}
                        placeholder="e.g. physics"
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Topic Link</Label>
                      <Input
                        value={newFlashcardData.topic_id}
                        onChange={(e) => setNewFlashcardData({ ...newFlashcardData, topic_id: e.target.value })}
                        placeholder="e.g. kinematics"
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Recall Hook (Question)</Label>
                      <textarea
                        value={newFlashcardData.question}
                        onChange={(e) => setNewFlashcardData({ ...newFlashcardData, question: e.target.value })}
                        placeholder="The query for active recall..."
                        className="w-full h-24 p-5 bg-white/50 border-white border-2 rounded-2xl font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Core Response (Answer)</Label>
                      <Input
                        value={newFlashcardData.answer}
                        onChange={(e) => setNewFlashcardData({ ...newFlashcardData, answer: e.target.value })}
                        placeholder="The target knowledge..."
                        className="h-12 bg-white/50 border-white rounded-2xl font-bold px-4 shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Memory Weight</Label>
                        <select
                          value={newFlashcardData.difficulty}
                          onChange={(e) => setNewFlashcardData({ ...newFlashcardData, difficulty: e.target.value as any })}
                          className="w-full h-12 bg-white/50 border-white rounded-2xl font-bold px-4 focus:outline-none appearance-none"
                        >
                          <option value="easy">Low Frequency (Easy)</option>
                          <option value="medium">Standard (Medium)</option>
                          <option value="hard">High Intensity (Hard)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={handleCreateFlashcard}
                        className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-xl shadow-amber-200 transition-all flex items-center justify-center gap-2"
                      >
                        {editingFlashcard ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {editingFlashcard ? 'Apply Modifications' : 'Forge Flashcard'}
                      </button>

                      {editingFlashcard && (
                        <button
                          onClick={() => { setEditingFlashcard(null); setNewFlashcardData({ subject_id: 'physics', topic_id: '', question: '', answer: '', difficulty: 'medium' }); }}
                          className="w-full h-12 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center"
                        >
                          Abort Modification
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Global Actions */}
                <div className="p-8 rounded-[40px] bg-indigo-50 border-2 border-indigo-100 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Send className="w-20 h-20 text-indigo-900" />
                  </div>
                  <h4 className="text-lg font-black text-indigo-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Deploy Vault
                  </h4>
                  <p className="text-[10px] text-indigo-700 font-bold mb-6 opacity-60 uppercase tracking-widest">Broadcast all drafts to student active recall pools.</p>
                  <button
                    onClick={() => handlePublishFlashcards(newFlashcardData.subject_id)}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 transition-all"
                  >
                    Sync {newFlashcardData.subject_id} Fragments
                  </button>
                </div>
              </div>

              {/* Right Side - Memory Repository */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Sparkles className="w-7 h-7 text-amber-500" />
                      Recall Repository
                    </h3>
                    <div className="bg-white/50 backdrop-blur border border-white px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {flashcards.length} Units Stored
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {flashcards.map((card) => (
                      <div key={card.id} className="group relative p-6 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-[32px] hover:border-amber-200 hover:shadow-2xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${card.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                              card.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                              {card.difficulty} weight
                            </span>
                            {card.is_published ? (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                <Unlock className="w-3 h-3" /> Live
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> Encrypted Draft
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditFlashcard(card)}
                              className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlashcard(card.id)}
                              className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="pl-2 border-l-4 border-amber-500/20">
                          <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{card.question}</h4>
                          <p className="text-slate-500 font-bold text-sm italic">{card.answer}</p>
                        </div>
                      </div>
                    ))}
                    {flashcards.length === 0 && (
                      <div className="py-20 bg-white/40 border-2 border-dashed border-white rounded-[40px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-6">
                          <Zap className="w-10 h-10 text-slate-300" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Recall Engine Offline</h4>
                        <p className="text-slate-400 font-bold max-w-xs px-8">Construct your first memory fragment to begin rapid recall training deployment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyDashboard;

