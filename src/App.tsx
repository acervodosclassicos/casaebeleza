import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CookieConsent } from './components/CookieConsent';
import { ToastContainer } from './components/ToastContainer';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { PaymentCompletedView } from './views/PaymentCompletedView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { InstitutionalView } from './views/InstitutionalView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';
import { WhatsAppButton } from './components/WhatsAppButton';

function StoreApp() {
  const { settings } = useStore();

  // Read initial route from URL path or query
  const getInitialRoute = () => {
    const path = window.location.pathname.replace(/^\//, '');
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('orderId');

    if (path === 'pagamento-concluido' || path === 'pagamento-confirmado' || orderId) {
      return { view: 'pagamento-concluido', param: orderId || '' };
    }
    if (path === 'catalogo') return { view: 'catalogo', param: '' };
    if (path === 'admin') return { view: 'admin', param: '' };
    if (path === 'checkout') return { view: 'checkout', param: '' };
    if (path === 'rastreio' || path === 'acompanhar-pedido') {
      return { view: 'acompanhar-pedido', param: '' };
    }
    if (path === 'contato') return { view: 'contato', param: '' };
    if (path === 'conta') return { view: 'conta', param: '' };
    if (path === 'favoritos') return { view: 'favoritos', param: '' };
    if (path.startsWith('produto/')) {
      return { view: 'produto', param: path.replace('produto/', '') };
    }

    return { view: 'home', param: '' };
  };

  const [currentRoute, setCurrentRoute] = useState<{ view: string; param?: string }>(
    getInitialRoute()
  );

  const navigate = (view: string, param?: string) => {
    setCurrentRoute({ view, param });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL quietly without full reload
    let newPath = '/';
    if (view === 'home') newPath = '/';
    else if (view === 'produto' && param) newPath = `/produto/${param}`;
    else if (view === 'pagamento-concluido' && param) newPath = `/pagamento-confirmado?orderId=${param}`;
    else if (view === 'pagamento-concluido') newPath = '/pagamento-confirmado';
    else newPath = `/${view}`;

    window.history.pushState({}, '', newPath);
  };

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFD] text-zinc-900 selection:bg-pink-100 selection:text-[#E6007A]">
      {/* Header */}
      <Header onNavigate={navigate} currentView={currentRoute.view} />

      {/* Main View Container */}
      <main className="flex-1">
        {currentRoute.view === 'home' && <HomeView onNavigate={navigate} />}

        {currentRoute.view === 'catalogo' && (
          <CatalogView initialFilter={currentRoute.param} onNavigate={navigate} />
        )}

        {currentRoute.view === 'produto' && (
          <ProductDetailView
            productId={currentRoute.param || ''}
            onNavigate={navigate}
          />
        )}

        {currentRoute.view === 'checkout' && <CheckoutView onNavigate={navigate} />}

        {currentRoute.view === 'pagamento-concluido' && (
          <PaymentCompletedView
            orderId={currentRoute.param}
            onNavigate={navigate}
          />
        )}

        {currentRoute.view === 'acompanhar-pedido' && (
          <OrderTrackingView
            initialOrderNumber={currentRoute.param}
            onNavigate={navigate}
          />
        )}

        {(currentRoute.view === 'conta' || currentRoute.view === 'favoritos') && (
          <CustomerAccountView onNavigate={navigate} />
        )}

        {currentRoute.view === 'institucional' && (
          <InstitutionalView
            pageSlug={currentRoute.param || 'sobre'}
            onNavigate={navigate}
          />
        )}

        {currentRoute.view === 'contato' && <ContactView />}

        {currentRoute.view === 'admin' && <AdminView />}
      </main>

      {/* Floating WhatsApp Support Button */}
      <WhatsAppButton />

      {/* Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => navigate('checkout')}
        onContinueShopping={() => navigate('catalogo')}
      />

      {/* LGPD Cookie Consent */}
      <CookieConsent />

      {/* Real-time Toasts */}
      <ToastContainer />

      {/* Institutional Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <StoreApp />
      </StoreProvider>
    </AuthProvider>
  );
}
