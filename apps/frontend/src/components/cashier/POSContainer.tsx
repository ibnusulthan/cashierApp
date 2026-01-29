'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/useAdminDashboard';
import {
  useCreateTransaction,
  useCompleteTransaction,
  useCancelTransaction,
} from '@/hooks/useCashier';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { printReceipt } from '@/lib/print-receipt';

import ProductKatalog from './ProductKatalog';
import CartSidebar from './CartSidebar';
import PaymentModal from './PaymentModal';

export default function POSContainer({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // --- POS STATE ---
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm); // State untuk debounce
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'ALL'
  );

  // MODAL STATES
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'CASH' | 'DEBIT'>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [debitCardNo, setDebitCardNo] = useState('');

  // --- LOGIKA DEBOUNCE ---
  // Menunggu 500ms setelah user berhenti mengetik sebelum update debouncedSearch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- URL SYNC EFFECT (Hanya jalan ketika debouncedSearch berubah) ---
  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);

    if (debouncedSearch) currentParams.set('search', debouncedSearch);
    else currentParams.delete('search');

    if (selectedCategory !== 'ALL')
      currentParams.set('category', selectedCategory);
    else currentParams.delete('category');

    const newUrl = `${pathname}?${currentParams.toString()}`;
    // Gunakan window.history agar tidak memicu re-render berat dari Next Router
    window.history.replaceState(null, '', newUrl);
  }, [debouncedSearch, selectedCategory, pathname]);

  // --- FETCH DATA ---
  const { data: productsData, isLoading: prodLoading } = useProducts({
    limit: 200,
  });
  const { data: categoriesData } = useCategories();
  const createTx = useCreateTransaction();
  const completeTx = useCompleteTransaction();
  const cancelTx = useCancelTransaction();

  // --- FILTER PRODUK (Menggunakan debouncedSearch) ---
  const filteredProducts = useMemo(() => {
    const products = productsData?.data || [];
    return products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        (selectedCategory === 'ALL' || p.categoryId === selectedCategory)
    );
  }, [productsData, debouncedSearch, selectedCategory]);

  // --- LOCK SCROLL ---
  useEffect(() => {
    document.body.style.overflow = showPaymentModal ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPaymentModal]);

  // --- HANDLERS ---
  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error('Stok produk ini habis!');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing && existing.quantity >= product.stock) {
        toast.error(`Maksimal stok tersisa: ${product.stock}`);
        return prev;
      }

      return existing
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;

            if (delta > 0 && newQty > item.stock) {
              toast.error('Stok tidak mencukupi');
              return item;
            }

            return { ...item, quantity: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const handleInitialCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await createTx.mutateAsync({
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      setPendingTxId(res.id);
      setShowPaymentModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    }
  };

  const handleFinalize = async () => {
    if (!pendingTxId) return;
    try {
      const total = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const payload =
        paymentType === 'CASH'
          ? { paymentType, paidAmount: parseInt(paidAmount) || 0 }
          : { paymentType, debitCardNo };

      await completeTx.mutateAsync({ id: pendingTxId, data: payload });

      printReceipt({
        id: pendingTxId,
        cart,
        total,
        paymentType,
        paidAmount: parseInt(paidAmount) || 0,
        changeAmount: (parseInt(paidAmount) || 0) - total,
        debitCardNo,
      });

      toast.success('Transaksi Berhasil!'); // Feedback sukses
      await queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh stok saja

      setCart([]);
      setShowPaymentModal(false);
      setPaidAmount('');
      setDebitCardNo('');
      setPendingTxId(null);
    } catch (err: any) {
      toast.error('Gagal menyelesaikan pembayaran');
    }
  };

  return (
    <div className="relative grid h-full grid-cols-1 gap-6 pb-4 lg:grid-cols-3">
      <ProductKatalog
        products={filteredProducts}
        categories={Array.isArray(categoriesData) ? categoriesData : []}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        addToCart={addToCart}
        isLoading={prodLoading}
      />

      <CartSidebar
        cart={cart}
        updateQty={updateQty}
        setCart={setCart}
        total={cart.reduce((acc, item) => acc + item.price * item.quantity, 0)}
        onCheckout={handleInitialCheckout}
        isPending={createTx.isPending}
      />

      {showPaymentModal && (
        <PaymentModal
          total={cart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          )}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          changeAmount={
            (parseInt(paidAmount) || 0) -
            cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
          }
          debitCardNo={debitCardNo}
          setDebitCardNo={setDebitCardNo}
          onCancel={async () => {
            await cancelTx.mutateAsync(pendingTxId!);
            setShowPaymentModal(false);
            setPendingTxId(null);
          }}
          onFinalize={handleFinalize}
          isPending={completeTx.isPending}
          isCancelPending={cancelTx.isPending}
        />
      )}
    </div>
  );
}
