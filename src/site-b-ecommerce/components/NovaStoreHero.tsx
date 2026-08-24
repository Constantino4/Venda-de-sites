import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, CreditCard, RotateCcw } from 'lucide-react';
import { NovaStoreSettings } from '../types';

interface NovaStoreHeroProps {
  settings: NovaStoreSettings;
  onExploreDeals: () => void;
}

export const NovaStoreHero: React.FC<NovaStoreHeroProps> = ({
  settings,
  onExploreDeals,
}) => {
  return (
    <section className="mb-8">
      {/* Main Promo Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl">
        {/* Background Overlay Art */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.bannerImage})` }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coleção Exclusiva 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {settings.bannerTitle}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {settings.bannerSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreDeals}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-amber-400/20 transition flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{settings.bannerCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex justify-end">
            <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                alt="Destaque Loja"
                className="w-80 h-72 object-cover rounded-xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                  -30%
                </div>
                <div>
                  <p className="text-xs font-bold">Oferta em Destaque</p>
                  <p className="text-[11px] text-slate-500">Pronta Entrega</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Entrega Rápida</h4>
            <p className="text-[11px] text-slate-500">Envio para todo o país</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Compra 100% Segura</h4>
            <p className="text-[11px] text-slate-500">Criptografia SSL de ponta</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Até 12x Sem Juros</h4>
            <p className="text-[11px] text-slate-500">Ou 5% de desconto no PIX</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Devolução Fácil</h4>
            <p className="text-[11px] text-slate-500">Garantia de 30 dias</p>
          </div>
        </div>
      </div>
    </section>
  );
};
