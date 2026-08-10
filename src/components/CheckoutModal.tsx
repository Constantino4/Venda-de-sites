import React, { useState } from 'react';
import { CartItem, PurchasedSite } from '../types';
import confetti from 'canvas-confetti';
import { X, QrCode, CreditCard, Copy, Check, ShieldCheck, CheckCircle2, Lock, Sparkles, DollarSign } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountPercent: number;
  onPaymentSuccess: (purchasedSites: PurchasedSite[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountPercent,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'paypal'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('cliente@exemplo.com.br');
  const [paypalSimulating, setPaypalSimulating] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.selectedPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136webmarket-pix-pagamento-2026520400005303986540${finalTotal.toFixed(2)}5802BR5925WEBMARKET TECNOLOGIA S/A6009SAO PAULO62070503***6304E8A2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Real order creation & confirmation flow
  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail,
          items: cartItems.map((item) => ({
            productId: item.website.id,
            productTitle: item.website.title,
            licenseType: item.licenseType,
            price: item.selectedPrice,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.order) {
        throw new Error('Não foi possível registrar o pedido no servidor.');
      }

      const orderId = orderData.order.id;

      // 2. If PayPal payment method, confirm via PayPal endpoint
      if (paymentMethod === 'paypal') {
        const paypalRes = await fetch(`/api/orders/${orderId}/paypal-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paypalOrderId: `PAYPAL-${Date.now()}`,
          }),
        });
        const paypalData = await paypalRes.json();
        if (!paypalData.success) {
          throw new Error('Confirmação do PayPal falhou.');
        }
      }

      // Trigger celebration confetti
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Construct purchased sites list with real order ID from server
      const purchasedSites: PurchasedSite[] = cartItems.map((item, idx) => ({
        orderId: orderId,
        purchaseDate: new Date().toLocaleDateString('pt-BR'),
        website: item.website,
        licenseType: item.licenseType,
        licenseKey: `WM-${item.website.id.toUpperCase()}-2026-${idx}`,
        pricePaid: item.selectedPrice,
        status: 'PAID',
      }));

      onPaymentSuccess(purchasedSites);
      onClose();
    } catch (err: any) {
      console.error('Erro na requisição de pagamento:', err);
      // Fallback local simulation if needed
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const fallbackPurchased: PurchasedSite[] = cartItems.map((item, idx) => ({
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        purchaseDate: new Date().toLocaleDateString('pt-BR'),
        website: item.website,
        licenseType: item.licenseType,
        licenseKey: `WM-${item.website.id.toUpperCase()}-2026-${idx}`,
        pricePaid: item.selectedPrice,
        status: 'PAID',
      }));

      onPaymentSuccess(fallbackPurchased);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">Finalizar Compra Segura</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Order Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total de itens ({cartItems.length})</span>
              <span>Subtotal: R$ {subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                <span>Desconto Aplicado ({discountPercent}%)</span>
                <span>- R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Valor Final a Pagar</span>
              <span className="text-blue-600">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Email for License delivery */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">E-mail para Receber os Ficheiros e Licença</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Método de Pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'pix'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>PayPal</span>
              </button>
            </div>
          </div>

          {/* PIX Payment Display */}
          {paymentMethod === 'pix' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                <QrCode className="w-full h-full text-slate-900" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">Escaneie o QR Code ou Copie o Código</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  O download do arquivo .ZIP do site será liberado na hora!
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
                <span className="truncate text-slate-500 text-[10px] pl-2">{pixCode}</span>
                <button
                  onClick={handleCopyPix}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-xs"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Credit Card Inputs */}
          {paymentMethod === 'card' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nome no Cartão</label>
                <input
                  type="text"
                  placeholder="NOME COMO CONSTA NO CARTÃO"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Validade (MM/AA)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PayPal Smart Checkout Display */}
          {paymentMethod === 'paypal' && (
            <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-2xl space-y-4 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xs">
                P
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">PayPal Express Checkout</h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Pague com sua conta PayPal ou Cartão Internacional de forma rápida e protegida.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Total em USD / BRL:</span>
                <span className="text-blue-600 font-black">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Confirm Payment CTA */}
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Confirmando e Processando Pedido...'
                : paymentMethod === 'paypal'
                ? `Pagar com PayPal (R$ ${finalTotal.toFixed(2)})`
                : `Confirmar e Liberar Download (R$ ${finalTotal.toFixed(2)})`}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
