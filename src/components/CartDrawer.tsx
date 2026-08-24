import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: (discountPercent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.selectedPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');

    if (coupon.trim().toUpperCase() === 'WEBMARKET10') {
      setDiscountPercent(10);
      setCouponSuccess('Cupom WEBMARKET10 aplicado! 10% de desconto.');
    } else {
      setCouponError('Cupom inválido. Tente usar "WEBMARKET10".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col text-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 font-black text-base text-slate-900">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span>Seu Carrinho ({items.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div
                key={`${item.website.id}-${idx}`}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
              >
                <img
                  src={item.website.thumbnail}
                  alt={item.website.title}
                  className="w-16 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.website.title}</h4>
                  <p className="text-[10px] text-blue-600 uppercase font-bold">
                    Licença {item.licenseType}
                  </p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">
                    R$ {item.selectedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">Seu carrinho está vazio.</p>
            </div>
          )}
        </div>

        {/* Coupon & Summary Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Coupon input */}
            <div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cupom (ex: WEBMARKET10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition"
                >
                  Aplicar
                </button>
              </div>

              {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold mt-1">{couponSuccess}</p>}
              {couponError && <p className="text-[11px] text-rose-600 font-bold mt-1">{couponError}</p>}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Desconto ({discountPercent}%)</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-blue-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => onProceedToCheckout(discountPercent)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-2"
            >
              <span>Ir para o Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Acesso instantâneo ao código .ZIP após confirmação</span>
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
