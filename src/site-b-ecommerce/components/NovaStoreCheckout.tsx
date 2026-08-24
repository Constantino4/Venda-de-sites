import React, { useState } from 'react';
import { NovaCartItem, NovaOrder, NovaStoreSettings } from '../types';
import { ShieldCheck, ArrowLeft, QrCode, CreditCard, FileText, CheckCircle2, Lock, Truck, Copy, Check } from 'lucide-react';

interface NovaStoreCheckoutProps {
  items: NovaCartItem[];
  settings: NovaStoreSettings;
  onBackToCart: () => void;
  onCompleteOrder: (order: NovaOrder) => void;
}

export const NovaStoreCheckout: React.FC<NovaStoreCheckoutProps> = ({
  items,
  settings,
  onBackToCart,
  onCompleteOrder,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<NovaOrder | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: 'Mariana Silva',
    email: 'mariana.silva@email.com',
    phone: '(11) 98765-4321',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apto 42',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'Brasil',
    paymentMethod: 'pix' as 'pix' | 'credit_card' | 'boleto',
    cardNumber: '•••• •••• •••• 4242',
    cardName: 'MARIANA SILVA',
    cardExpiry: '12/29',
    cardCvv: '888',
    installments: '1',
  });

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= settings.freeShippingThreshold || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : settings.fixedShippingRate;
  const pixDiscount = formData.paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal - pixDiscount + shippingCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderNum = `#NV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: NovaOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toLocaleString('pt-BR'),
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      address: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      items: items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        price: it.product.promoPrice || it.product.price,
        image: it.product.images[0],
      })),
      subtotal,
      discount: pixDiscount,
      shipping: shippingCost,
      total,
      paymentMethod: formData.paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      trackingCode: `BR-${Math.floor(100000000 + Math.random() * 900000000)}SP`,
    };

    setCreatedOrder(newOrder);
    setStep('success');
    onCompleteOrder(newOrder);
  };

  const handleCopyPix = () => {
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  if (step === 'success' && createdOrder) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Pedido Confirmado com Sucesso!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Obrigado pela sua compra, {createdOrder.customerName}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Seu pedido <strong className="text-slate-900">{createdOrder.orderNumber}</strong> foi registrado e está sendo preparado para envio.
            </p>
          </div>

          {/* Tracking Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Código de Rastreamento:</span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {createdOrder.trackingCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Previsão de Entrega:</span>
              <span className="font-bold text-slate-800">3 a 5 dias úteis</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Endereço de Envio:</span>
              <span className="font-bold text-slate-800 text-right truncate max-w-xs">
                {createdOrder.address.street}, {createdOrder.address.number} - {createdOrder.address.city}/{createdOrder.address.state}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={onBackToCart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition"
            >
              Voltar à Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Back */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToCart}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Carrinho</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Checkout Seguro SSL 256-bit</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer and Shipping and Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer Information */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>Dados Pessoais</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">E-mail para Receber o Rastreio</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">
                2
              </span>
              <span>Endereço de Entrega</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CEP</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Rua / Avenida</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Número</label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bairro</label>
                <input
                  type="text"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cidade / UF</label>
                <input
                  type="text"
                  required
                  value={`${formData.city} - ${formData.state}`}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">
                3
              </span>
              <span>Forma de Pagamento</span>
            </h2>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'pix'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-400/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black text-slate-900">PIX</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  5% OFF
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'credit_card'
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-400/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-black text-slate-900">Cartão</span>
                <span className="text-[10px] font-bold text-slate-500">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'boleto' })}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  formData.paymentMethod === 'boleto'
                    ? 'border-slate-900 bg-slate-100 shadow-xs ring-2 ring-slate-400/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <FileText className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-black text-slate-900">Boleto</span>
                <span className="text-[10px] font-bold text-slate-500">À vista</span>
              </button>
            </div>

            {/* Method Details */}
            {formData.paymentMethod === 'pix' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto border border-emerald-200 flex items-center justify-center shadow-xs">
                  <QrCode className="w-24 h-24 text-emerald-800" />
                </div>
                <p className="text-xs text-emerald-950 font-medium">
                  Aprovação instantânea em segundos. O QR Code será liberado para pagamento.
                </p>
              </div>
            )}

            {formData.paymentMethod === 'credit_card' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Validade</label>
                  <input
                    type="text"
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Código CVV</label>
                  <input
                    type="text"
                    value={formData.cardCvv}
                    onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-base font-black text-slate-900">Resumo da Compra</h2>

            {/* Items list */}
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{it.product.name}</p>
                      <p className="text-slate-400">Qtd: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    R$ {((it.product.promoPrice || it.product.price) * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>

              {pixDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Desconto PIX (5%)</span>
                  <span>- R$ {pixDiscount.toFixed(2)}</span>
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

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total a Pagar</span>
                <span className="text-indigo-700">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Confirmar e Pagar R$ {total.toFixed(2)}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantia de Entrega NovaStore Pro</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
