import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Key, CheckCircle, XCircle, ExternalLink, Sparkles, Info } from 'lucide-react';
import { getGeminiAPIKey, saveGeminiAPIKey, testAPIKey, hasAPIKey } from '../utils/aiContentGenerator';
import { toast } from 'sonner';

export const AISettings: React.FC = () => {
  const [apiKey, setApiKey] = useState(getGeminiAPIKey() || '');
  const [testing, setTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(hasAPIKey());

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setTesting(true);
    const isValid = await testAPIKey(apiKey);
    setTesting(false);

    if (isValid) {
      saveGeminiAPIKey(apiKey);
      setIsConfigured(true);
      toast.success('✅ API key saved successfully! AI features are now enabled.');
    } else {
      toast.error('❌ Invalid API key. Please check and try again.');
    }
  };

  const handleRemoveKey = () => {
    if (confirm('Remove API key? AI features will be disabled.')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setIsConfigured(false);
      toast.info('API key removed');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            AI Content Generation
            {isConfigured && (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Enable AI-powered flashcards and quizzes with real educational content
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">How it works:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Get a <strong>free Google Gemini API key</strong> (no credit card required)</li>
              <li>• AI generates real questions, answers, and explanations</li>
              <li>• Content tailored to your curriculum and difficulty level</li>
              <li>• Works for all subjects and topics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {isConfigured ? (
              <Button
                onClick={handleRemoveKey}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Remove
              </Button>
            ) : (
              <Button
                onClick={handleSaveKey}
                disabled={testing}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {testing ? (
                  <>Testing...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save & Test
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your API key is stored locally in your browser and never shared
          </p>
        </div>

        {/* Get API Key Instructions */}
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-600" />
            How to get a FREE API key:
          </h4>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>
                Visit{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                >
                  Google AI Studio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Sign in with your Google account</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Click "Get API Key" or "Create API Key"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Copy the key and paste it above</span>
            </li>
          </ol>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>✓ Free Tier:</strong> 60 requests per minute, more than enough for study needs!
            </p>
          </div>
        </div>

        {/* Features */}
        {isConfigured && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">🎉 AI Features Enabled:</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real flashcards with detailed explanations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Curriculum-specific quiz questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Exam-focused content for your board</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Detailed answer explanations</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
