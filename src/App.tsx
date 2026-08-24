import React, { useState, useMemo } from 'react';
import { Website, CartItem, PurchasedSite, FilterState, LicenseOption } from './types';
import { MOCK_SITES } from './data/mockSites';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SiteGrid } from './components/SiteGrid';
import { SiteDetailsModal } from './components/SiteDetailsModal';
import { LivePreviewModal } from './components/LivePreviewModal';
import { SellerDashboard } from './components/SellerDashboard';
import { PurchasedSitesModal } from './components/PurchasedSitesModal';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

function MainAppContent() {
  // Websites catalog state
  const [websites, setWebsites] = useState<Website[]>(MOCK_SITES);

  // Active View Tab: 'marketplace' | 'seller' | 'downloads'
  const [activeView, setActiveView] = useState<'marketplace' | 'seller' | 'downloads'>('marketplace');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    priceRange: [0, 1000],
    techStack: [],
    minRating: 0,
    sortBy: 'popular',
  });

  // Modals & Drawers state
  const [selectedDetailsSite, setSelectedDetailsSite] = useState<Website | null>(null);
  const [selectedDemoSite, setSelectedDemoSite] = useState<Website | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isGithubDeployOpen, setIsGithubDeployOpen] = useState<boolean>(false);
  const [githubDeployTarget, setGithubDeployTarget] = useState<{ id: string; title: string; slug?: string } | null>(null);

  const handleOpenGithubDeploy = (product?: { id: string; title: string; slug?: string }) => {
    setGithubDeployTarget(product || null);
    setIsGithubDeployOpen(true);
  };

  // Cart & Purchases state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedSites, setPurchasedSites] = useState<PurchasedSite[]>([]);

  // Filter & Sort Logic
  const filteredWebsites = useMemo(() => {
    return websites
      .filter((site) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = site.title.toLowerCase().includes(q);
          const matchDesc = site.shortDescription.toLowerCase().includes(q);
          const matchTech = site.techStack.some((t) => t.toLowerCase().includes(q));
          const matchCategory = site.categoryName.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchTech && !matchCategory) return false;
        }

        // Category
        if (filters.category !== 'all' && site.category !== filters.category) {
          return false;
        }

        // Price range
        if (site.price.standard > filters.priceRange[1]) {
          return false;
        }

        // Tech stack filter
        if (filters.techStack.length > 0) {
          const hasAllTechs = filters.techStack.every((t) =>
            site.techStack.includes(t)
          );
          if (!hasAllTechs) return false;
        }

        // Min rating
        if (filters.minRating > 0 && site.rating < filters.minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'price-asc':
            return a.price.standard - b.price.standard;
          case 'price-desc':
            return b.price.standard - a.price.standard;
          case 'newest':
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          default:
            // 'popular'
            return b.salesCount - a.salesCount;
        }
      });
  }, [websites, filters]);

  // Cart Actions
  const handleAddToCart = (website: Website, licenseType: LicenseOption = 'standard') => {
    const selectedPrice =
      licenseType === 'extended'
        ? website.price.extended
        : licenseType === 'installation'
        ? website.price.installation
        : website.price.standard;

    setCartItems((prev) => [
      ...prev,
      {
        website,
        licenseType,
        selectedPrice,
      },
    ]);

    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceedToCheckout = (discountPercent: number) => {
    setCheckoutDiscount(discountPercent);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (newPurchases: PurchasedSite[]) => {
    setPurchasedSites((prev) => [...newPurchases, ...prev]);
    setCartItems([]);
    setActiveView('downloads');
  };

  // Add seller custom listing
  const handleAddNewListing = (newSite: Website) => {
    setWebsites((prev) => [newSite, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cartItems.length}
        purchasedCount={purchasedSites.length}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenGithubDeploy={() => handleOpenGithubDeploy()}
        searchQuery={filters.searchQuery}
        setSearchQuery={(q) => setFilters((f) => ({ ...f, searchQuery: q }))}
      />

      {/* Main Body per View */}
      <main className="flex-1">
        {activeView === 'marketplace' && (
          <>
            <HeroBanner
              searchQuery={filters.searchQuery}
              setSearchQuery={(q) => setFilters((f) => ({ ...f, searchQuery: q }))}
              selectedCategory={filters.category}
              setSelectedCategory={(c) => setFilters((f) => ({ ...f, category: c }))}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />

            <SiteGrid
              websites={filteredWebsites}
              filters={filters}
              setFilters={setFilters}
              onOpenDetails={(site) => setSelectedDetailsSite(site)}
              onOpenLiveDemo={(site) => setSelectedDemoSite(site)}
              onAddToCart={(site) => handleAddToCart(site, 'standard')}
            />
          </>
        )}

        {activeView === 'seller' && (
          <SellerDashboard
            onAddNewListing={handleAddNewListing}
            existingSites={websites}
            onUpdateWebsites={(updated) => setWebsites(updated)}
            onOpenLiveDemo={(site) => setSelectedDemoSite(site)}
          />
        )}

        {activeView === 'downloads' && (
          <PurchasedSitesModal
            purchasedSites={purchasedSites}
            onClose={() => setActiveView('marketplace')}
            onOpenGithubDeploy={handleOpenGithubDeploy}
            onOpenLiveDemo={(site) => setSelectedDemoSite(site)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <GitHubDeployModal
        isOpen={isGithubDeployOpen}
        onClose={() => setIsGithubDeployOpen(false)}
        targetProduct={githubDeployTarget}
      />

      {/* Modals & Drawers */}
      <SiteDetailsModal
        website={selectedDetailsSite}
        onClose={() => setSelectedDetailsSite(null)}
        onOpenLiveDemo={(site) => setSelectedDemoSite(site)}
        onAddToCartWithLicense={(site, lic) => handleAddToCart(site, lic)}
      />

      <LivePreviewModal
        website={selectedDemoSite}
        onClose={() => setSelectedDemoSite(null)}
        onAddToCart={(site) => handleAddToCart(site, 'standard')}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountPercent={checkoutDiscount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        availableSites={websites}
        onOpenDetails={(site) => setSelectedDetailsSite(site)}
        onOpenLiveDemo={(site) => setSelectedDemoSite(site)}
        onAddToCart={(site) => handleAddToCart(site, 'standard')}
      />

      <AuthModal />

    </div>
  );
}
