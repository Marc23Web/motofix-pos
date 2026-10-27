import React, { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Yamalube 10W-40 4T (800ml)', category: 'Engine Oil', price: 250, stock: 18, unit: 'bottle' },
  { id: 2, name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 140, stock: 32, unit: 'pcs' },
  { id: 3, name: 'RCB Brake Pad S-Series (NMAX)', category: 'Brake System', price: 380, stock: 12, unit: 'set' }
];

const DEFAULT_MECHANICS = ['Juan', 'Pedro', 'Cardo', 'Talyer Shop / House'];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');

  // Dynamic Products State with LocalStorage
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('motofix_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  // Dynamic Mechanics State with LocalStorage
  const [mechanics, setMechanics] = useState(() => {
    const saved = localStorage.getItem('motofix_mechanics');
    return saved ? JSON.parse(saved) : DEFAULT_MECHANICS;
  });

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Custom Service Input State
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState('');

  // New Mechanic Form State
  const [newMechanicName, setNewMechanicName] = useState('');

  // Product Add/Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });

  // Sales History State with LocalStorage
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesDateFilter, setSalesDateFilter] = useState('today');

  // Sync to LocalStorage
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

  const categories = ['All', 'Engine Oil', 'Electrical', 'Tires', 'Brake System', 'Engine Parts', 'Maintenance'];

  // Add / Edit Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdForm({ name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProductId(product.id);
    setProdForm({ name: product.name, category: product.category, price: product.price, stock: product.stock, unit: product.unit });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.stock) return alert('Paki-kumpleto ang mga detalye!');

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProductId ? { ...p, ...prodForm, price: Number(prodForm.price), stock: Number(prodForm.stock) } : p))
      );
    } else {
      const newProd = {
        id: Date.now(),
        ...prodForm,
        price: Number(prodForm.price),
        stock: Number(prodForm.stock)
      };
      setProducts((prev) => [newProd, ...prev]);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Sigurado ka bang gusto mong burahin ang "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Add / Delete Mechanic Handlers
  const handleAddMechanic = (e) => {
    e.preventDefault();
    if (!newMechanicName.trim()) return alert('Paki-lagay ang pangalan ng mekaniko!');
    if (mechanics.includes(newMechanicName.trim())) return alert('Nakalista na ang mekanikong ito!');

    setMechanics((prev) => [...prev, newMechanicName.trim()]);
    setNewMechanicName('');
  };

  const handleDeleteMechanic = (mechName) => {
    if (window.confirm(`Sigurado ka bang gusto mong tanggalin si "${mechName}"?`)) {
      setMechanics((prev) => prev.filter((m) => m !== mechName));
    }
  };

  // Cart & POS Handlers
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
      return alert('Paki-lagay ang tamang detalye at halaga ng serbisyo!');
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

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return alert('Walang laman ang cart!');

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-PH'),
      time: new Date().toLocaleTimeString('en-PH'),
      items: [...cart],
      total: totalAmount
    };

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
    if (window.confirm('Sigurado ka bang gusto mong i-reset ang LAHAT ng Sales History? Hindi na ito mababawi.')) {
      setSalesHistory([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const todayStr = new Date().toLocaleDateString('en-PH');
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toLocaleDateString('en-PH');

  const filteredSalesHistory = salesHistory.filter((sale) => {
    if (salesDateFilter === 'today') return sale.date === todayStr;
    if (salesDateFilter === 'yesterday') return sale.date === yesterdayStr;
    return true;
  });

  const todayRevenue = salesHistory.filter((s) => s.date === todayStr).reduce((sum, s) => sum + s.total, 0);
  const filteredTotalRevenue = filteredSalesHistory.reduce((sum, sale) => sum + sale.total, 0);

  const mechanicEarnings = mechanics.map((mech) => {
    let totalLabor = 0;
    let jobCount = 0;
    const jobs = [];

    salesHistory.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === 'service' && item.mechanic === mech) {
          totalLabor += item.price * item.qty;
          jobCount += item.qty;
          jobs.push({ time: sale.time, date: sale.date, service: item.name, price: item.price });
        }
      });
    });

    return { name: mech, totalLabor, jobCount, jobs };
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold tracking-wider text-red-500">🔧 MOTOFIX PARTS & SERBISYO</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Inventory & POS System</span>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0 flex-wrap gap-y-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'pos' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🛒 Cashier / POS
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'stocks' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            📦 Stocks & Prices ({products.filter((p) => p.stock < 5).length})
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'mechanics' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            👨‍🔧 Mechanic Jobs
          </button>
          <button
            onClick={() => setShowSalesModal(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
          >
            📊 Daily Sales (Today: ₱{todayRevenue.toLocaleString()})
          </button>
        </div>
      </header>

      {/* Cashier Tab */}
      {activeTab === 'pos' && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">👨‍🔧 + Add Labor / Serbisyo Fee</h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Uri ng Trabaho (e.g. Change Oil)"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="sm:col-span-1 border rounded-lg px-3 py-1.5 text-sm bg-white"
                />
                <input
                  type="number"
                  placeholder="Presyo (₱)"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm bg-white"
                />
                <select
                  value={selectedMechanic}
                  onChange={(e) => setSelectedMechanic(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm bg-white font-semibold"
                >
                  {mechanics.map((m) => (
                    <option key={m} value={m}>Mekaniko: {m}</option>
                  ))}
                </select>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition">
                  + Add Labor
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
              <input
                type="text"
                placeholder="Mag-search ng pyesa o gamit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-[calc(100vh-140px)] sticky top-6">
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">🛒 Current Order</h2>
                <span className="text-sm bg-slate-100 px-3 py-1 rounded-full font-bold">{cart.reduce((a, b) => a + b.qty, 0)} items</span>
              </div>

              <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-2">🛒</p>
                    <p>Walang laman ang cart.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                        {item.type === 'service' ? (
                          <p className="text-xs text-amber-700 font-bold">👤 Mekaniko: {item.mechanic}</p>
                        ) : (
                          <p className="text-xs text-slate-500">₱{item.price} x {item.qty}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.type !== 'service' && (
                          <>
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold">-</button>
                            <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold">+</button>
                          </>
                        )}
                        <span className="text-sm font-bold text-slate-800 ml-2">₱{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
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
      )}

      {/* Dynamic Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
            <div>
              <h2 className="text-2xl font-bold">📦 Inventory & Stock List</h2>
              <p className="text-xs text-slate-500">Magdagdag, mag-edit, o magbura ng pyesa nang deretso sa screen.</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl transition text-sm shadow"
            >
              + Magdagdag ng Bagong Item
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600 text-sm">
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3 text-center">Actions</th>
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
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs hover:bg-amber-200"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="px-2 py-1 bg-rose-100 text-rose-700 rounded font-bold text-xs hover:bg-rose-200"
                        >
                          🗑 Bura
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Mechanics Tab */}
      {activeTab === 'mechanics' && (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">👨‍🔧 Mechanic Management & Earnings Tracker</h2>

            {/* Add Mechanic Form */}
            <form onSubmit={handleAddMechanic} className="flex gap-2 bg-slate-50 p-3 rounded-xl border">
              <input
                type="text"
                placeholder="Pangalan ng bagong mekaniko (e.g. Cardo)..."
                value={newMechanicName}
                onChange={(e) => setNewMechanicName(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-4 py-1.5 rounded-lg transition">
                + Add Mekaniko
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mechanicEarnings.map((mech) => (
                <div key={mech.name} className="border rounded-xl p-5 bg-slate-50 space-y-3 relative">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">👤 {mech.name}</h3>
                      <p className="text-xs text-slate-500">{mech.jobCount} Serbisyo / Trabaho Natapos</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase font-bold text-amber-600">Kabuuang Labor</span>
                      <p className="text-2xl font-black text-amber-600">₱{mech.totalLabor.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {mech.jobs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Wala pang naitalang labor ngayon.</p>
                    ) : (
                      mech.jobs.map((j, idx) => (
                        <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border">
                          <span className="font-medium text-slate-700">{j.service} <span className="text-slate-400">({j.time})</span></span>
                          <span className="font-bold text-slate-800">₱{j.price.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMechanic(mech.name)}
                    className="text-xs font-bold text-rose-500 hover:underline pt-2 inline-block"
                  >
                    🗑 Tanggalin itong Mekaniko
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-xl font-bold">{editingProductId ? '✏ Edit Item / Stock' : '+ Magdagdag ng Bagong Item'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Pangalan ng Item / Pyesa</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm mt-1"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Unit (e.g. pcs, bottle)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600">Presyo (₱)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-bold"
                >
                  Kanselahin
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
                  I-Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">📊 Daily Sales Log & Reports</h3>
              <button onClick={() => setShowSalesModal(false)} className="text-slate-400 hover:text-white font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border">
                <span className="text-sm font-bold text-slate-700">📅 Pumili ng Petsa:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSalesDateFilter('today')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${salesDateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Ngayong Araw
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('yesterday')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${salesDateFilter === 'yesterday' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Kahapon
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${salesDateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Lahat (All Time)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div>
                  <p className="text-xs uppercase text-emerald-600 font-bold">
                    Kabuuang Benta ({salesDateFilter === 'today' ? 'Ngayong Araw' : salesDateFilter === 'yesterday' ? 'Kahapon' : 'Lahat'})
                  </p>
                  <p className="text-3xl font-black text-emerald-700">₱{filteredTotalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Kabuuang Transaksyon</p>
                  <p className="text-xl font-bold text-slate-700">{filteredSalesHistory.length} Orders</p>
                </div>
              </div>

              {filteredSalesHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Walang naitalang benta para sa napiling filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSalesHistory.map((sale) => (
                    <div key={sale.id} className="border rounded-xl p-4 bg-slate-50 space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-xs font-bold text-slate-500">🕒 {sale.date} - {sale.time}</span>
                        <span className="font-black text-red-600">Total: ₱{sale.total.toLocaleString()}</span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {sale.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700">
                            <span>
                              • {item.name} x {item.qty}
                              {item.type === 'service' && <span className="text-xs text-amber-600 font-bold ml-1">({item.mechanic})</span>}
                            </span>
                            <span className="font-semibold">₱{(item.price * item.qty).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t flex justify-between items-center">
              <button
                onClick={clearSalesHistory}
                className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-bold transition"
              >
                🗑 Reset All History
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
