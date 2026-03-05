import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useStudyPlan } from '../context/StudyPlanContext';
import { RotateCw, ChevronLeft, ChevronRight, Plus, BookOpen, Sparkles, Target, Settings } from 'lucide-react';
import { Flashcard } from '../types';
import {
  getFlashcardsDueToday,
  getFlashcardsBySubject,
  getFlashcardStats,
  reviewFlashcard,
  generateFlashcardsForTopic,
} from '../utils/flashcardSystem';
import { curriculumData } from '../data/curriculum';
import { toast } from 'sonner';

export const FlashcardStudy: React.FC = () => {
  const { studyPlan, setStudyPlan, userProfile } = useStudyPlan();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<'all' | 'due-today' | 'new'>('due-today');
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [selectedSubjectForGen, setSelectedSubjectForGen] = useState('');
  const [selectedChapterForGen, setSelectedChapterForGen] = useState('');
  const [selectedTopicForGen, setSelectedTopicForGen] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!studyPlan || !userProfile) return null;

  const flashcards = studyPlan.flashcards || [];
  const stats = getFlashcardStats(flashcards);

  // Get curriculum data
  const boardData = curriculumData.find((b) => b.id === userProfile.board);
  const streamData = boardData?.classes[userProfile.class]?.find((s) => s.id === userProfile.stream);
  const subjects = streamData?.subjects || [];

  // Filter flashcards based on mode and subject
  let filteredCards = flashcards;
  if (studyMode === 'due-today') {
    filteredCards = getFlashcardsDueToday(flashcards);
  } else if (studyMode === 'new') {
    filteredCards = flashcards.filter((c) => c.reviewCount === 0);
  }

  if (filterSubject) {
    filteredCards = getFlashcardsBySubject(filteredCards, filterSubject);
  }

  const currentCard = filteredCards[currentCardIndex];

  const handleRating = (confidence: number) => {
    if (!currentCard) return;

    const updatedCard = reviewFlashcard(currentCard, confidence);
    const updatedFlashcards = flashcards.map((c) =>
      c.id === updatedCard.id ? updatedCard : c
    );

    setStudyPlan({
      ...studyPlan,
      flashcards: updatedFlashcards,
    });

    // Move to next card
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
      toast.success('🎉 Review session complete!');
    }

    setIsFlipped(false);
  };

  const generateNewFlashcards = async () => {
    if (!selectedTopicForGen) {
      toast.error('Please select a topic first');
      return;
    }

    const subject = subjects.find(s => s.id === selectedSubjectForGen);
    const chapter = subject?.chapters.find(c => c.id === selectedChapterForGen);
    const topic = chapter?.topics.find(t => t.id === selectedTopicForGen);

    if (!topic || !subject || !chapter) {
      toast.error('Invalid selection');
      return;
    }

    const newCards = generateFlashcardsForTopic(
      topic.id,
      topic.name,
      subject.id,
      chapter.name
    );

    setIsGenerating(true);
    toast.info('Saving flashcards to server...', { id: 'saving-cards' });
    try {
      const { flashcardsAPI } = await import('../services/api');
      // Save all new cards to the backend
      await Promise.all(
        newCards.map(card =>
          flashcardsAPI.create({
            subject_id: card.subjectId,
            topic_id: card.topicId,
            question: card.front,
            answer: card.back,
            difficulty: 'medium'
          })
        )
      );

      setStudyPlan({
        ...studyPlan,
        flashcards: [...flashcards, ...newCards],
      });

      toast.success(`✨ Generated ${newCards.length} flashcards for ${topic.name}`, { id: 'saving-cards' });
      setShowTopicSelector(false);
      setSelectedSubjectForGen('');
      setSelectedChapterForGen('');
      setSelectedTopicForGen('');
    } catch (e) {
      console.error("Error saving flashcards to backend:", e);
      toast.error('Failed to sync generated flashcards with server', { id: 'saving-cards' });
      // Still update local state so they can use them locally
      setStudyPlan({
        ...studyPlan,
        flashcards: [...flashcards, ...newCards],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectForGen);
  const chapters = selectedSubject?.chapters || [];
  const selectedChapter = chapters.find(c => c.id === selectedChapterForGen);
  const topics = selectedChapter?.topics || [];

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Cards */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-indigo-50 shadow-lg overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-indigo-600 tracking-tight">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cards</p>
            </div>
          </Card>
        </div>

        {/* Mastered */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-emerald-50 shadow-lg overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mastered</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-emerald-600 tracking-tight">{stats.mastered}</p>
              <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase">
                {stats.masteryPercentage}%
              </Badge>
            </div>
          </Card>
        </div>

        {/* Learning */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-amber-50 shadow-lg overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Learning</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-amber-600 tracking-tight">{stats.learning}</p>
            </div>
          </Card>
        </div>

        {/* New */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-purple-50 shadow-lg overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">New</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-purple-600 tracking-tight">{stats.new}</p>
            </div>
          </Card>
        </div>

        {/* Due Today */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-red-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-rose-50 shadow-lg overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <RotateCw className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Today</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-rose-600 tracking-tight">{stats.dueToday}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-[24px] opacity-20 blur transition duration-500"></div>
        <Card className="relative p-4 rounded-[22px] bg-white/90 backdrop-blur-xl border-2 border-indigo-50 shadow-md">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50 overflow-x-auto scx-none">
              <Button
                variant={studyMode === 'due-today' ? 'default' : 'ghost'}
                onClick={() => setStudyMode('due-today')}
                className={`rounded-lg px-4 font-bold transition-all ${studyMode === 'due-today'
                  ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>Due Today</span>
                  <Badge className={`ml-1 px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center ${studyMode === 'due-today' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                    {stats.dueToday}
                  </Badge>
                </div>
              </Button>
              <Button
                variant={studyMode === 'new' ? 'default' : 'ghost'}
                onClick={() => setStudyMode('new')}
                className={`rounded-lg px-4 font-bold transition-all ${studyMode === 'new'
                  ? 'bg-white text-purple-700 shadow-sm border border-purple-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span>New Cards</span>
                  <Badge className={`ml-1 px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center ${studyMode === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>
                    {stats.new}
                  </Badge>
                </div>
              </Button>
              <Button
                variant={studyMode === 'all' ? 'default' : 'ghost'}
                onClick={() => setStudyMode('all')}
                className={`rounded-lg px-4 font-bold transition-all ${studyMode === 'all'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span>All Cards</span>
                  <Badge className={`ml-1 px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center ${studyMode === 'all' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {stats.total}
                  </Badge>
                </div>
              </Button>
            </div>

            <div className="flex-1" />

            <Button
              onClick={() => setShowTopicSelector(!showTopicSelector)}
              className="h-12 px-6 rounded-xl font-black gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 border-none"
            >
              <Plus className="w-5 h-5 fill-white" />
              Generate Cards
            </Button>
          </div>
        </Card>
      </div>

      {/* Topic Selector Modal */}
      {showTopicSelector && (
        <div className="relative group animate-in slide-in-from-top-4 duration-300">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 rounded-[28px] opacity-20 blur transition duration-500"></div>
          <Card className="relative p-8 rounded-[26px] bg-white/95 backdrop-blur-2xl border-2 border-purple-100/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight text-slate-900">
              <div className="p-2.5 bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white rounded-xl shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              Select Topic to Generate Flashcards
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none"
                    value={selectedSubjectForGen}
                    onChange={(e) => {
                      setSelectedSubjectForGen(e.target.value);
                      setSelectedChapterForGen('');
                      setSelectedTopicForGen('');
                    }}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chapter</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none disabled:opacity-50"
                    value={selectedChapterForGen}
                    onChange={(e) => {
                      setSelectedChapterForGen(e.target.value);
                      setSelectedTopicForGen('');
                    }}
                    disabled={!selectedSubjectForGen}
                  >
                    <option value="">-- Select Chapter --</option>
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none disabled:opacity-50"
                    value={selectedTopicForGen}
                    onChange={(e) => setSelectedTopicForGen(e.target.value)}
                    disabled={!selectedChapterForGen}
                  >
                    <option value="">-- Select Topic --</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100/50">
                <Button
                  onClick={() => setShowTopicSelector(false)}
                  variant="outline"
                  className="flex-1 h-14 rounded-xl font-bold border-2 hover:bg-slate-100 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateNewFlashcards}
                  disabled={!selectedTopicForGen}
                  className="flex-[2] h-14 rounded-xl text-lg font-black bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 shadow-xl shadow-purple-500/30 transition-all hover:scale-[1.02] border-none text-white"
                >
                  Generate 8-9 Flashcards <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredCards.length === 0 ? (
        <div className="group relative max-w-2xl mx-auto my-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-[32px] opacity-50 blur-xl transition duration-500"></div>
          <Card className="relative p-16 text-center rounded-[30px] bg-white/95 backdrop-blur-2xl border-2 border-white/60 shadow-2xl">
            <div className="inline-flex p-6 bg-slate-50 rounded-full border-4 border-white shadow-inner mb-6">
              <BookOpen className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No Cards Available</h3>
            <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto font-medium">
              {studyMode === 'due-today'
                ? "You're all caught up! Take a break, no cards due for review today."
                : studyMode === 'new'
                  ? 'No new cards. Generate some from your curriculum to expand your knowledge base!'
                  : 'Your study deck is empty. Generate flashcards from your curriculum to get started.'}
            </p>
            <Button
              onClick={() => setShowTopicSelector(true)}
              className="h-14 px-8 rounded-2xl text-lg font-black gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 border-none"
            >
              <Plus className="w-5 h-5 fill-white" />
              Generate Flashcards
            </Button>
          </Card>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Card <strong>{currentCardIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
            </p>
            <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="max-w-3xl mx-auto">
            <div
              className="relative h-[500px] cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={`absolute w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.7s'
                }}
              >
                {/* Front of Card */}
                <div
                  className={`absolute w-full h-full backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="group/front h-full relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] opacity-20 group-hover/front:opacity-30 blur transition duration-500"></div>
                    <Card className="h-full relative bg-white/95 backdrop-blur-2xl border-2 border-indigo-100/50 shadow-2xl flex flex-col items-center justify-center p-12 text-slate-800 rounded-[30px] overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover/front:scale-110 transition-transform duration-700"></div>
                      <Badge className="mb-6 bg-indigo-50 text-indigo-700 border-indigo-200 font-bold uppercase tracking-widest text-xs px-3 py-1">
                        Question
                      </Badge>
                      <h2 className="text-3xl font-black text-center leading-relaxed mb-8 tracking-tight">
                        {currentCard?.front}
                      </h2>
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-widest bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100">
                        <RotateCw className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
                        <span>Click to reveal answer</span>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className={`absolute w-full h-full backface-hidden ${!isFlipped ? 'invisible' : 'visible'}`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="group/back h-full relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[32px] opacity-20 group-hover/back:opacity-30 blur transition duration-500"></div>
                    <Card className="h-full relative bg-white/95 backdrop-blur-2xl border-2 border-emerald-100/50 shadow-2xl flex flex-col p-10 text-slate-800 rounded-[30px] overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover/back:scale-110 transition-transform duration-700"></div>
                      <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase tracking-widest text-xs px-3 py-1 w-fit">
                        Answer
                      </Badge>
                      <div className="flex-1 overflow-auto pr-4 custom-scrollbar">
                        <p className="text-xl font-bold leading-relaxed whitespace-pre-line text-slate-700">
                          {currentCard?.back}
                        </p>
                      </div>

                      {/* Rating Buttons */}
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 text-center">How easy was this?</p>
                        <div className="grid grid-cols-5 gap-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(1);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 hover:border-rose-300 flex-col h-auto py-3 rounded-xl transition-all hover:scale-105"
                          >
                            <span className="text-2xl mb-1 drop-shadow-sm">😫</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Again</span>
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(2);
                            }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-200 hover:border-orange-300 flex-col h-auto py-3 rounded-xl transition-all hover:scale-105"
                          >
                            <span className="text-2xl mb-1 drop-shadow-sm">😐</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Hard</span>
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(3);
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200 hover:border-amber-300 flex-col h-auto py-3 rounded-xl transition-all hover:scale-105"
                          >
                            <span className="text-2xl mb-1 drop-shadow-sm">🙂</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Good</span>
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(4);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-300 flex-col h-auto py-3 rounded-xl transition-all hover:scale-105"
                          >
                            <span className="text-2xl mb-1 drop-shadow-sm">😊</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Easy</span>
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(5);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 hover:border-indigo-300 flex-col h-auto py-3 rounded-xl transition-all hover:scale-105"
                          >
                            <span className="text-2xl mb-1 drop-shadow-sm">🤩</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Perfect</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              onClick={() => {
                setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === 0}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="ghost"
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Flip Card
            </Button>

            <Button
              onClick={() => {
                setCurrentCardIndex(Math.min(filteredCards.length - 1, currentCardIndex + 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === filteredCards.length - 1}
              variant="outline"
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Card Info */}
          {currentCard && (
            <div className="max-w-3xl mx-auto pb-12">
              <Card className="p-6 bg-white/50 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Difficulty</p>
                    <Badge className={`${difficultyColors[currentCard.difficulty]} capitalize border-2 shadow-sm`}>
                      {currentCard.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reviews</p>
                    <p className="text-xl font-black text-slate-700">{currentCard.reviewCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Confidence</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 ${i <= currentCard.confidence ? 'bg-indigo-500 border-indigo-600 shadow-sm shadow-indigo-500/30' : 'bg-slate-100 border-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  {currentCard.nextReview && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Next Review</p>
                      <p className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg w-fit border border-indigo-100">
                        {new Date(currentCard.nextReview).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};