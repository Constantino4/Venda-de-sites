import React, { useState } from 'react';
import { Website, CategoryType } from '../../types';
import { 
  X, 
  Save, 
  Layers, 
  DollarSign, 
  Sparkles, 
  FileText, 
  Check, 
  Tag, 
  CheckCircle2, 
  Image as ImageIcon, 
  Code 
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockSites';

interface EditTemplateModalProps {
  template: Website | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Website) => void;
}

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !template) return null;

  const [title, setTitle] = useState(template.title);
  const [category, setCategory] = useState<CategoryType>(template.category);
  const [categoryName, setCategoryName] = useState(template.categoryName);
  const [standardPrice, setStandardPrice] = useState(template.price.standard.toString());
  const [promoPrice, setPromoPrice] = useState(template.price.promoPrice ? template.price.promoPrice.toString() : '');
  const [extendedPrice, setExtendedPrice] = useState(template.price.extended.toString());
  const [installationPrice, setInstallationPrice] = useState(template.price.installation.toString());
  const [status, setStatus] = useState<'published' | 'draft' | 'hidden'>(
    template.status === 'hidden' ? 'hidden' : template.status === 'draft' ? 'draft' : 'published'
  );
  const [shortDescription, setShortDescription] = useState(template.shortDescription);
  const [fullDescription, setFullDescription] = useState(template.fullDescription);
  const [pagesStr, setPagesStr] = useState((template.pages || ['Home', 'Sobre', 'Serviços', 'Contactos']).join(', '));
  const [featuresStr, setFeaturesStr] = useState((template.features || []).join('\n'));
  const [thumbnail, setThumbnail] = useState(template.thumbnail);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCategoryChange = (catId: string) => {
    setCategory(catId as CategoryType);
    const found = CATEGORIES.find(c => c.id === catId);
    if (found) setCategoryName(found.name);
  };

  const handleAIEnhanceCopy = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/describe-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          keywords: 'moderno, alta conversão, responsivo'
        })
      });
      const data = await res.json();
      if (data.shortDescription) setShortDescription(data.shortDescription);
      if (data.fullDescription) setFullDescription(data.fullDescription);
      if (data.features) setFeaturesStr(data.features.join('\n'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPages = pagesStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const parsedFeatures = featuresStr
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const updated: Website = {
      ...template,
      title,
      category,
      categoryName,
      pageCount: parsedPages.length,
      pages: parsedPages,
      shortDescription,
      fullDescription,
      thumbnail,
      status,
      features: parsedFeatures,
      price: {
        standard: Number(standardPrice) || 149,
        promoPrice: promoPrice ? Number(promoPrice) : undefined,
        extended: Number(extendedPrice) || 399,
        installation: Number(installationPrice) || 599,
      },
      updatedDate: new Date().toISOString().split('T')[0],
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black">Editar Metadados do Template</h3>
              <p className="text-[11px] text-slate-400">Atualize informações comerciais, preços e páginas</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Título do Template</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Categoria</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-700">Preço Standard (R$)</label>
              <input
                type="number"
                required
                value={standardPrice}
                onChange={(e) => setStandardPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-700">Preço Promo (R$)</label>
              <input
                type="number"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                placeholder="Opcional"
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700">Licença Estendida</label>
              <input
                type="number"
                value={extendedPrice}
                onChange={(e) => setExtendedPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700">Com Instalação</label>
              <input
                type="number"
                value={installationPrice}
                onChange={(e) => setInstallationPrice(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Status & Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Status de Visibilidade</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="published">🟢 Publicado</option>
                <option value="draft">🟡 Rascunho</option>
                <option value="hidden">🔴 Oculto</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Páginas (separadas por vírgula)</label>
              <input
                type="text"
                value={pagesStr}
                onChange={(e) => setPagesStr(e.target.value)}
                placeholder="Home, Sobre, Serviços, Preços, Equipa, Contactos"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* AI Enhance Copy Button */}
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-slate-700">Textos & Descrições</span>
            <button
              type="button"
              onClick={handleAIEnhanceCopy}
              disabled={isAiLoading}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Gerando com Gemini...' : 'Aprimorar Copy com Gemini'}</span>
            </button>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Descrição Curta (Card)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Descrição Completa</label>
              <textarea
                rows={2}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Diferenciais e Recursos (1 por linha)</label>
              <textarea
                rows={3}
                value={featuresStr}
                onChange={(e) => setFeaturesStr(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">URL da Imagem / Screenshot</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
