import React from 'react';
import { NovaOrder } from '../types';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft } from 'lucide-react';

interface NovaStoreCustomerAreaProps {
  orders: NovaOrder[];
  onBackToHome: () => void;
}

export const NovaStoreCustomerArea: React.FC<NovaStoreCustomerAreaProps> = ({
  orders,
  onBackToHome,
}) => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Loja</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900">Área do Cliente</h1>
          <p className="text-xs text-slate-500">Acompanhe seus pedidos em andamento e histórico de compras</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Nenhum pedido encontrado</h3>
            <p className="text-xs text-slate-500 mb-4">Você ainda não realizou compras nesta loja.</p>
            <button
              onClick={onBackToHome}
              className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Começar a Comprar
            </button>
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{ord.orderNumber}</h3>
                    <span className="text-xs text-slate-400">Realizado em {ord.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Status: {ord.orderStatus === 'shipped' ? 'Enviado / A caminho' : ord.orderStatus === 'delivered' ? 'Entregue' : 'Em Preparação'}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    Total: R$ {ord.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.productName}</h4>
                        <p className="text-slate-400">Quantidade: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery and Tracking Details */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Endereço de Entrega:</span>
                    <p className="text-slate-500">
                      {ord.address.street}, {ord.address.number} - {ord.address.neighborhood}, {ord.address.city}/{ord.address.state} (CEP: {ord.address.zipCode})
                    </p>
                  </div>
                </div>

                {ord.trackingCode && (
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Código de Rastreamento:</span>
                      <p className="font-mono font-bold text-indigo-600">{ord.trackingCode}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
