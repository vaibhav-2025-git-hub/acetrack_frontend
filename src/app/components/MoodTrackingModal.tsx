import React, { useState } from 'react';
import { X, Smile, Meh, Frown } from 'lucide-react';

interface MoodTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodScore: number, notes?: string) => void;
  sessionName: string;
}

export const MoodTrackingModal: React.FC<MoodTrackingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sessionName,
}) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedMood !== null) {
      onSubmit(selectedMood, notes.trim() || undefined);
      setSelectedMood(null);
      setNotes('');
      onClose();
    }
  };

  const moodOptions = [
    { score: 5, emoji: '😊', label: 'Excellent', color: 'bg-green-500 hover:bg-green-600' },
    { score: 4, emoji: '🙂', label: 'Good', color: 'bg-blue-500 hover:bg-blue-600' },
    { score: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { score: 2, emoji: '😔', label: 'Tired', color: 'bg-orange-500 hover:bg-orange-600' },
    { score: 1, emoji: '😫', label: 'Stressed', color: 'bg-red-500 hover:bg-red-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">How was your study session?</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Just completed: <span className="font-medium">{sessionName}</span>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate your mood and focus
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.score}
                onClick={() => setSelectedMood(option.score)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  selectedMood === option.score
                    ? `${option.color} text-white scale-105`
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts about this session? Challenges faced?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedMood === null}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              selectedMood === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Submit
          </button>
        </div>

        {selectedMood !== null && selectedMood <= 2 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              💡 We'll adjust your upcoming sessions to be lighter based on your mood.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
