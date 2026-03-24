import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Bot, Send, ExternalLink, Loader2 } from 'lucide-react';
import { useStudyPlan } from '../context/StudyPlanContext';
import { sendMessageToAI } from '../utils/aiChatbot';
import type { AIChatMessage } from '../utils/aiChatbot';
import type { ChatMessage } from '../types';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  links?: string[];
}

export const AIChat: React.FC = () => {
  const { userProfile, studyPlan } = useStudyPlan();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI study assistant. I can help you with subject doubts, study tips, resource recommendations, and motivation. What would you like to know?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Convert messages to AIChatMessage format
    const chatHistory: AIChatMessage[] = messages.slice(-5).map(m => ({
      role: m.isBot ? 'assistant' as const : 'user' as const,
      content: m.text
    }));
    chatHistory.push({ role: 'user' as const, content: input });

    try {
      // Get current date
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Call AI API
      const aiResponse = await sendMessageToAI(
        chatHistory,
        userProfile,
        studyPlan,
        currentDate
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isBot: true,
        links: extractLinks(aiResponse, input),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractLinks = (response: string, query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    const links: string[] = [];

    if (lowerQuery.includes('physics')) {
      links.push('https://www.khanacademy.org/science/physics');
      links.push('https://phet.colorado.edu/en/simulations/filter?subjects=physics');
    } else if (lowerQuery.includes('chemistry')) {
      links.push('https://www.khanacademy.org/science/chemistry');
      links.push('https://phet.colorado.edu/en/simulations/filter?subjects=chemistry');
    } else if (lowerQuery.includes('math')) {
      links.push('https://www.khanacademy.org/math');
      links.push('https://www.desmos.com/calculator');
    } else if (lowerQuery.includes('biology')) {
      links.push('https://www.khanacademy.org/science/biology');
      links.push('https://www.youtube.com/user/crashcourse');
    }

    return links;
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-[28px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
      <div className="relative rounded-[26px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
        <div className="border-b-2 border-blue-100 bg-gradient-to-r from-cyan-50/80 via-blue-50/80 to-indigo-50/80 backdrop-blur px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-50 blur animate-pulse"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl">
                  <Bot className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">AI Study Assistant 🤖</h3>
                <p className="text-sm text-slate-600 mt-1 font-semibold">Ask me anything about your studies!</p>
              </div>
            </div>
            {!import.meta.env.VITE_OPENAI_API_KEY && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-200/50 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-bold text-amber-800">Demo Mode</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-8">
          <ScrollArea className="h-80 mb-5 p-5 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/30 rounded-2xl border-2 border-blue-100/60 shadow-inner backdrop-blur">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}
                >
                  <div
                    className={`max-w-[85%] p-5 rounded-2xl transition-all hover:scale-[1.02] ${
                      message.isBot
                        ? 'bg-white/95 backdrop-blur border-2 border-blue-200/50 text-slate-900 shadow-xl shadow-blue-500/10'
                        : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-indigo-500/30 border-2 border-white/20'
                    }`}
                  >
                    {message.isBot && (
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-black text-slate-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                    {message.links && message.links.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {message.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link relative block"
                          >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-30 group-hover/link:opacity-50 blur transition duration-200"></div>
                            <div className="relative flex items-center gap-3 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200/50 shadow-md hover:shadow-lg">
                              <ExternalLink className="w-4 h-4 text-blue-600 group-hover/link:scale-110 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform flex-shrink-0" />
                              <span className="font-bold text-blue-700">Study Resource {idx + 1}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-slide-up">
                  <div className="bg-white/95 backdrop-blur border-2 border-blue-200/50 p-5 rounded-2xl shadow-xl shadow-blue-500/10">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm font-semibold text-slate-700">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your studies..."
              disabled={isLoading}
              className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 px-5 py-6 font-semibold shadow-lg backdrop-blur bg-white/80"
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all px-6 py-6 border-2 border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Send className="w-5 h-5 relative z-10" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};