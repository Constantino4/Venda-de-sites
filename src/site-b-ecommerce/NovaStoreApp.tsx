import React, { useState } from 'react';
import {
  NovaProduct,
  NovaCategory,
  NovaCartItem,
  NovaOrder,
  NovaCustomer,
  NovaStoreSettings
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS
} from './initialData';

import { NovaStoreHeader } from './components/NovaStoreHeader';
import { NovaStoreHero } from './components/NovaStoreHero';
import { NovaStoreCategories } from './components/NovaStoreCategories';
import { NovaStoreProductGrid } from './components/NovaStoreProductGrid';
import { NovaStoreProductDetail } from './components/NovaStoreProductDetail';
import { NovaStoreCart } from './components/NovaStoreCart';
import { NovaStoreCheckout } from './components/NovaStoreCheckout';
import { NovaStoreCustomerArea } from './components/NovaStoreCustomerArea';
import { NovaStoreContact } from './components/NovaStoreContact';
import { NovaStoreFooter } from './components/NovaStoreFooter';
import { NovaStoreAdmin } from './components/NovaStoreAdmin';

interface NovaStoreAppProps {
  initialView?: 'home' | 'product-detail' | 'checkout' | 'customer-area' | 'contact' | 'admin';
}

export const NovaStoreApp: React.FC<NovaStoreAppProps> = ({
  initialView = 'home'
}) => {
  // Store Data States
  const [products, setProducts] = useState<NovaProduct[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<NovaCategory[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<NovaOrder[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<NovaCustomer[]>(INITIAL_CUSTOMERS);
  const [settings, setSettings] = useState<NovaStoreSettings>(INITIAL_SETTINGS);

  // Cart State
  const [cartItems, setCartItems] = useState<NovaCartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      selectedVariation: { 'Cor': 'Preto Matte' }
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Navigation and Filter States
  const [currentView, setCurrentView] = useState<'home' | 'product-detail' | 'checkout' | 'customer-area' | 'contact' | 'admin'>(initialView);
  const [selectedProduct, setSelectedProduct] = useState<NovaProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart Handlers
  const handleAddToCart = (prod: NovaProduct, quantity: number = 1, variation?: Record<string, string>) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === prod.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (variation) updated[existingIndex].selectedVariation = variation;
        return updated;
      }
      return [...prev, { product: prod, quantity, selectedVariation: variation }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems(prev => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Select Product Handler
  const handleSelectProduct = (prod: NovaProduct) => {
    setSelectedProduct(prod);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buy Now Handler (from detail page)
  const handleBuyNow = (prod: NovaProduct, quantity: number, variation?: Record<string, string>) => {
    handleAddToCart(prod, quantity, variation);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete Order Handler (from checkout)
  const handleCompleteOrder = (newOrder: NovaOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
  };

  // If viewing admin panel:
  if (currentView === 'admin') {
    return (
      <NovaStoreAdmin
        products={products}
        categories={categories}
        orders={orders}
        customers={customers}
        settings={settings}
        onUpdateProducts={setProducts}
        onUpdateCategories={setCategories}
        onUpdateOrders={setOrders}
        onUpdateSettings={setSettings}
        onBackToStorefront={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <NovaStoreHeader
        settings={settings}
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => {
          setSelectedCategory('all');
          setSearchQuery('');
          setCurrentView('home');
        }}
        onNavigateCategory={(catId) => {
          setSelectedCategory(catId);
          setCurrentView('home');
        }}
        onNavigateCustomerArea={() => setCurrentView('customer-area')}
        onNavigateContact={() => setCurrentView('contact')}
        onNavigateAdmin={() => setCurrentView('admin')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <NovaStoreHero
              settings={settings}
              onExploreDeals={() => setSelectedCategory('deal')}
            />

            <NovaStoreCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
            />

            <NovaStoreProductGrid
              products={products}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectProduct={handleSelectProduct}
              onAddToCart={(p) => handleAddToCart(p, 1)}
            />
          </div>
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <NovaStoreProductDetail
            product={selectedProduct}
            onBack={() => setCurrentView('home')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentView === 'checkout' && (
          <NovaStoreCheckout
            items={cartItems}
            settings={settings}
            onBackToCart={() => {
              setCurrentView('home');
              setIsCartOpen(true);
            }}
            onCompleteOrder={handleCompleteOrder}
          />
        )}

        {currentView === 'customer-area' && (
          <NovaStoreCustomerArea
            orders={orders}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'contact' && (
          <NovaStoreContact
            settings={settings}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <NovaStoreCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
        settings={settings}
      />

      {/* Footer */}
      <NovaStoreFooter
        settings={settings}
        onNavigateCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('home');
        }}
        onNavigateContact={() => setCurrentView('contact')}
        onNavigateAdmin={() => setCurrentView('admin')}
      />
    </div>
  );
};
