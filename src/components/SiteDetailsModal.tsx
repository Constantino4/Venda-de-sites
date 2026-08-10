import React, { useState } from 'react';
import { Website, LicenseOption } from '../types';
import { X, Star, CheckCircle2, ShieldCheck, Eye, ShoppingBag, Download, Code, FileText, UserCheck, Sparkles, MessageSquare } from 'lucide-react';

interface SiteDetailsModalProps {
  website: Website | null;
  onClose: () => void;
  onOpenLiveDemo: (website: Website) => void;
  onAddToCartWithLicense: (website: Website, license: LicenseOption) => void;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({
  website,
  onClose,
  onOpenLiveDemo,
  onAddToCartWithLicense,
}) => {
  if (!website) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'reviews' | 'license'>('overview');
  const [selectedLicense, setSelectedLicense] = useState<LicenseOption>('standard');
  const [activeImage, setActiveImage] = useState<string>(website.thumbnail);
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>(
    Object.keys(website.sampleFiles || {})[0] || 'README.md'
  );

  const getPriceForLicense = (lic: LicenseOption) => {
    switch (lic) {
      case 'extended':
        return website.price.extended;
      case 'installation':
        return website.price.installation;
      default:
        return website.price.standard;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
              {website.categoryName}
            </span>
            <h2 className="text-xl font-black text-slate-900 truncate max-w-md">
              {website.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Main Top Section: Image Gallery + Quick Purchase Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                <img
                  src={activeImage}
                  alt={website.title}
                  className="w-full h-full object-cover object-top"
                />
                <button
                  onClick={() => onOpenLiveDemo(website)}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Abrir Demo Interativa</span>
                </button>
              </div>

              {/* Gallery Thumbnails */}
              {website.galleryImages && website.galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {website.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 aspect-video rounded-xl overflow-hidden border-2 transition ${
                        activeImage === img ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* License & Checkout Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
              
              <div>
                {/* Rating & Sales */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{website.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({website.reviewsCount} avaliações)</span>
                  </div>
                  <span className="text-slate-500 font-medium">{website.salesCount} vendas</span>
                </div>

                {/* License Selector */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Escolha seu Tipo de Licença
                </h4>

                <div className="space-y-2 mb-4">
                  {/* Standard License */}
                  <div
                    onClick={() => setSelectedLicense('standard')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedLicense === 'standard'
                        ? 'border-blue-600 bg-blue-50/80 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">Licença Padrão</p>
                      <p className="text-[10px] text-slate-500">1 Site / Cliente Pessoal</p>
                    </div>
                    <p className="text-sm font-black text-blue-600">
                      R$ {website.price.standard}
                    </p>
                  </div>

                  {/* Extended License */}
                  <div
                    onClick={() => setSelectedLicense('extended')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedLicense === 'extended'
                        ? 'border-blue-600 bg-blue-50/80 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">Licença Agência</p>
                      <p className="text-[10px] text-slate-500">Uso ilimitado para clientes</p>
                    </div>
                    <p className="text-sm font-black text-blue-600">
                      R$ {website.price.extended}
                    </p>
                  </div>

                  {/* Installation Included */}
                  <div
                    onClick={() => setSelectedLicense('installation')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedLicense === 'installation'
                        ? 'border-blue-600 bg-blue-50/80 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">Com Instalação Incluída</p>
                      <p className="text-[10px] text-slate-500">Dev faz a publicação pra você</p>
                    </div>
                    <p className="text-sm font-black text-blue-600">
                      R$ {website.price.installation}
                    </p>
                  </div>
                </div>

                {/* Seller Info Card */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={website.seller.avatar}
                    alt={website.seller.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{website.seller.name}</p>
                      {website.seller.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {website.seller.badge} • Responde em {website.seller.responseTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    onAddToCartWithLicense(website, selectedLicense);
                    onClose();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho (R$ {getPriceForLicense(selectedLicense)})</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Instantâneo</span>
                  </span>
                  <span>•</span>
                  <span>Pagamento Seguro PIX</span>
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs font-bold transition border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Visão Geral & Recursos
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Arquivos & Código Incluído</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Avaliações ({website.reviews.length})</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Sobre este Website</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {website.fullDescription}
                </p>
              </div>

              {/* Key Features Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Funcionalidades Principais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {website.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Tecnologias Utilizadas</h3>
                <div className="flex flex-wrap gap-2">
                  {website.techStack.map((tech, i) => (
                    <span key={i} className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-xl border border-slate-200 font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Sample Source Code Viewer */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Veja uma amostra da estrutura de código que você receberá ao realizar o download em <strong>.ZIP</strong>:
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                {/* Code file tabs */}
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {Object.keys(website.sampleFiles || {}).map((filePath) => (
                    <button
                      key={filePath}
                      onClick={() => setSelectedCodeFile(filePath)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition flex items-center gap-1.5 ${
                        selectedCodeFile === filePath
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{filePath}</span>
                    </button>
                  ))}
                </div>

                {/* Code content viewer */}
                <pre className="p-4 font-mono text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                  {website.sampleFiles[selectedCodeFile] || '// Código fonte disponível após o download'}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {website.reviews.length > 0 ? (
                website.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.userAvatar} alt={rev.userName} className="w-7 h-7 rounded-full" />
                        <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Compra Verificada
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Ainda não há avaliações escritas para este site. Seja o primeiro a comprar e avaliar!
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
