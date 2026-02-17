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
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authAPI, quizzesAPI, curriculumAPI } from '../services/api';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  class: string;
  questions: Question[];
  createdAt: string;
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

export const FacultyDashboard: React.FC = () => {
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
    class: '11',
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
            id: q.id.toString(),
            questions: q.questions.map((qn: any) => ({
              id: qn.id.toString(),
              question: qn.question,
              options: typeof qn.options === 'string' ? JSON.parse(qn.options) : qn.options,
              correctAnswer: qn.correct_answer,
              explanation: qn.explanation,
              difficulty: qn.difficulty
            }))
          }));
          setQuizzes(mappedQuizzes);
        }
      } else if (activeTab === 'curriculum') {
        const response = await curriculumAPI.getAll();
        if (response.success) {
          const mappedTopics = response.data.map((t: any) => ({
            id: t.id.toString(),
            subject: t.subject,
            chapter: t.chapter,
            topic: t.topic,
            estimatedHours: t.estimated_hours,
            resources: t.resources ? (typeof t.resources === 'string' ? JSON.parse(t.resources) : t.resources) : []
          }));
          setCurriculumTopics(mappedTopics);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load data. Please refresh.");
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

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    authAPI.logout();
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload(); // Ensure state is cleared
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                Faculty Dashboard
              </h1>
              <p className="text-lg text-slate-700 font-semibold">Manage quizzes, content, and curriculum</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your faculty profile details here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" defaultValue="Dr. Sarah Wilson" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" defaultValue="sarah.wilson@acetrack.edu" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Dept
                    </Label>
                    <Input id="department" defaultValue="Physics" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => toast.success("Settings saved successfully!")}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="ml-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase">Total Quizzes</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{quizzes.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase">Total Questions</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    {quizzes.reduce((sum, q) => sum + q.questions.length, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase">Active Students</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stats.activeStudents}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase">Avg. Score</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stats.avgScore}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-white/60 p-1">
            <TabsTrigger value="quizzes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-bold">
              <FileText className="w-4 h-4 mr-2" />
              Quiz Management
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-bold">
              <BookOpen className="w-4 h-4 mr-2" />
              Curriculum Editor
            </TabsTrigger>
          </TabsList>

          {/* Quiz Management Tab */}
          <TabsContent value="quizzes" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Quiz List */}
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-slate-900">Your Quizzes</CardTitle>
                  <CardDescription className="text-slate-700 font-semibold">
                    Manage and edit your quiz collection
                  </CardDescription>

                  {/* Search */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-semibold"
                    />
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-3">
                    {filteredQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${currentQuiz?.id === quiz.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 bg-white hover:border-green-300'
                          }`}
                        onClick={() => setCurrentQuiz(quiz)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-base mb-1">{quiz.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {quiz.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {quiz.questions.length} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                Class {quiz.class}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(quiz.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create New Quiz */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                    <h4 className="font-bold text-slate-900 mb-3 text-base">Create New Quiz</h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Quiz Title"
                        value={newQuizData.title}
                        onChange={(e) => setNewQuizData({ ...newQuizData, title: e.target.value })}
                        className="font-semibold"
                      />
                      <Input
                        placeholder="Subject"
                        value={newQuizData.subject}
                        onChange={(e) => setNewQuizData({ ...newQuizData, subject: e.target.value })}
                        className="font-semibold"
                      />
                      <select
                        value={newQuizData.class}
                        onChange={(e) => setNewQuizData({ ...newQuizData, class: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold"
                      >
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                      <Button onClick={handleCreateQuiz} className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Side - Question Editor */}
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-slate-900">
                    {currentQuiz ? `Edit: ${currentQuiz.title}` : 'Select a Quiz'}
                  </CardTitle>
                  <CardDescription className="text-slate-700 font-semibold">
                    {currentQuiz ? 'Add or manage questions' : 'Choose a quiz from the left to start editing'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {currentQuiz ? (
                    <>
                      {/* Existing Questions */}
                      {currentQuiz.questions.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-slate-900 mb-3 text-base">Questions ({currentQuiz.questions.length})</h4>
                          <div className="space-y-3">
                            {currentQuiz.questions.map((question, index) => (
                              <div key={question.id} className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-bold text-slate-900 flex-1 text-base">
                                    {index + 1}. {question.question}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="space-y-1 text-sm">
                                  {question.options.map((opt, idx) => (
                                    <p key={idx} className={`font-semibold ${idx === question.correctAnswer ? 'text-green-600' : 'text-slate-600'}`}>
                                      {String.fromCharCode(65 + idx)}. {opt} {idx === question.correctAnswer && '✓'}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Question */}
                      <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                        <h4 className="font-bold text-slate-900 mb-3 text-base">Add New Question</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-slate-900 font-bold text-sm">Question</Label>
                            <Input
                              placeholder="Enter your question"
                              value={newQuestionData.question}
                              onChange={(e) => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                              className="font-semibold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-slate-900 font-bold text-sm">Option A</Label>
                              <Input
                                placeholder="Option A"
                                value={newQuestionData.option1}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, option1: e.target.value })}
                                className="font-semibold"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-900 font-bold text-sm">Option B</Label>
                              <Input
                                placeholder="Option B"
                                value={newQuestionData.option2}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, option2: e.target.value })}
                                className="font-semibold"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-900 font-bold text-sm">Option C (Optional)</Label>
                              <Input
                                placeholder="Option C"
                                value={newQuestionData.option3}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, option3: e.target.value })}
                                className="font-semibold"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-900 font-bold text-sm">Option D (Optional)</Label>
                              <Input
                                placeholder="Option D"
                                value={newQuestionData.option4}
                                onChange={(e) => setNewQuestionData({ ...newQuestionData, option4: e.target.value })}
                                className="font-semibold"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-slate-900 font-bold text-sm">Correct Answer</Label>
                            <select
                              value={newQuestionData.correctAnswer}
                              onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-slate-900 font-bold text-sm">Difficulty</Label>
                            <select
                              value={newQuestionData.difficulty}
                              onChange={(e) => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-slate-900 font-bold text-sm">Explanation (Optional)</Label>
                            <Input
                              placeholder="Explain the correct answer"
                              value={newQuestionData.explanation}
                              onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
                              className="font-semibold"
                            />
                          </div>

                          <Button onClick={handleAddQuestion} className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 font-bold">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-semibold text-base">Select a quiz to start adding questions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Curriculum Editor Tab */}
          <TabsContent value="curriculum" className="mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/60">
              <CardHeader>
                <CardTitle className="text-xl font-black text-slate-900">Curriculum Management</CardTitle>
                <CardDescription className="text-slate-700 font-semibold">
                  Update syllabus, add topics, and manage learning resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Add Topic Form */}
                  <div className="md:col-span-1 space-y-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <h4 className="font-bold text-slate-900">Add New Topic</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={newTopicData.subject}
                          onChange={(e) => setNewTopicData({ ...newTopicData, subject: e.target.value })}
                          placeholder="e.g. Physics"
                        />
                      </div>
                      <div>
                        <Label>Chapter</Label>
                        <Input
                          value={newTopicData.chapter}
                          onChange={(e) => setNewTopicData({ ...newTopicData, chapter: e.target.value })}
                          placeholder="e.g. Kinematics"
                        />
                      </div>
                      <div>
                        <Label>Topic Name</Label>
                        <Input
                          value={newTopicData.topic}
                          onChange={(e) => setNewTopicData({ ...newTopicData, topic: e.target.value })}
                          placeholder="e.g. Projectile Motion"
                        />
                      </div>
                      <div>
                        <Label>Est. Hours</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newTopicData.estimatedHours}
                          onChange={(e) => setNewTopicData({ ...newTopicData, estimatedHours: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <Button onClick={handleAddTopic} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Topic
                      </Button>
                    </div>
                  </div>

                  {/* Topic List */}
                  <div className="md:col-span-2">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {curriculumTopics.map((topic) => (
                        <div key={topic.id} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center shadow-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">{topic.subject}</span>
                              <span className="text-slate-500 text-xs font-semibold">• {topic.chapter}</span>
                            </div>
                            <h4 className="font-bold text-slate-800">{topic.topic}</h4>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {topic.estimatedHours} hours
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteTopic(topic.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {curriculumTopics.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No topics added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
