import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { LearningSpeed } from '../types';
import { Progress } from './ui/progress';

interface OnboardingTestProps {
  onComplete: (learningSpeed: LearningSpeed) => void;
}

const questions = [
  {
    question: 'How quickly can you grasp new mathematical concepts?',
    options: [
      { value: 3, label: 'Very quickly - I understand most concepts on first read' },
      { value: 2, label: 'Moderately - I need to read 2-3 times' },
      { value: 1, label: 'Slowly - I need multiple revisions and practice' },
    ],
  },
  {
    question: 'How long does it take you to memorize important formulas?',
    options: [
      { value: 3, label: 'Less than 10 minutes for complex formulas' },
      { value: 2, label: '15-30 minutes with some practice' },
      { value: 1, label: 'More than 30 minutes with repeated practice' },
    ],
  },
  {
    question: 'How many times do you typically need to revise a topic to retain it?',
    options: [
      { value: 3, label: '1-2 times' },
      { value: 2, label: '3-4 times' },
      { value: 1, label: '5+ times' },
    ],
  },
  {
    question: 'How quickly can you solve practice problems after learning a topic?',
    options: [
      { value: 3, label: 'Immediately with high accuracy' },
      { value: 2, label: 'After some practice with moderate accuracy' },
      { value: 1, label: 'Need significant practice and guidance' },
    ],
  },
  {
    question: 'How well do you retain information after a week without revision?',
    options: [
      { value: 3, label: 'Remember most details clearly' },
      { value: 2, label: 'Remember key concepts, fuzzy on details' },
      { value: 1, label: 'Forget most of it, need to relearn' },
    ],
  },
];

export const OnboardingTest: React.FC<OnboardingTestProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setSelectedValue(value.toString());

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        // Set the selected value for the next question if it exists
        setSelectedValue(newAnswers[currentQuestion + 1]?.toString() || '');
      } else {
        // Calculate learning speed
        const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
        const avgScore = totalScore / questions.length;

        let speed: LearningSpeed;
        if (avgScore >= 2.5) {
          speed = 'fast';
        } else if (avgScore >= 1.75) {
          speed = 'average';
        } else {
          speed = 'slow';
        }

        onComplete(speed);
      }
    }, 300);
  };

  const handlePrevious = () => {
    const newQuestion = currentQuestion - 1;
    setCurrentQuestion(newQuestion);
    setSelectedValue(answers[newQuestion]?.toString() || '');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative z-10">
      <Card className="w-full max-w-2xl shadow-xl relative z-20">
        <CardHeader>
          <CardTitle className="text-3xl">Learning Speed Assessment</CardTitle>
          <CardDescription>
            Answer these questions honestly to help us customize your study plan
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h3 className="text-xl font-medium">{questions[currentQuestion].question}</h3>
            <RadioGroup 
              value={selectedValue} 
              onValueChange={(value) => handleAnswer(Number(value))}
            >
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem 
                      value={option.value.toString()} 
                      id={`option-${currentQuestion}-${idx}`}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={`option-${currentQuestion}-${idx}`} 
                      className="cursor-pointer flex-1 text-base leading-relaxed"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="mt-4"
              >
                Previous Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};