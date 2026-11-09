import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import {
  Product,
  Category,
  Banner,
  StoreSettings,
  CartItem,
  Order,
  Review,
  Coupon,
  ContactMessage,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
} from '../data/initialCatalog';
import {
  calculateCartTotals,
  CartTotals,
  generateOrderNumber,
  validateCoupon,
  checkStock,
} from '../utils/shop-logic';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: StoreSettings;
  loading: boolean;
  // Cart
  cart: CartItem[];
  cartTotals: CartTotals;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variation?: string) => void;
  removeFromCart: (productId: string, variation?: string) => void;
  updateQuantity: (productId: string, quantity: number, variation?: string) => void;
  clearCart: () => void;
  // Coupon
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  // Orders
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  getUserOrders: () => Promise<Order[]>;
  getAllOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateTrackingCode: (orderId: string, code: string) => Promise<void>;
  // Reviews
  getProductReviews: (productId: string) => Promise<Review[]>;
  getAllReviews: () => Promise<Review[]>;
  submitProductReview: (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected', reply?: string) => Promise<void>;
  // Products Admin CRUD
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  // Banners & Settings Admin
  saveBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  // Contact
  submitContact: (name: string, email: string, message: string, phone?: string, subject?: string) => Promise<void>;
  getContactMessages: () => Promise<ContactMessage[]>;
  // Database seed
  seedCatalog: () => Promise<void>;
  // UI toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const CART_STORAGE_KEY = 'cbe_cart_v1';
const WISHLIST_STORAGE_KEY = 'cbe_wishlist_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Cart & Wishlist state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  }, [cart]);

  // Save wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Initial boot: test Firestore and fetch products, banners, and settings
  useEffect(() => {
    let isMounted = true;
    testFirestoreConnection();

    const fetchInitialData = async () => {
      try {
        // Fetch products from Firestore
        const prodsSnap = await getDocs(collection(db, 'products'));
        if (!prodsSnap.empty && isMounted) {
          const list: Product[] = [];
          prodsSnap.forEach((doc) => {
            list.push({ id: doc.id, ...(doc.data() as Omit<Product, 'id'>) });
          });
          setProducts(list);
        } else if (prodsSnap.empty) {
          // Keep INITIAL_PRODUCTS in state
          setProducts(INITIAL_PRODUCTS);
        }

        // Fetch banners
        const bannerSnap = await getDocs(collection(db, 'banners'));
        if (!bannerSnap.empty && isMounted) {
          const bannerList: Banner[] = [];
          bannerSnap.forEach((doc) => {
            bannerList.push({ id: doc.id, ...(doc.data() as Omit<Banner, 'id'>) });
          });
          bannerList.sort((a, b) => (a.order || 0) - (b.order || 0));
          setBanners(bannerList);
        }

        // Fetch settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'store_config'));
        if (settingsDoc.exists() && isMounted) {
          setSettings({ id: 'store_config', ...(settingsDoc.data() as Omit<StoreSettings, 'id'>) });
        }
      } catch (err) {
        console.warn('Using local fallback catalog data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate cart totals
  const cartTotals = calculateCartTotals(
    cart,
    appliedCoupon,
    settings.freeShippingThreshold || 199,
    settings.defaultShippingCost || 19.9
  );

  const addToCart = (product: Product, quantity = 1, variation?: string) => {
    // Check available stock
    const currentItem = cart.find(
      (item) => item.productId === product.id && item.variation === variation
    );
    const currentQty = currentItem ? currentItem.quantity : 0;
    const targetQty = currentQty + quantity;

    const stockCheck = checkStock(targetQty, product.stock);
    if (!stockCheck.allowed) {
      showToast(
        `Desculpe, temos apenas ${product.stock} unidades disponíveis em estoque.`,
        'error'
      );
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (item) => item.productId === product.id && item.variation === variation
      );
      if (index > -1) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          quantity: targetQty,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity,
            image: product.thumbnail || (product.images && product.images[0]) || '',
            sku: product.sku,
            variation,
            stock: product.stock,
            externalPaymentLink: product.externalPaymentLink,
          },
        ];
      }
    });

    showToast(`"${product.title}" adicionado à sacola!`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variation?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variation === variation))
    );
    showToast('Item removido da sacola.', 'info');
  };

  const updateQuantity = (productId: string, quantity: number, variation?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variation);
      return;
    }

    const item = cart.find((i) => i.productId === productId && i.variation === variation);
    if (item && item.stock && quantity > item.stock) {
      showToast(`Quantidade máxima em estoque é ${item.stock}.`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.variation === variation) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Digite um código de cupom válido.' };
    }

    // Known coupons
    let coupon: Coupon | null = null;
    if (clean === 'BEMVINDA10') {
      coupon = {
        id: 'c-bemvinda',
        code: 'BEMVINDA10',
        discountType: 'percentage',
        value: 10,
        minPurchase: 0,
        active: true,
      };
    } else if (clean === 'PRIMEIRACOMPRA') {
      coupon = {
        id: 'c-primeira',
        code: 'PRIMEIRACOMPRA',
        discountType: 'fixed',
        value: 15,
        minPurchase: 100,
        active: true,
      };
    } else if (clean === 'FRETEGRATIS') {
      coupon = {
        id: 'c-frete',
        code: 'FRETEGRATIS',
        discountType: 'fixed',
        value: 19.9,
        minPurchase: 99,
        active: true,
      };
    } else {
      return { success: false, message: 'Cupom inválido ou não encontrado.' };
    }

    const validation = validateCoupon(coupon, cartTotals.subtotal);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    setAppliedCoupon(coupon);
    showToast(validation.message, 'success');
    return { success: true, message: validation.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Cupom removido.', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Item removido dos favoritos.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Item adicionado aos favoritos!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // In-memory recent orders cache for instant lookup
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Orders creation
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const orderNumber = generateOrderNumber();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const sanitizedItems = cart.map((i) => ({
      productId: i.productId,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      image: i.image || '',
      sku: i.sku || '',
      variation: i.variation || '',
      stock: i.stock || 0,
      externalPaymentLink: i.externalPaymentLink || '',
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: user?.uid || 'guest',
      customerEmail: orderData.customerEmail || '',
      customerName: orderData.customerName || '',
      customerPhone: orderData.customerPhone || '',
      customerCpf: orderData.customerCpf || '',
      items: sanitizedItems,
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discount,
      shipping: cartTotals.shipping,
      total: cartTotals.total,
      couponCode: appliedCoupon?.code || '',
      shippingAddress: orderData.shippingAddress || {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      status: 'aguardando_pagamento',
      paymentMethod: orderData.paymentMethod || 'Link Externo Seguro',
      paymentExternalLink:
        orderData.paymentExternalLink ||
        cart.find((i) => i.externalPaymentLink)?.externalPaymentLink ||
        'https://mpago.la/casabeleza-express',
      externalReference: orderNumber,
      trackingCode: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to memory cache immediately
    setRecentOrders((prev) => [newOrder, ...prev]);

    try {
      await setDoc(doc(db, 'orders', orderId), {
        ...newOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save order to Firestore, saving in local cache:', err);
    }

    // Clear cart after checkout
    clearCart();
    return newOrder;
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    // Check in-memory cache first
    const cached = recentOrders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (cached) return cached;

    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
      }
      // Also query by orderNumber
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const d = qSnap.docs[0];
        return { id: d.id, ...(d.data() as Omit<Order, 'id'>) };
      }
    } catch (err) {
      console.warn('Order lookup error:', err);
    }
    return null;
  };

  const getUserOrders = async (): Promise<Order[]> => {
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching user orders:', err);
      return [];
    }
  };

  const getAllOrders = async (): Promise<Order[]> => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Error fetching all orders:', err);
      return [];
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast(`Status do pedido atualizado para "${status}".`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const updateTrackingCode = async (orderId: string, trackingCode: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        trackingCode,
        status: 'enviado',
        updatedAt: serverTimestamp(),
      });
      showToast('Código de rastreamento adicionado com sucesso!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Reviews
  const getProductReviews = async (productId: string): Promise<Review[]> => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const list: Review[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
      return list;
    } catch {
      return [];
    }
  };

  const getAllReviews = async (): Promise<Review[]> => {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      const list: Review[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
      return list;
    } catch {
      return [];
    }
  };

  const submitProductReview = async (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      await setDoc(doc(db, 'reviews', reviewId), {
        ...review,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      showToast('Obrigado! Sua avaliação foi enviada e será publicada após moderação.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${reviewId}`);
    }
  };

  const updateReviewStatus = async (
    reviewId: string,
    status: 'approved' | 'rejected',
    adminReply?: string
  ) => {
    try {
      const data: Record<string, unknown> = { status };
      if (adminReply !== undefined) data.adminReply = adminReply;
      await updateDoc(doc(db, 'reviews', reviewId), data);
      showToast(`Avaliação ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  // Products CRUD
  const saveProduct = async (prod: Product) => {
    try {
      const prodRef = doc(db, 'products', prod.id);
      await setDoc(prodRef, {
        ...prod,
        updatedAt: serverTimestamp(),
      });
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === prod.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = prod;
          return next;
        }
        return [prod, ...prev];
      });
      showToast('Produto salvo com sucesso!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${prod.id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Produto excluído com sucesso.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  // Banners CRUD
  const saveBanner = async (banner: Banner) => {
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
      setBanners((prev) => {
        const idx = prev.findIndex((b) => b.id === banner.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = banner;
          return next;
        }
        return [...prev, banner];
      });
      showToast('Banner atualizado com sucesso!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      showToast('Banner removido.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${bannerId}`);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const merged = { ...settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'store_config'), merged);
      setSettings(merged);
      showToast('Configurações da loja atualizadas com sucesso!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/store_config');
    }
  };

  const submitContact = async (
    name: string,
    email: string,
    message: string,
    phone?: string,
    subject?: string
  ) => {
    const messageId = `msg_${Date.now()}`;
    try {
      await setDoc(doc(db, 'messages', messageId), {
        name,
        email,
        phone: phone || '',
        subject: subject || 'Dúvida Geral',
        message,
        status: 'unread',
        createdAt: new Date().toISOString(),
      });
      showToast('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
    } catch (err) {
      // Also notify backend
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      showToast('Mensagem enviada com sucesso!', 'success');
    }
  };

  const getContactMessages = async (): Promise<ContactMessage[]> => {
    try {
      const snap = await getDocs(collection(db, 'messages'));
      const list: ContactMessage[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  };

  // Seed database button for admin
  const seedCatalog = async () => {
    setLoading(true);
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      for (const banner of INITIAL_BANNERS) {
        await setDoc(doc(db, 'banners', banner.id), banner);
      }
      await setDoc(doc(db, 'settings', 'store_config'), INITIAL_SETTINGS);
      setProducts(INITIAL_PRODUCTS);
      setBanners(INITIAL_BANNERS);
      setSettings(INITIAL_SETTINGS);
      showToast('Banco de dados semeado com sucesso!', 'success');
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Erro ao sincronizar com Firestore. Verifique permissões.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        settings,
        loading,
        cart,
        cartTotals,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
        createOrder,
        getOrderById,
        getUserOrders,
        getAllOrders,
        updateOrderStatus,
        updateTrackingCode,
        getProductReviews,
        getAllReviews,
        submitProductReview,
        updateReviewStatus,
        saveProduct,
        deleteProduct,
        saveBanner,
        deleteBanner,
        updateSettings,
        submitContact,
        getContactMessages,
        seedCatalog,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
