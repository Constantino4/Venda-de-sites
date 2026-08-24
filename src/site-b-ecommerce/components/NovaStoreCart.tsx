import React, { useState } from 'react';
import { NovaCartItem, NovaStoreSettings } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';

interface NovaStoreCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: NovaCartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  settings: NovaStoreSettings;
}

export const NovaStoreCart: React.FC<NovaStoreCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  settings,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const isFreeShipping = subtotal >= settings.freeShippingThreshold || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : settings.fixedShippingRate;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'PROMO10' || clean === 'PRIMEIRACOMPRA' || clean === 'NOVA10') {
      setDiscountPercent(10);
      setCouponMessage({ text: 'Cupom de 10% OFF aplicado com sucesso!', success: true });
    } else if (clean === 'VIP20') {
      setDiscountPercent(20);
      setCouponMessage({ text: 'Cupom VIP de 20% OFF aplicado!', success: true });
    } else {
      setDiscountPercent(0);
      setCouponMessage({ text: 'Cupom inválido ou expirado.', success: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Cart Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Meu Carrinho
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {items.length} {items.length === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="bg-indigo-50/80 px-5 py-3 border-b border-indigo-100">
            <div className="flex justify-between text-xs font-bold text-indigo-950 mb-1.5">
              <span>
                {isFreeShipping
                  ? '🎉 Você ganhou FRETE GRÁTIS!'
                  : `Faltam R$ ${(settings.freeShippingThreshold - subtotal).toFixed(2)} para Frete Grátis`}
              </span>
              <span>{Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-indigo-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Seu carrinho está vazio</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore nossas ofertas e adicione seus produtos favoritos para finalizar sua compra.
                </p>
                <button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const itemPrice = item.product.promoPrice || item.product.price;
                return (
                  <div
                    key={index}
                    className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-18 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedVariation && Object.entries(item.selectedVariation).length > 0 && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {Object.entries(item.selectedVariation)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </p>
                        )}
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-slate-900">
                          R$ {(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon and Summary footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Cupom (ex: PROMO10)"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs uppercase font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponMessage.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto ({discountPercent}%)</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-emerald-600 uppercase">Grátis</span>
                    ) : (
                      `R$ ${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-base text-indigo-700">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onProceedToCheckout();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro e Criptografado</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
