import React, { useState } from 'react';
import {
  NovaProduct,
  NovaCategory,
  NovaOrder,
  NovaCustomer,
  NovaStoreSettings
} from '../types';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Search,
  Truck,
  Wand2,
  Cpu
} from 'lucide-react';
import { GeminiFileBridgeModal } from '../../components/admin/GeminiFileBridgeModal';

interface NovaStoreAdminProps {
  products: NovaProduct[];
  categories: NovaCategory[];
  orders: NovaOrder[];
  customers: NovaCustomer[];
  settings: NovaStoreSettings;
  onUpdateProducts: (newProducts: NovaProduct[]) => void;
  onUpdateCategories: (newCategories: NovaCategory[]) => void;
  onUpdateOrders: (newOrders: NovaOrder[]) => void;
  onUpdateSettings: (newSettings: NovaStoreSettings) => void;
  onBackToStorefront: () => void;
}

export const NovaStoreAdmin: React.FC<NovaStoreAdminProps> = ({
  products,
  categories,
  orders,
  customers,
  settings,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateOrders,
  onUpdateSettings,
  onBackToStorefront,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'settings'>('dashboard');

  // Products state & modal
  const [editingProduct, setEditingProduct] = useState<NovaProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Category modal
  const [newCatName, setNewCatName] = useState('');

  // Settings form local state
  const [localSettings, setLocalSettings] = useState<NovaStoreSettings>(settings);
  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);

  // Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const lowStockCount = products.filter(p => p.stock <= 10).length;

  // Handler: Save or Update Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (products.some(p => p.id === editingProduct.id)) {
      // Update existing
      const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
      onUpdateProducts(updated);
    } else {
      // Create new
      onUpdateProducts([editingProduct, ...products]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Handler: Delete Product
  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto da loja?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  // Handler: Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: NovaCategory = {
      id: newCatName.toLowerCase().replace(/\s+/g, '-'),
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'Tag',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      productCount: 0
    };

    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  // Handler: Delete Category
  const handleDeleteCategory = (id: string) => {
    onUpdateCategories(categories.filter(c => c.id !== id));
  };

  // Handler: Update Order Status
  const handleOrderStatusChange = (orderId: string, newStatus: NovaOrder['orderStatus']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: newStatus,
          trackingCode: newStatus === 'shipped' && !o.trackingCode ? `BR-${Math.floor(100000000 + Math.random() * 900000000)}SP` : o.trackingCode
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Handler: Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSettingsSavedFeedback(true);
    setTimeout(() => setSettingsSavedFeedback(false), 2500);
  };

  // Filtered products for admin
  const filteredAdminProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Navigation Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStorefront}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Loja Virtual</span>
          </button>
          
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Admin
              </span>
              <span>Painel de Controle — {settings.storeName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBridgeModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg shadow-purple-600/20 transition"
            title="Editar código fonte de NovaStoreHero.tsx e componentes diretamente com Gemini"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Editar Código com Gemini</span>
          </button>

          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Loja Online Ativa
          </span>
        </div>
      </div>

      {/* Admin Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800 p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão Geral & Estatísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Gerenciar Produtos</span>
            </div>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4" />
              <span>Categorias</span>
            </div>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos de Venda</span>
            </div>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </div>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configurações & Banners</span>
          </button>
        </aside>

        {/* Main Admin Content View */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Desempenho da Loja</h2>
                <p className="text-xs text-slate-400">Resumo financeiro e estatísticas de vendas</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Faturamento Total</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    R$ {totalRevenue.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% este mês
                  </span>
                </div>

                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total de Pedidos</span>
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {orders.length}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {totalSalesCount} pagos com sucesso
                  </span>
                </div>

                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Produtos em Catálogo</span>
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {products.length}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {categories.length} categorias ativas
                  </span>
                </div>

                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Estoque Baixo</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {lowStockCount}
                  </div>
                  <span className="text-[11px] text-rose-400 font-semibold">
                    Necessitam reposição
                  </span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Últimos Pedidos Recebidos</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Ver Todos os Pedidos →
                  </button>
                </div>

                <div className="divide-y divide-slate-700/60 overflow-x-auto">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-bold text-white block">{o.orderNumber}</span>
                        <span className="text-slate-400">{o.customerName} ({o.customerEmail})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-white block">R$ {o.total.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Produtos da Loja</h2>
                  <p className="text-xs text-slate-400">Cadastre, edite preços, altere fotos e controle o estoque</p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      name: '',
                      slug: '',
                      description: '',
                      price: 99.90,
                      promoPrice: undefined,
                      category: categories[0]?.id || 'eletronicos',
                      categoryName: categories[0]?.name || 'Eletrônicos',
                      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
                      stock: 20,
                      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
                      rating: 5.0,
                      reviewsCount: 0,
                      status: 'active',
                      isNew: true
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 self-start transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Produto</span>
                </button>
              </div>

              {/* Search filter */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Pesquisar por nome, SKU ou categoria..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Products Table */}
              <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço Normal</th>
                        <th className="p-4">Preço Promo</th>
                        <th className="p-4">Estoque</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 font-medium">
                      {filteredAdminProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-700/30 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900"
                            />
                            <div>
                              <span className="font-bold text-white block line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                            </div>
                          </td>
                          <td className="p-4">{p.categoryName}</td>
                          <td className="p-4 font-bold text-white">R$ {p.price.toFixed(2)}</td>
                          <td className="p-4">
                            {p.promoPrice ? (
                              <span className="text-emerald-400 font-bold">R$ {p.promoPrice.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              p.stock <= 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {p.stock} un
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{p.sku}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                title="Editar produto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg transition"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Categorias da Loja</h2>
                <p className="text-xs text-slate-400">Organize os departamentos de produtos</p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-lg flex gap-3">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome da nova categoria (ex: Brinquedos, Games...)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Adicionar
                </button>
              </form>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <span className="text-xs text-slate-400">Slug: {c.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Pedidos Recebidos</h2>
                <p className="text-xs text-slate-400">Gerencie o status de envio e entrega das compras dos clientes</p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-700">
                      <div>
                        <span className="text-base font-black text-white">{o.orderNumber}</span>
                        <p className="text-xs text-slate-400">{o.customerName} • {o.customerEmail} • {o.customerPhone}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">R$ {o.total.toFixed(2)}</span>
                        
                        {/* Status selector */}
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Em Preparação</option>
                          <option value="shipped">Enviado / A caminho</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
                          <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{item.productName}</p>
                            <p className="text-slate-400">Qtd: {item.quantity} × R$ {item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address & Tracking */}
                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 flex flex-wrap justify-between gap-2">
                      <span>Envio para: {o.address.street}, {o.address.number} - {o.address.city}/{o.address.state}</span>
                      {o.trackingCode && <span className="font-mono text-indigo-400 font-bold">Rastreio: {o.trackingCode}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Clientes Cadastrados</h2>
                <p className="text-xs text-slate-400">Histórico de compradores da sua loja</p>
              </div>

              <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Contato</th>
                      <th className="p-4">Cidade / UF</th>
                      <th className="p-4">Pedidos</th>
                      <th className="p-4">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-700/30">
                        <td className="p-4 font-bold text-white">{cust.name}</td>
                        <td className="p-4">
                          <p>{cust.email}</p>
                          <p className="text-slate-400">{cust.phone}</p>
                        </td>
                        <td className="p-4">{cust.city}</td>
                        <td className="p-4 font-bold text-indigo-400">{cust.totalOrders} pedidos</td>
                        <td className="p-4 font-black text-emerald-400">R$ {cust.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & BANNERS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-black text-white">Configurações & Banners da Loja</h2>
                <p className="text-xs text-slate-400">Altere o nome da loja, dados de contato e banners promocionais</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={localSettings.storeName}
                      onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Slogan da Loja</label>
                    <input
                      type="text"
                      value={localSettings.storeTagline}
                      onChange={(e) => setLocalSettings({ ...localSettings, storeTagline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp de Vendas</label>
                    <input
                      type="text"
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      value={localSettings.contactEmail}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Frete Grátis a partir de (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localSettings.freeShippingThreshold}
                      onChange={(e) => setLocalSettings({ ...localSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Taxa Fixa de Frete (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localSettings.fixedShippingRate}
                      onChange={(e) => setLocalSettings({ ...localSettings, fixedShippingRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-3">
                  <h3 className="text-xs font-black uppercase text-indigo-400">Banner Principal da Página Inicial</h3>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Título do Banner</label>
                    <input
                      type="text"
                      value={localSettings.bannerTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, bannerTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subtítulo do Banner</label>
                    <input
                      type="text"
                      value={localSettings.bannerSubtitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, bannerSubtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                  {settingsSavedFeedback && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Alterações salvas com sucesso!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {products.some(p => p.id === editingProduct.id) ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Preço Normal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.promoPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, promoPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Opcional"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Estoque (Unidades)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                        categoryName: cat?.name || e.target.value
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Código SKU</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">URL da Imagem Principal</label>
                <input
                  type="url"
                  required
                  value={editingProduct.images[0] || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value, ...editingProduct.images.slice(1)] })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Descrição Completa</label>
                <textarea
                  rows={4}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini File Bridge Modal */}
      {isBridgeModalOpen && (
        <GeminiFileBridgeModal
          isOpen={isBridgeModalOpen}
          onClose={() => setIsBridgeModalOpen(false)}
          initialComponentPath="src/site-b-ecommerce/components/NovaStoreHero.tsx"
        />
      )}

    </div>
  );
};
