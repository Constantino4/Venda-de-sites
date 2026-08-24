import React, { useState } from 'react';
import { Website, SiteCustomizationData } from '../types';
import { 
  X, 
  Sparkles, 
  Check, 
  Save, 
  RotateCcw, 
  Palette, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Instagram, 
  Facebook, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Rocket, 
  CheckCircle2, 
  Loader2,
  Sliders,
  Sun,
  Moon,
  Clock,
  Layers
} from 'lucide-react';

interface SiteCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: Website | null;
  onSaveCustomization?: (data: SiteCustomizationData) => void;
}

export const SiteCustomizerModal: React.FC<SiteCustomizerModalProps> = ({
  isOpen,
  onClose,
  website,
  onSaveCustomization,
}) => {
  const [customData, setCustomData] = useState<SiteCustomizationData>({
    businessName: website ? website.title.split('—')[0].split('-')[0].trim() : 'Minha Empresa',
    tagline: 'Excelência e qualidade para transformar sua experiência.',
    description: website ? website.shortDescription : 'Descrição breve da empresa.',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    email: 'contato@meunegocio.com.br',
    address: 'Av. Paulista, 1000 — São Paulo, SP',
    instagram: '@meunegocio.oficial',
    facebook: '/meunegocio',
    logoUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#059669',
    openingHours: 'Seg a Sex: 08h às 19h | Sáb: 09h às 14h',
    servicesList: [
      { title: 'Atendimento Especializado', price: 'R$ 120,00', description: 'Serviço sob medida com alta qualidade.' },
      { title: 'Consultoria & Diagnóstico', price: 'R$ 250,00', description: 'Análise detalhada das suas necessidades.' },
      { title: 'Plano Premium Completo', price: 'R$ 490,00', description: 'Acompanhamento total com garantia estendida.' }
    ],
    ctaText: 'Fale Conosco pelo WhatsApp',
    seoTitle: website ? `${website.title.split('—')[0].trim()} — Atendimento Profissional` : 'Atendimento Profissional',
    seoDescription: website ? `Conheça ${website.title.split('—')[0].trim()}. Os melhores serviços com atendimento rápido e qualidade garantida.` : 'Os melhores serviços com atendimento rápido.'
  });

  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'colors' | 'seo'>('info');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync customData with website if website changes
  React.useEffect(() => {
    if (website) {
      setCustomData(prev => ({
        ...prev,
        businessName: website.title.split('—')[0].split('-')[0].trim(),
        description: website.shortDescription,
        seoTitle: `${website.title.split('—')[0].trim()} — Atendimento Profissional`,
        seoDescription: `Conheça ${website.title.split('—')[0].trim()}. Os melhores serviços com atendimento rápido e qualidade garantida.`
      }));
    }
  }, [website]);

  if (!isOpen || !website) return null;

  // Gemini AI text optimizer
  const handleAiOptimize = async () => {
    setIsAiOptimizing(true);
    try {
      const res = await fetch('/api/ai/customize-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: customData.businessName,
          category: website.categoryName,
          description: customData.description,
          phone: customData.phone,
          services: customData.servicesList.map(s => s.title).join(', '),
          city: 'São Paulo',
        }),
      });

      const data = await res.json();

      if (data.tagline) {
        setCustomData(prev => ({
          ...prev,
          tagline: data.tagline || prev.tagline,
          description: data.heroDescription || prev.description,
          ctaText: data.ctaText || prev.ctaText,
          seoTitle: data.seoTitle || prev.seoTitle,
          seoDescription: data.seoDescription || prev.seoDescription,
          servicesList: data.optimizedServices && Array.isArray(data.optimizedServices)
            ? data.optimizedServices
            : prev.servicesList,
        }));
      }
    } catch (err) {
      console.error('Erro na otimização com IA:', err);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleAddService = () => {
    setCustomData(prev => ({
      ...prev,
      servicesList: [
        ...prev.servicesList,
        { title: 'Novo Serviço', price: 'R$ 00,00', description: 'Descrição breve do serviço prestado.' }
      ]
    }));
  };

  const handleRemoveService = (index: number) => {
    setCustomData(prev => ({
      ...prev,
      servicesList: prev.servicesList.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (onSaveCustomization) {
      onSaveCustomization(customData);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Personalizar Meu Site com IA</h3>
              <p className="text-[10px] text-slate-500 font-bold">Edite textos, fotos, cores e serviços para seu negócio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAiOptimizing}
              onClick={handleAiOptimize}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              {isAiOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Otimizando Textos com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gerar Textos & SEO com IA</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold gap-4 overflow-x-auto">
          {[
            { id: 'info', label: 'Dados da Empresa & Contato' },
            { id: 'services', label: `Serviços & Preços (${customData.servicesList.length})` },
            { id: 'colors', label: 'Cores & Identidade Visual' },
            { id: 'seo', label: 'Otimização SEO para Google' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Nome da Empresa / Marca</label>
                  <input
                    type="text"
                    value={customData.businessName}
                    onChange={(e) => setCustomData({ ...customData, businessName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Slogan / Frase de Destaque</label>
                  <input
                    type="text"
                    value={customData.tagline}
                    onChange={(e) => setCustomData({ ...customData, tagline: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Apresentação da Empresa (Banner Principal)</label>
                <textarea
                  rows={3}
                  value={customData.description}
                  onChange={(e) => setCustomData({ ...customData, description: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">WhatsApp para Atendimento</label>
                  <input
                    type="text"
                    value={customData.whatsapp}
                    onChange={(e) => setCustomData({ ...customData, whatsapp: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Telefone Fixo</label>
                  <input
                    type="text"
                    value={customData.phone}
                    onChange={(e) => setCustomData({ ...customData, phone: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">E-mail Comercial</label>
                  <input
                    type="email"
                    value={customData.email}
                    onChange={(e) => setCustomData({ ...customData, email: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Endereço Completo</label>
                  <input
                    type="text"
                    value={customData.address}
                    onChange={(e) => setCustomData({ ...customData, address: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={customData.openingHours}
                    onChange={(e) => setCustomData({ ...customData, openingHours: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Services */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Lista de Serviços ou Produtos em Destaque:</span>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Serviço</span>
                </button>
              </div>

              <div className="space-y-3">
                {customData.servicesList.map((service, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Nome do serviço"
                        value={service.title}
                        onChange={(e) => {
                          const updated = [...customData.servicesList];
                          updated[idx].title = e.target.value;
                          setCustomData({ ...customData, servicesList: updated });
                        }}
                        className="flex-1 font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                      />

                      <input
                        type="text"
                        placeholder="Preço (ex: R$ 150,00)"
                        value={service.price}
                        onChange={(e) => {
                          const updated = [...customData.servicesList];
                          updated[idx].price = e.target.value;
                          setCustomData({ ...customData, servicesList: updated });
                        }}
                        className="w-32 font-bold text-purple-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Descrição dos benefícios deste serviço"
                      value={service.description}
                      onChange={(e) => {
                        const updated = [...customData.servicesList];
                        updated[idx].description = e.target.value;
                        setCustomData({ ...customData, servicesList: updated });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Colors */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Cor Primária dos Botões & Destaques</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={customData.primaryColor}
                    onChange={(e) => setCustomData({ ...customData, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={customData.primaryColor}
                    onChange={(e) => setCustomData({ ...customData, primaryColor: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono w-32 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Texto do Botão Principal (Chamada para Ação)</label>
                <input
                  type="text"
                  value={customData.ctaText}
                  onChange={(e) => setCustomData({ ...customData, ctaText: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Tab 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Título SEO (Aparece no Google)</label>
                <input
                  type="text"
                  value={customData.seoTitle}
                  onChange={(e) => setCustomData({ ...customData, seoTitle: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Descrição SEO (Meta Description)</label>
                <textarea
                  rows={3}
                  value={customData.seoDescription}
                  onChange={(e) => setCustomData({ ...customData, seoDescription: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Google Preview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Prévia de Exibição no Google:</span>
                <p className="text-blue-700 font-medium text-sm line-clamp-1 hover:underline cursor-pointer">
                  {customData.seoTitle}
                </p>
                <p className="text-emerald-700 text-[10px]">https://seusite.com.br</p>
                <p className="text-slate-600 text-[11px] line-clamp-2">{customData.seoDescription}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Alterações salvas no projeto!
              </span>
            ) : (
              'As alterações serão aplicadas automaticamente no código-fonte.'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar & Aplicar no Site</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
