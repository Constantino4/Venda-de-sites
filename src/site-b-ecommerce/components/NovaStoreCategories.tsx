import React from 'react';
import { NovaCategory } from '../types';
import { ChevronRight } from 'lucide-react';

interface NovaStoreCategoriesProps {
  categories: NovaCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const NovaStoreCategories: React.FC<NovaStoreCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Categorias em Alta</h2>
          <p className="text-xs text-slate-500">Navegue pelas principais seções da loja</p>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          Ver Todas <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative rounded-2xl overflow-hidden p-3.5 text-left border transition duration-300 flex flex-col justify-between h-32 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Background gradient subtle */}
              <div className="absolute right-0 bottom-0 w-24 h-24 opacity-20 group-hover:opacity-40 transition group-hover:scale-110">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-tl-3xl"
                />
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  {cat.productCount} itens
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition">
                  {cat.name}
                </h3>
              </div>

              <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition">
                <span>Explorar</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
