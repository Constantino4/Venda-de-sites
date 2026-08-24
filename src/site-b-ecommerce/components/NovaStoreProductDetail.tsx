import React, { useState } from 'react';
import { NovaProduct } from '../types';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw, Zap, Check, Flame, Share2 } from 'lucide-react';

interface NovaStoreProductDetailProps {
  product: NovaProduct;
  onBack: () => void;
  onAddToCart: (prod: NovaProduct, quantity: number, variation?: Record<string, string>) => void;
  onBuyNow: (prod: NovaProduct, quantity: number, variation?: Record<string, string>) => void;
}

export const NovaStoreProductDetail: React.FC<NovaStoreProductDetailProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variations) {
      product.variations.forEach(v => {
        if (v.options.length > 0) initial[v.name] = v.options[0];
      });
    }
    return initial;
  });

  const [cepInput, setCepInput] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const hasPromo = product.promoPrice && product.promoPrice < product.price;
  const activePrice = product.promoPrice || product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - activePrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariations);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity, selectedVariations);
  };

  const handleSimulateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cepInput.trim().length >= 8) {
      setShippingCalculated(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Breadcrumb / Back Action */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Início / {product.categoryName} / <span className="text-slate-700 font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />

              {hasPromo && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>-{discountPercent}% OFF</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category, SKU & Reviews */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {product.categoryName}
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating and Social Proof */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-lg font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-amber-700 font-normal">({product.reviewsCount} avaliações)</span>
                </div>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Em estoque ({product.stock} unidades)
                </span>
              </div>

              {/* Price Block */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                {hasPromo && (
                  <span className="text-xs text-slate-400 line-through block">
                    De: R$ {product.price.toFixed(2)}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    R$ {activePrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                    à vista no PIX (com 5% desc.)
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Ou em até <strong className="text-slate-800">12x de R$ {((activePrice / 12) * 1.05).toFixed(2)}</strong> no cartão de crédito
                </p>
              </div>

              {/* Variations (Color, Size, etc.) */}
              {product.variations && product.variations.map((v) => (
                <div key={v.name} className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {v.name}: <span className="text-indigo-600">{selectedVariations[v.name]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedVariations[v.name] === opt
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity and Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-50 shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-white text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-50 shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    className={`flex-1 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 ${
                      isAddedFeedback
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {isAddedFeedback ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Adicionado ao Carrinho!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Adicionar ao Carrinho</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy Now Direct CTA */}
                <button
                  onClick={handleBuy}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Comprar Agora</span>
                </button>
              </div>

              {/* Shipping Simulator */}
              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleSimulateShipping} className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Calcular Frete e Prazo de Entrega</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cepInput}
                      onChange={(e) => setCepInput(e.target.value)}
                      placeholder="Digite seu CEP (ex: 01310-100)"
                      maxLength={9}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Calcular
                    </button>
                  </div>
                </form>

                {shippingCalculated && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold text-emerald-900">
                      <span>✓ Express Sedex (2 a 4 dias úteis)</span>
                      <span>R$ 14,90</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-900">
                      <span>✓ Envio Normal PAC (5 a 8 dias úteis)</span>
                      <span className="text-emerald-700 uppercase">Grátis</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Trust Badges Footer */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-500 font-semibold">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantia 30 Dias</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Rastreio Online</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Troca Fácil</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Description & Technical Specs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs mb-10 space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-3">Descrição Detalhada</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specs && product.specs.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-900 mb-4">Especificações Técnicas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">{spec.label}</span>
                  <span className="text-slate-900 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Avaliações dos Clientes</h3>
            <p className="text-xs text-slate-500">Opiniões de quem já comprou este produto</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-amber-900 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <span className="font-bold text-slate-900">Alexandre P.</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  ✓ Compra Verificada
                </span>
              </div>
              <div className="flex text-amber-400">
                {'★★★★★'}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Produto excelente! Superou minhas expectativas tanto no acabamento quanto na performance. Chegou em 3 dias com embalagem perfeita."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  C
                </div>
                <span className="font-bold text-slate-900">Camila R.</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  ✓ Compra Verificada
                </span>
              </div>
              <div className="flex text-amber-400">
                {'★★★★★'}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Comprei para presentear e a pessoa adorou. Qualidade indiscutível, recomendo a todos!"
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
