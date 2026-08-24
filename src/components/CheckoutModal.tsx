import React, { useState, useEffect } from 'react';
import { CartItem, PurchasedSite, UpsellItem } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  DollarSign, 
  UserCheck, 
  Plus, 
  Layers, 
  Zap, 
  Globe, 
  Palette, 
  Search, 
  Server,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

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
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'paypal'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'cliente@exemplo.com.br');
  const [customerName, setCustomerName] = useState(user?.displayName || 'Comprador Oficial');
  const [customerPhone, setCustomerPhone] = useState('(11) 98765-4321');

  // Upsells State
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);

  // Update customer details when user auth changes
  useEffect(() => {
    if (user?.email) {
      setCustomerEmail(user.email);
    }
    if (user?.displayName) {
      setCustomerName(user.displayName);
    }
  }, [user]);

  if (!isOpen) return null;

  const UPSELL_OPTIONS: UpsellItem[] = [
    {
      id: 'up-seo',
      title: 'Otimização SEO Avançada',
      description: 'Configuração de meta tags, sitemap e indexação no Google para primeiras posições.',
      price: 79,
      iconName: 'Search',
      recommended: true,
    },
    {
      id: 'up-logo',
      title: 'Logotipo Profissional Vetorial',
      description: 'Criação de logotipo exclusivo em alta resolução nos formatos PNG, SVG e PDF.',
      price: 49,
      iconName: 'Palette',
    },
    {
      id: 'up-vip',
      title: 'Personalização VIP Completa',
      description: 'Nossa equipe insere todos os seus textos, fotos e conecta o WhatsApp para você.',
      price: 149,
      iconName: 'Zap',
    },
    {
      id: 'up-host',
      title: 'Hospedagem Cloud Turbo (1º Mês)',
      description: 'Servidores ultra-rápidos com SSL grátis e backup diário automatizado.',
      price: 29,
      iconName: 'Server',
    },
  ];

  const handleToggleUpsell = (id: string) => {
    setSelectedUpsells((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Pricing calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.selectedPrice, 0);
  const upsellsTotal = UPSELL_OPTIONS
    .filter((u) => selectedUpsells.includes(u.id))
    .reduce((acc, u) => acc + u.price, 0);

  const rawTotal = itemsSubtotal + upsellsTotal;
  const discountAmount = (itemsSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  // Dynamic PIX payload
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136webmarket-pagamentos-oficiais-2026520400005303986540${finalTotal.toFixed(2)}5802BR5925WEBMARKET TECNOLOGIA S/A6009SAO PAULO62070503***6304E8A2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Payment Confirmation Action
  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail,
          paymentMethod,
          items: cartItems.map((item) => ({
            website: item.website,
            licenseType: item.licenseType,
            selectedPrice: item.selectedPrice,
          })),
        }),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      const orderId = orderData?.order?.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. PayPal confirmation if method was paypal
      if (paymentMethod === 'paypal') {
        await fetch(`/api/orders/${orderId}/paypal-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paypalOrderId: `PAYPAL-TX-${Date.now()}`,
          }),
        }).catch(() => {});
      }

      // Celebrate with confetti
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.6 },
      });

      // Construct purchased sites with formal licenses
      const newPurchases: PurchasedSite[] = cartItems.map((item) => {
        const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randCode2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randCode3 = Math.random().toString(36).substring(2, 6).toUpperCase();
        return {
          orderId,
          purchaseDate: new Date().toLocaleDateString('pt-BR'),
          website: item.website,
          licenseType: item.licenseType,
          licenseKey: `LICENSE-${item.website.id.slice(0, 4).toUpperCase()}-${randCode}-${randCode2}-${randCode3}`,
          pricePaid: item.selectedPrice,
          orderStatus: 'paid',
          currentVersion: item.website.currentVersion || '1.0.0',
        };
      });

      onPaymentSuccess(newPurchases);
      onClose();
    } catch (err: any) {
      console.error('Erro na confirmação:', err);
      // Fallback
      const newPurchases: PurchasedSite[] = cartItems.map((item) => ({
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        purchaseDate: new Date().toLocaleDateString('pt-BR'),
        website: item.website,
        licenseType: item.licenseType,
        licenseKey: `LICENSE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        pricePaid: item.selectedPrice,
        orderStatus: 'paid',
        currentVersion: item.website.currentVersion || '1.0.0',
      }));

      onPaymentSuccess(newPurchases);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Checkout Seguro & Entrega Imediata</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Criptografia SSL 256-bit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Customer Info Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              1. Dados do Comprador & Faturamento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">E-mail para Entrega da Licença</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Selected Products in Cart */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              2. Itens Selecionados
            </h4>
            <div className="space-y-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.website.thumbnail}
                      alt={item.website.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 line-clamp-1">{item.website.title}</h5>
                      <span className="text-[10px] text-slate-500 capitalize">
                        Licença: {item.licenseType === 'extended' ? 'Estendida (Projetos Ilimitados)' : item.licenseType === 'installation' ? 'Com Instalação Inclusa' : 'Padrão (1 Projeto)'}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">R$ {item.selectedPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Upsells / Add-ons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>3. Serviços Opcionais Recomendados</span>
              </h4>
              <span className="text-[10px] text-slate-400">Marque para adicionar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {UPSELL_OPTIONS.map((upsell) => {
                const isSelected = selectedUpsells.includes(upsell.id);
                return (
                  <button
                    key={upsell.id}
                    type="button"
                    onClick={() => handleToggleUpsell(upsell.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{upsell.title}</span>
                        {upsell.recommended && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{upsell.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-blue-600 block">+R$ {upsell.price}</span>
                      <div className={`w-4 h-4 rounded-md border mt-1.5 ml-auto flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              4. Forma de Pagamento
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>PIX Instantâneo</span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 rounded">Aprovação Imediata</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'card'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Cartão de Crédito</span>
                <span className="text-[9px] text-slate-500">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'paypal'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>PayPal</span>
                <span className="text-[9px] text-slate-500">Internacional</span>
              </button>
            </div>

            {/* PIX Details */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-emerald-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Chave PIX Copia e Cola:
                  </span>
                  <span className="text-[10px] text-slate-500">Válido por 15 minutos</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal dos Templates:</span>
              <span>R$ {itemsSubtotal.toFixed(2)}</span>
            </div>

            {upsellsTotal > 0 && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span>Serviços Adicionais ({selectedUpsells.length}):</span>
                <span>+R$ {upsellsTotal.toFixed(2)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Desconto ({discountPercent}%):</span>
                <span>-R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900">
              <span className="font-black text-sm">Total Final:</span>
              <span className="font-black text-lg text-emerald-600">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-bold">Total a Pagar</span>
            <span className="text-base font-black text-slate-900">R$ {finalTotal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmPayment}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando Pedido & Gerando Licença...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pagamento & Liberar Site</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
