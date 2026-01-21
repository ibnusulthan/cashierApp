'use client';

import { useState, useMemo } from 'react';
import { useProducts, useCategories } from '@/hooks/useAdminDashboard.ts';
import { 
  useCreateTransaction, 
  useCompleteTransaction, 
  useCancelTransaction 
} from '@/hooks/useCashier';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Loader2,
  Image as ImageIcon,
  ShoppingCart,
  X,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function POSContainer({ shiftId }: { shiftId: string }) {
  // --- HOOKS ---
  const queryClient = useQueryClient();
  const { data: productsData, isLoading: prodLoading } = useProducts();
  const { data: categoriesData } = useCategories();
  
  const createTx = useCreateTransaction();
  const completeTx = useCompleteTransaction();
  const cancelTx = useCancelTransaction();

  // --- STATES ---
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'CASH' | 'DEBIT'>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [debitCardNo, setDebitCardNo] = useState('');

  // --- DERIVED DATA ---
  const products = productsData?.data || [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const numericPaidAmount = parseInt(paidAmount) || 0;
  const changeAmount = numericPaidAmount - total;

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // --- CART ACTIONS ---
  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing)
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- TRANSACTION FLOW ---

  // STEP 1: Create Transaction (PENDING)
  const handleInitialCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await createTx.mutateAsync({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      setPendingTxId(res.id);
      setShowPaymentModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat transaksi");
    }
  };

  // STEP 2: Complete Transaction (COMPLETED)
  const handleFinalize = async () => {
    if (!pendingTxId) return;
    try {
      const payload = paymentType === 'CASH' 
        ? { paymentType, paidAmount: numericPaidAmount } 
        : { paymentType, debitCardNo };

      await completeTx.mutateAsync({ id: pendingTxId, data: payload });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shift-detail', shiftId] }),
        queryClient.invalidateQueries({ queryKey: ['active-shift'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }) // Update stok di katalog
      ]);
      resetPOS();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyelesaikan pembayaran");
    }
  };

  // STEP 3: Cancel Transaction (CANCELED)
  const handleCancel = async () => {
    if (!pendingTxId) return;
    try {
      // Menambahkan await agar tidak keluar dari modal sebelum proses delete selesai
      await cancelTx.mutateAsync(pendingTxId);
      setShowPaymentModal(false);
      setPendingTxId(null);
    } catch (err: any) {
      // Modal tetap terbuka jika error 500 terjadi di backend
      console.error("Cancel failed:", err);
    }
  };

  const resetPOS = () => {
    setCart([]);
    setShowPaymentModal(false);
    setPendingTxId(null);
    setPaidAmount('');
    setDebitCardNo('');
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 pb-4 lg:grid-cols-3 relative">
      {/* KIRI: KATALOG PRODUK */}
      <div className="flex min-h-0 flex-col space-y-4 lg:col-span-2">
        <div className="flex-none space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari menu..."
              className="w-full rounded-2xl border-none bg-white py-3 pr-4 pl-11 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${selectedCategory === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              Semua
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-5 py-2 text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 pb-10 md:grid-cols-3 xl:grid-cols-4">
            {prodLoading ? (
              <Loader2 className="col-span-full mx-auto mt-10 animate-spin text-blue-600" />
            ) : (
              filteredProducts.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className={`flex h-fit flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white text-left shadow-sm transition-all hover:shadow-lg ${p.stock <= 0 ? 'opacity-50' : ''}`}
                >
                  <div className="relative flex h-28 items-center justify-center bg-slate-50">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-200" size={30} />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="mb-1 text-[10px] font-bold text-blue-500 uppercase">{p.category?.name || 'Item'}</p>
                    <p className="line-clamp-1 text-xs font-bold text-slate-800">{p.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900">{formatCurrency(p.price)}</p>
                      <p className="text-[9px] font-bold text-slate-400">Stok: {p.stock}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KANAN: KERANJANG */}
      <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl">
        <div className="flex flex-none items-center justify-between border-b border-slate-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-black tracking-tighter text-slate-800 uppercase italic">
            <ShoppingCart size={18} className="text-blue-600" /> My Cart
          </h3>
          <button onClick={() => setCart([])} className="text-slate-300 transition-colors hover:text-red-500">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-slate-300">
              <ShoppingCart size={40} className="mb-2 opacity-20" />
              <p className="text-xs font-bold tracking-widest uppercase">Kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="group relative flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] font-bold text-blue-600">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-slate-100 bg-white px-1 shadow-sm">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-red-500"><Minus size={12} /></button>
                    <span className="w-6 text-center text-[10px] font-black text-slate-700">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400 hover:text-blue-600"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="rounded-lg bg-red-50 p-1.5 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-none space-y-4 rounded-t-[32px] bg-slate-900 p-5 text-white">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Total Bill</p>
            <p className="text-2xl font-black">{formatCurrency(total)}</p>
          </div>
          <button
            onClick={handleInitialCheckout}
            disabled={cart.length === 0 || createTx.isPending}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black uppercase tracking-widest shadow-lg shadow-blue-900/50 transition-all hover:bg-blue-700 disabled:opacity-30"
          >
            {createTx.isPending ? <Loader2 className="animate-spin" /> : "Checkout Sekarang"}
          </button>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Tagihan</p>
                <h2 className="text-4xl font-black">{formatCurrency(total)}</h2>
              </div>
              <button 
                onClick={handleCancel} 
                disabled={cancelTx.isPending}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                {cancelTx.isPending ? <Loader2 size={24} className="animate-spin" /> : <X size={24} />}
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* RINGKASAN ITEM (BARU) */}
              <div className="bg-slate-50 rounded-2xl p-4 max-h-32 overflow-y-auto space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Order Summary</p>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">{item.quantity}x {item.name}</span>
                    <span className="text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Type Toggle */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setPaymentType('CASH')}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${paymentType === 'CASH' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  <Banknote size={18}/> Cash
                </button>
                <button 
                  onClick={() => setPaymentType('DEBIT')}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${paymentType === 'DEBIT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  <CreditCard size={18}/> Debit
                </button>
              </div>

              {paymentType === 'CASH' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uang Diterima</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">Rp</span>
                      <input 
                        type="number" 
                        autoFocus
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-3xl font-black focus:border-blue-500 outline-none transition-all"
                        placeholder="0"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={`p-6 rounded-3xl flex justify-between items-center transition-colors ${changeAmount >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={`font-bold ${changeAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {changeAmount >= 0 ? 'Kembalian' : 'Kekurangan'}
                    </span>
                    <span className={`text-2xl font-black ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(changeAmount))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Kartu Debit</label>
                  <input 
                    type="text" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-xl font-black focus:border-blue-500 outline-none"
                    placeholder="Masukkan No. Kartu"
                    value={debitCardNo}
                    onChange={(e) => setDebitCardNo(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={handleCancel}
                  disabled={cancelTx.isPending || completeTx.isPending}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                >
                  {cancelTx.isPending ? "Canceling..." : "Batalkan"}
                </button>
                <button 
                  disabled={
                    completeTx.isPending || 
                    cancelTx.isPending ||
                    (paymentType === 'CASH' && (numericPaidAmount < total || !paidAmount)) || 
                    (paymentType === 'DEBIT' && !debitCardNo)
                  }
                  onClick={handleFinalize}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  {completeTx.isPending ? <Loader2 className="animate-spin"/> : <><CheckCircle2 size={20}/> Selesaikan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}