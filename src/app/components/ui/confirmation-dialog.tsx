import React from 'react';
import { Button } from './button';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variants = {
    danger: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-50',
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50',
    },
    info: {
      icon: <Info className="w-12 h-12 text-blue-500" />,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'from-blue-50 to-indigo-50',
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'from-emerald-50 to-teal-50',
    },
  };

  const config = variants[variant];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.bg} flex items-center justify-center`}>
            {config.icon}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 font-semibold">{description}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            className={`w-full group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r ${config.gradient} text-white font-bold py-4 rounded-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <span className="relative z-10">{confirmText}</span>
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full font-bold py-4 rounded-2xl text-slate-700 border-2 border-slate-300 hover:bg-slate-50"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};
