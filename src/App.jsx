import React, { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  { id: 1, code: 'OIL-001', name: 'Yamalube AT 10W-40 (800ml)', category: 'Engine Oil', price: 280, stock: 24, unit: 'pcs' },
  { id: 2, code: 'OIL-002', name: 'Shell Advance AX7 10W-40 (1L)', category: 'Engine Oil', price: 340, stock: 15, unit: 'pcs' },
  { id: 3, code: 'BRK-001', name: 'Nissin Front Brake Pad (Mio/Beat)', category: 'Brake System', price: 180, stock: 8, unit: 'set' },
  { id: 4, code: 'BRK-002', name: 'Brake Shoe Rear (Wave/TMX)', category: 'Brake System', price: 140, stock: 3, unit: 'set' },
  { id: 5, code: 'TIR-001', name: 'IRC Tire 80/90 x 14 Tubeless', category: 'Tires & Tubes', price: 850, stock: 6, unit: 'pcs' },
  { id: 6, code: 'TIR-002', name: 'FDR Sport XR 90/80 x 17', category: 'Tires & Tubes', price: 1250, stock: 4, unit: 'pcs' },
  { id: 7, code: 'DRV-001', name: 'Drive Belt Gates Powerlink Mio', category: 'Drive System', price: 450, stock: 10, unit: 'pcs' },
  { id: 8, code: 'DRV-002', name: 'Flyball Roller Set 12g', category: 'Drive System', price: 220, stock: 18, unit: 'set' },
  { id: 9, code: 'ELE-001', name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 130, stock: 30, unit: 'pcs' },
  { id: 10, code: 'ELE-002', name: 'Battery Motolite 12V 5Ah', category: 'Electrical', price: 980, stock: 0, unit: 'pcs' }
];

const DEFAULT_MECHANICS = ['Juan', 'Pedro', 'Cardo', 'Talyer Shop / House'];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('motofix_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [mechanics, setMechanics] = useState(() => {
    const saved = localStorage.getItem('motofix_mechanics');
    return saved ? JSON.parse(saved) : DEFAULT_MECHANICS;
  });

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Service / Labor Input
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState('');

  // Payment Breakdown States
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');

  // Inventory Management State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({ code: '', name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });

  // Sales History State
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSalesModal, setShowSalesModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('motofix_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('motofix_mechanics', JSON.stringify(mechanics));
    if (mechanics.length > 0 && !selectedMechanic) {
      setSelectedMechanic(mechanics[0]);
    }
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem('motofix_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const categories = ['All', 'Engine Oil', 'Tires & Tubes', 'Brake System', 'Drive System', 'Electrical', 'Accessories'];

  const resetToDefaultItems = () => {
    if (window.confirm('I-load ang kumpletong bagong listahan ng sample products?')) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('motofix_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Out of stock na ang item na ito!');
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert('Naabot na ang maximum available stock!');
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1, type: 'part' }];
    });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!customServiceName || !customServicePrice || Number(customServicePrice) <= 0) {
      return alert('Paki-lagay ang tamang detalye ng labor fee!');
    }

    const serviceItem = {
      id: 'srv_' + Date.now(),
      name: `[LABOR] ${customServiceName}`,
      category: 'Service / Labor',
      price: Number(customServicePrice),
      qty: 1,
      type: 'service',
      mechanic: selectedMechanic || mechanics[0] || 'Talyer Shop'
    };

    setCart((prev) => [...prev, serviceItem]);
    setCustomServiceName('');
    setCustomServicePrice('');
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            if (item.type === 'service') return item;
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalAmount = Math.max(0, subtotal - Number(discount));
  const tenderedNum = Number(amountTendered) || 0;
  const change = Math.max(0, tenderedNum - totalAmount);

  const handleCheckoutAndPrint = () => {
    if (cart.length === 0) return alert('Walang laman ang cart!');
    if (tenderedNum < totalAmount) {
      return alert('Kulang ang ibinayad na pera (Amount Tendered)!');
    }

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-PH'),
      time: new Date().toLocaleTimeString('en-PH'),
      items: [...cart],
      subtotal,
      discount: Number(discount),
      total: totalAmount,
      paymentMethod,
      amountTendered: tenderedNum,
      change
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.id === prod.id);
        if (cartItem) {
          return { ...prod, stock: prod.stock - cartItem.qty };
        }
        return prod;
      })
    );

    setSalesHistory([newSale, ...salesHistory]);
    alert(`Order Complete!\nTotal: ₱${totalAmount.toLocaleString()}\nSukli: ₱${change.toLocaleString()}`);
    window.print();

    // Reset Cart & Payment
    setCart([]);
    setDiscount(0);
    setAmountTendered('');
  };

  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(term) ||
      (prod.code && prod.code.toLowerCase().includes(term)) ||
      prod.category.toLowerCase().includes(term);

    return term !== '' ? matchesSearch : matchesCategory;
  });

  const getStockBadge = (stock) => {
    if (stock <= 0) return <span className="bg-rose-100 text-rose-700 font-bold px-1 rounded text-[8px]">Out of Stock</span>;
    if (stock <= 5) return <span className="bg-amber-100 text-amber-700 font-bold px-1 rounded text-[8px]">{stock} Low Stock</span>;
    return <span className="bg-emerald-100 text-emerald-700 font-bold px-1 rounded text-[8px]">{stock} In Stock</span>;
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 text-[11px]">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-3 py-2 flex flex-wrap justify-between items-center shadow">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-emerald-400">🔧 MotoFix POS</span>
          <span className="text-[9px] text-slate-400">Motorcycle Parts & Service</span>
        </div>
        <div className="flex space-x-1 mt-1 sm:mt-0 items-center">
          <button onClick={() => setActiveTab('pos')} className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'pos' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>🛒 POS Center</button>
          <button onClick={() => setActiveTab('stocks')} className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'stocks' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>📦 Inventory ({products.length})</button>
          <button onClick={() => setShowSalesModal(true)} className="px-2 py-1 rounded text-[10px] font-bold bg-amber-600 text-white">📊 Sales Report</button>
        </div>
      </header>

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Main Items Area */}
          <div className="lg:col-span-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <div className="sm:col-span-2 flex items-center bg-white border rounded px-2 py-1">
                <span className="mr-1 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search item name, code, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-[10px] outline-none"
                />
              </div>
              <form onSubmit={handleAddService} className="flex gap-1 bg-amber-50 border border-amber-200 p-1 rounded">
                <input type="text" placeholder="Labor Fee" value={customServiceName} onChange={(e) => setCustomServiceName(e.target.value)} className="w-1/2 border rounded px-1 text-[9px]" />
                <input type="number" placeholder="₱" value={customServicePrice} onChange={(e) => setCustomServicePrice(e.target.value)} className="w-1/4 border rounded px-1 text-[9px]" />
                <button type="submit" className="w-1/4 bg-amber-600 text-white text-[9px] font-bold rounded">+ Add</button>
              </form>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchTerm(''); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border ${selectedCategory === cat && searchTerm === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards with In Stock / Low Stock / Out Status */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="bg-white p-2 rounded border shadow-sm hover:border-emerald-500 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 mb-0.5">
                      <span>{prod.code || 'ITEM'}</span>
                      {getStockBadge(prod.stock)}
                    </div>
                    <h3 className="font-bold text-[10px] text-slate-800 leading-tight line-clamp-2">{prod.name}</h3>
                    <p className="text-[8px] text-slate-400 mt-0.5">{prod.category}</p>
                  </div>
                  <div className="mt-1.5 flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-700">₱{prod.price.toFixed(2)}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded font-bold">+Add</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Current Order Cart Side Panel */}
          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow border border-slate-800 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-2">
            <div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <h2 className="text-[11px] font-bold text-emerald-400">🛒 Current Order</h2>
                <button onClick={() => setCart([])} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Clear</button>
              </div>

              {/* Items Listed */}
              <div className="mt-2 space-y-1 max-h-[38vh] overflow-y-auto pr-0.5">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <p className="text-xl mb-1">🛒</p>
                    <p className="text-[9px]">Cart is Empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-1.5 bg-slate-800 rounded border border-slate-700 text-[10px]">
                      <div className="flex justify-between">
                        <p className="font-bold text-[9px] text-slate-200 line-clamp-1">{item.name}</p>
                        <span className="font-bold text-emerald-400">₱{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[8px] text-slate-400">₱{item.price} each</p>
                        {item.type !== 'service' && (
                          <div className="flex items-center space-x-1">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-3.5 h-3.5 rounded bg-slate-700 font-bold text-[9px]">-</button>
                            <span className="text-[9px] font-bold text-white">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-3.5 h-3.5 rounded bg-slate-700 font-bold text-[9px]">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Complete Payment Inputs & Breakdown Section */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Discount (₱)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 rounded text-right px-1 text-white font-bold text-[10px]"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-black text-white pt-1 border-t border-slate-800">
                <span>TOTAL AMOUNT</span>
                <span className="text-sm text-emerald-400">₱{totalAmount.toFixed(2)}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Payment Method</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-white font-bold text-[9px]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount Tendered</span>
                  <input
                    type="number"
                    placeholder="₱0.00"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-20 bg-slate-800 border border-slate-700 rounded text-right px-1 py-0.5 text-emerald-400 font-bold text-[10px]"
                  />
                </div>

                <div className="flex justify-between items-center font-bold text-amber-400">
                  <span>Change</span>
                  <span>₱{change.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAndPrint}
                disabled={cart.length === 0}
                className={`w-full py-2 rounded font-bold text-xs text-white transition shadow ${
                  cart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                🖨 COMPLETE ORDER & PRINT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stocks & Sales Modal Features */}
      {activeTab === 'stocks' && (
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded shadow border">
            <h2 className="text-base font-bold">📦 Inventory List</h2>
            <button onClick={resetToDefaultItems} className="bg-slate-200 px-2 py-1 rounded font-bold text-xs">🔄 Load 10 Sample Items</button>
          </div>
        </div>
      )}
    </div>
  );
}
