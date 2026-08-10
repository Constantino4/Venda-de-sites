import React, { useState } from 'react';
import { Website } from '../types';
import { X, Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableSites: Website[];
  onOpenDetails: (website: Website) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  recommendedSiteId?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  availableSites,
  onOpenDetails,
}) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Olá! Sou o Assistente IA do WebMarket. Diga qual é o seu tipo de negócio ou dúvida que eu recomendo o melhor modelo de site para você!',
    },
  ]);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/recommend-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userText,
          availableSites: availableSites.map((s) => ({
            id: s.id,
            title: s.title,
            category: s.categoryName,
            price: s.price.standard,
            features: s.features,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.response || 'Recomendo verificar os modelos na vitrine principal!',
          recommendedSiteId: data.recommendedSiteId,
        },
      ]);
    } catch (err) {
      console.error('Erro no assistente IA:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Para seu negócio, recomendo nossos templates de E-Commerce ou SaaS por virem com integração de pagamentos e código 100% aberto!',
          recommendedSiteId: 'nexus-commerce',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Assistente de Compras IA</h3>
              <p className="text-[10px] text-purple-700 font-bold">Powered by Gemini AI 3.6 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[80%] space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Recommended site card trigger */}
                {msg.recommendedSiteId && (
                  (() => {
                    const site = availableSites.find((s) => s.id === msg.recommendedSiteId);
                    if (!site) return null;
                    return (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="font-bold text-blue-700 truncate text-[11px]">
                          {site.title}
                        </span>
                        <button
                          onClick={() => {
                            onOpenDetails(site);
                            onClose();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <span>Ver Site</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })()
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold bg-purple-50 p-3 rounded-2xl border border-purple-200">
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
              <span>Pensando na melhor recomendação para seu projeto...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendQuery} className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ex: Qual o melhor site para uma imobiliária?"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
