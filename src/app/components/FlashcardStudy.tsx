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

  const generateNewFlashcards = () => {
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

    setStudyPlan({
      ...studyPlan,
      flashcards: [...flashcards, ...newCards],
    });

    toast.success(`✨ Generated ${newCards.length} flashcards for ${topic.name}`);
    setShowTopicSelector(false);
    setSelectedSubjectForGen('');
    setSelectedChapterForGen('');
    setSelectedTopicForGen('');
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
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <p className="text-sm text-gray-600 font-medium">Total Cards</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600 font-medium">Mastered</p>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
          <p className="text-xs text-green-600 mt-1">{stats.masteryPercentage}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-gray-600 font-medium">Learning</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.learning}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-gray-600 font-medium">New</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.new}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <RotateCw className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-gray-600 font-medium">Due Today</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.dueToday}</p>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={studyMode === 'due-today' ? 'default' : 'outline'}
              onClick={() => setStudyMode('due-today')}
              size="sm"
            >
              📅 Due Today ({stats.dueToday})
            </Button>
            <Button
              variant={studyMode === 'new' ? 'default' : 'outline'}
              onClick={() => setStudyMode('new')}
              size="sm"
            >
              ✨ New Cards ({stats.new})
            </Button>
            <Button
              variant={studyMode === 'all' ? 'default' : 'outline'}
              onClick={() => setStudyMode('all')}
              size="sm"
            >
              📚 All Cards ({stats.total})
            </Button>
          </div>

          <div className="flex-1" />

          <Button 
            onClick={() => setShowTopicSelector(!showTopicSelector)} 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4" />
            Generate Cards
          </Button>
        </div>
      </Card>

      {/* Topic Selector Modal */}
      {showTopicSelector && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg font-bold mb-4">Select Topic to Generate Flashcards</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

            {selectedSubjectForGen && (
              <div>
                <label className="block text-sm font-medium mb-2">Chapter</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedChapterForGen}
                  onChange={(e) => {
                    setSelectedChapterForGen(e.target.value);
                    setSelectedTopicForGen('');
                  }}
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedChapterForGen && (
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={selectedTopicForGen}
                  onChange={(e) => setSelectedTopicForGen(e.target.value)}
                >
                  <option value="">-- Select Topic --</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setShowTopicSelector(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={generateNewFlashcards} 
                disabled={!selectedTopicForGen}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                Generate 8-9 Flashcards
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Flashcard Display */}
      {filteredCards.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Cards Available</h3>
          <p className="text-gray-500 mb-6">
            {studyMode === 'due-today'
              ? "You're all caught up! No cards due for review today."
              : studyMode === 'new'
              ? 'No new cards. Generate some from your curriculum!'
              : 'Generate flashcards from your curriculum to get started.'}
          </p>
          <Button onClick={() => setShowTopicSelector(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Generate Flashcards
          </Button>
        </Card>
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
                className={`absolute w-full h-full transition-all duration-700 transform-style-3d ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
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
                  <Card className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 border-none shadow-2xl flex flex-col items-center justify-center p-12 text-white">
                    <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Question
                    </Badge>
                    <h2 className="text-3xl font-bold text-center leading-relaxed mb-8">
                      {currentCard?.front}
                    </h2>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <RotateCw className="w-4 h-4" />
                      <span>Click to reveal answer</span>
                    </div>
                  </Card>
                </div>

                {/* Back of Card */}
                <div
                  className={`absolute w-full h-full backface-hidden ${!isFlipped ? 'invisible' : 'visible'}`}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <Card className="h-full bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-2xl flex flex-col p-12 text-white">
                    <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm w-fit">
                      Answer
                    </Badge>
                    <div className="flex-1 overflow-auto">
                      <p className="text-xl leading-relaxed whitespace-pre-line">
                        {currentCard?.back}
                      </p>
                    </div>

                    {/* Rating Buttons */}
                    <div className="mt-6 grid grid-cols-5 gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(1);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white border-none flex-col h-auto py-3"
                      >
                        <span className="text-2xl mb-1">😫</span>
                        <span className="text-xs">Again</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(2);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-none flex-col h-auto py-3"
                      >
                        <span className="text-2xl mb-1">😐</span>
                        <span className="text-xs">Hard</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(3);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white border-none flex-col h-auto py-3"
                      >
                        <span className="text-2xl mb-1">🙂</span>
                        <span className="text-xs">Good</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(4);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white border-none flex-col h-auto py-3"
                      >
                        <span className="text-2xl mb-1">😊</span>
                        <span className="text-xs">Easy</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(5);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white border-none flex-col h-auto py-3"
                      >
                        <span className="text-2xl mb-1">🤩</span>
                        <span className="text-xs">Perfect</span>
                      </Button>
                    </div>
                  </Card>
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
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Difficulty</p>
                  <Badge className={`${difficultyColors[currentCard.difficulty]} capitalize`}>
                    {currentCard.difficulty}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Reviews</p>
                  <p className="font-bold text-gray-900">{currentCard.reviewCount}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Confidence</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i <= currentCard.confidence ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {currentCard.nextReview && (
                  <div>
                    <p className="text-gray-500 mb-1">Next Review</p>
                    <p className="font-bold text-gray-900">
                      {new Date(currentCard.nextReview).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};