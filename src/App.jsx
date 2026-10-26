import React, { useState, useEffect } from 'react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Yamalube 10W-40 4T (800ml)', category: 'Engine Oil', price: 250, stock: 18, unit: 'bottle' },
  { id: 2, name: 'Motul 7100 10W-40 1L', category: 'Engine Oil', price: 580, stock: 4, unit: 'bottle' },
  { id: 3, name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 140, stock: 32, unit: 'pcs' },
  { id: 4, name: 'FDR Sport XR Evo 90/80-17', category: 'Tires', price: 1450, stock: 3, unit: 'pcs' },
  { id: 5, name: 'RCB Brake Pad S-Series (NMAX)', category: 'Brake System', price: 380, stock: 12, unit: 'set' },
  { id: 6, name: 'Drive Belt Click 125i (Honda)', category: 'Engine Parts', price: 650, stock: 2, unit: 'pcs' },
  { id: 7, name: 'Osram LED Headlight Bulb T19', category: 'Electrical', price: 320, stock: 15, unit: 'pcs' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Sales History State na nakakabit sa LocalStorage
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSalesModal, setShowSalesModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('motofix_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  // Categories
  const categories = ['All', 'Engine Oil', 'Electrical', 'Tires', 'Brake System', 'Engine Parts'];

  // Cart Functions
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Out of stock na ang item na ito!');
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert('Naabot na ang maximum available stock!');
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Checkout Function
  const handleCheckout = () => {
    if (cart.length === 0) return alert('Walang laman ang cart!');

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-PH'),
      time: new Date().toLocaleTimeString('en-PH'),
      items: [...cart],
      total: totalAmount
    };

    // Bawasan ang stock ng mga nabentang produkto
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
    setCart([]);
    alert(`Checkout Successful! Total: ₱${totalAmount.toLocaleString()}`);
  };

  const clearSalesHistory = () => {
    if (window.confirm('Sigurado ka bang gusto mong i-reset ang Daily Sales History?')) {
      setSalesHistory([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtering Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalDailyRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold tracking-wider text-red-500">🔧 MOTOFIX PARTS & SERBISYO</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Inventory & Cashier POS Tool</span>
        </div>
        <div className="flex space-x-3 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pos' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🛒 Cashier / POS
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'stocks' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            📦 Stocks & Prices ({products.filter(p => p.stock < 5).length})
          </button>
          <button
            onClick={() => setShowSalesModal(true)}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
          >
            📊 Daily Sales (₱{totalDailyRevenue.toLocaleString()})
          </button>
        </div>
      </header>

      {/* Main Container */}
      {activeTab === 'pos' ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Catalog */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Mag-search ng pyesa o gamit (e.g. Yamalube, Spark plug)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{prod.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${prod.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {prod.stock} {prod.unit}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{prod.name}</h3>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-red-600">₱{prod.price.toLocaleString()}</span>
                    <button
                      onClick={() => addToCart(prod)}
                      disabled={prod.stock <= 0}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                        prod.stock > 0 ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {prod.stock > 0 ? 'Add +' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Cart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-[calc(100vh-140px)] sticky top-6">
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">🛒 Current Order</h2>
                <span className="text-sm bg-slate-100 px-3 py-1 rounded-full font-bold">{cart.reduce((a, b) => a + b.qty, 0)} items</span>
              </div>

              {/* Cart Items List */}
              <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-2">🛒</p>
                    <p>Walang laman ang cart.</p>
                    <p className="text-xs">Pumili ng item sa kaliwa para magdagdag.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500">₱{item.price} x {item.qty}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold">-</button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold">+</button>
                        <span className="text-sm font-bold text-slate-800 ml-2">₱{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total & Checkout */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold">₱{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black text-red-600">
                <span>TOTAL AMOUNT</span>
                <span>₱{totalAmount.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white transition shadow-lg ${
                  cart.length > 0 ? 'bg-red-600 hover:bg-red-500 active:scale-95' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                ₱ MAG-BAYAD (CHECKOUT)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Stocks & Prices Management View */
        <div className="p-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">📦 Inventory & Stock List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600 text-sm">
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3 text-sm text-slate-500">{p.category}</td>
                      <td className="p-3 font-bold text-red-600">₱{p.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales History Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">📊 Daily Sales Log & Reports</h3>
              <button onClick={() => setShowSalesModal(false)} className="text-slate-400 hover:text-white font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div>
                  <p className="text-xs uppercase text-emerald-600 font-bold">Kabuuang Benta (Total Revenue)</p>
                  <p className="text-3xl font-black text-emerald-700">₱{totalDailyRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Kabuuang Transaksyon</p>
                  <p className="text-xl font-bold text-slate-700">{salesHistory.length} Orders</p>
                </div>
              </div>

              {salesHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Wala pang nabebenta ngayong araw.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesHistory.map((sale) => (
                    <div key={sale.id} className="border rounded-xl p-4 bg-slate-50 space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-xs font-bold text-slate-500">🕒 {sale.date} - {sale.time}</span>
                        <span className="font-black text-red-600">Total: ₱{sale.total.toLocaleString()}</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {sale.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700">
                            <span>• {item.name} x {item.qty}</span>
                            <span className="font-semibold">₱{(item.price * item.qty).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-100 border-t flex justify-between items-center">
              <button
                onClick={clearSalesHistory}
                className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-bold transition"
              >
                🗑 Reset Sales Today
              </button>
              <div className="space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition"
                >
                  🖨 Print Summary
                </button>
                <button
                  onClick={() => setShowSalesModal(false)}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg text-sm font-bold transition"
                >
                  Isara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
