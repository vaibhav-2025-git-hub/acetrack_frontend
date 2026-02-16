import React, { useState } from 'react';
import { X, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { StudySession } from '../types';

interface SessionCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  availableSubjects: Array<{ id: string; name: string }>;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onChangeSubject: (sessionId: string, newSubjectId: string) => void;
  onChangeDuration: (sessionId: string, newDuration: number) => void;
  date: string;
}

export const SessionCustomizationModal: React.FC<SessionCustomizationModalProps> = ({
  isOpen,
  onClose,
  sessions,
  availableSubjects,
  onReorder,
  onChangeSubject,
  onChangeDuration,
  date,
}) => {
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="font-semibold text-lg">Customize Your Study Plan</h3>
            <p className="text-sm text-gray-600 mt-1">{formatDate(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Drag to reorder, click to edit Subject or Duration
          </p>

          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${draggedIndex === index
                    ? 'border-blue-500 shadow-lg opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                  } ${session.status !== 'not-started' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    disabled={session.status !== 'not-started'}
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            {session.startTime}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {session.duration} min
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mt-1">
                          {session.subjectName}
                        </h4>
                        <p className="text-sm text-gray-600">{session.topicName}</p>
                      </div>

                      {session.status === 'not-started' && (
                        <button
                          onClick={() =>
                            setEditingSession(
                              editingSession === session.id ? null : session.id
                            )
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {editingSession === session.id && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Change Subject
                          </label>
                          <select
                            value={session.subjectId}
                            onChange={(e) => onChangeSubject(session.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {availableSubjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="30"
                            max="180"
                            step="15"
                            value={session.duration}
                            onChange={(e) =>
                              onChangeDuration(session.id, parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {session.status !== 'not-started' && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    {session.status === 'completed' ? 'Completed' : 'In Progress'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
