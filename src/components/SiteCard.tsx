import React from 'react';
import { Website } from '../types';
import { Star, Eye, ShoppingBag, CheckCircle, ArrowUpRight, Layers } from 'lucide-react';

interface SiteCardProps {
  website: Website;
  onOpenDetails: (website: Website) => void;
  onOpenLiveDemo: (website: Website) => void;
  onAddToCart: (website: Website) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  website,
  onOpenDetails,
  onOpenLiveDemo,
  onAddToCart,
}) => {
  return (
    <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Thumbnail Container with Hover Overlay */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={website.thumbnail}
          alt={website.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category & Page Count Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            {website.categoryName}
          </span>
          {website.pageCount && (
            <span className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" />
              <span>{website.pageCount} páginas</span>
            </span>
          )}
        </div>

        {/* Verified Seller Badge */}
        {website.seller.verified && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Verificado</span>
          </div>
        )}

        {/* Overlay Buttons on Hover */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
          <button
            onClick={() => onOpenLiveDemo(website)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition transform hover:scale-105 shadow-md shadow-blue-500/20"
          >
            <Eye className="w-4 h-4" />
            <span>Demo Interativa</span>
          </button>
          
          <button
            onClick={() => onOpenDetails(website)}
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-200 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Sales */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{website.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({website.reviewsCount})</span>
            </div>
            <span>{website.salesCount} vendas</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(website)}
            className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition cursor-pointer line-clamp-1 mb-1.5"
          >
            {website.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-normal">
            {website.shortDescription}
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {website.techStack.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-slate-200"
              >
                {tech}
              </span>
            ))}
            {website.techStack.length > 3 && (
              <span className="text-slate-400 text-[10px] font-medium self-center">
                +{website.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer Price & Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">A partir de</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                R$ {website.price.standard.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {website.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  R$ {website.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCart(website)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Comprar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
