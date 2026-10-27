import React, { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Yamalube 10W-40 4T (800ml)', category: 'Engine Oil', price: 250, stock: 18, unit: 'bottle' },
  { id: 2, name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 140, stock: 32, unit: 'pcs' },
  { id: 3, name: 'RCB Brake Pad S-Series (NMAX)', category: 'Brake System', price: 380, stock: 12, unit: 'set' },
  { id: 4, name: 'FDR Sport XR Evo 90/80-17', category: 'Tires', price: 1450, stock: 3, unit: 'pcs' },
  { id: 5, name: 'Drive Belt Click 125i (Honda)', category: 'Engine Parts', price: 650, stock: 2, unit: 'pcs' }
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

  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState('');

  const [newMechanicName, setNewMechanicName] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });

  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesDateFilter, setSalesDateFilter] = useState('today');

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
    const term = searchTerm.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    
    const matchesSearch =
      prod.name.toLowerCase().includes(term) ||
      prod.category.toLowerCase().includes(term);

    if (term !== '') {
      return matchesSearch;
    }
    return matchesCategory;
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 text-[11px]">
      <header className="bg-slate-900 text-white px-3 py-2 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold tracking-wider text-red-500">🔧 MOTOFIX</span>
          <span className="text-[9px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded">POS System</span>
        </div>
        <div className="flex space-x-1 mt-1 sm:mt-0 flex-wrap gap-y-1">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition ${activeTab === 'pos' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🛒 POS
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition ${activeTab === 'stocks' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            📦 Stocks ({products.filter((p) => p.stock < 5).length})
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition ${activeTab === 'mechanics' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            👨‍🔧 Mechanics
          </button>
          <button
            onClick={() => setShowSalesModal(true)}
            className="px-2 py-1 rounded text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
          >
            📊 Sales (₱{todayRevenue.toLocaleString()})
          </button>
        </div>
      </header>

      {/* Cashier Tab (Ultra-Slim Minimalist Grid) */}
      {activeTab === 'pos' && (
        <div className="p-2 grid grid-cols-1 lg:grid-cols-6 gap-2">
          {/* Main Products Area (5/6 Columns Width) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg shadow-sm">
              <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                <input
                  type="text"
                  placeholder="Labor/Serbisyo (e.g. Change Oil)"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="sm:col-span-1 border rounded px-2 py-0.5 text-[10px] bg-white"
                />
                <input
                  type="number"
                  placeholder="Presyo (₱)"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="border rounded px-2 py-0.5 text-[10px] bg-white"
                />
                <select
                  value={selectedMechanic}
                  onChange={(e) => setSelectedMechanic(e.target.value)}
                  className="border rounded px-2 py-0.5 text-[10px] bg-white font-semibold"
                >
                  {mechanics.map((m) => (
                    <option key={m} value={m}>Mekaniko: {m}</option>
                  ))}
                </select>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold py-0.5 px-2 rounded transition">
                  + Add Labor
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg shadow-sm">
              <input
                type="text"
                placeholder="Mag-search ng pyesa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded px-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchTerm('');
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
                    selectedCategory === cat && searchTerm === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow transition">
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[8px] uppercase font-bold text-slate-400 truncate">{prod.category}</span>
                      <span className={`text-[8px] px-1 rounded font-bold ${prod.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {prod.stock}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[10px] text-slate-800 line-clamp-2 leading-tight">{prod.name}</h3>
                  </div>
                  <div className="mt-1.5 flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-red-600">₱{prod.price}</span>
                    <button
                      onClick={() => addToCart(prod)}
                      disabled={prod.stock <= 0}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                        prod.stock > 0 ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {prod.stock > 0 ? '+Add' : 'Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micro Order Summary Side Box (1/6 Column Width) */}
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-2">
            <div>
              <div className="flex justify-between items-center pb-1 border-b">
                <h2 className="text-[11px] font-bold">🛒 Cart</h2>
                <span className="text-[9px] bg-slate-100 px-1 rounded-full font-bold">{cart.reduce((a, b) => a + b.qty, 0)}</span>
              </div>

              <div className="mt-1.5 space-y-1 max-h-[62vh] overflow-y-auto pr-0.5">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-xs">Empty Cart</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-1 bg-slate-50 rounded border text-[10px] space-y-0.5">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-[9px] line-clamp-1 flex-1 leading-tight">{item.name}</p>
                        <span className="text-[9px] font-bold text-slate-800 ml-1">₱{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        {item.type === 'service' ? (
                          <p className="text-[8px] text-amber-700 font-bold">👤 {item.mechanic}</p>
                        ) : (
                          <p className="text-[8px] text-slate-500">₱{item.price}</p>
                        )}
                        {item.type !== 'service' && (
                          <div className="flex items-center space-x-0.5">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-3.5 h-3.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-[9px] flex items-center justify-center">-</button>
                            <span className="text-[9px] font-bold w-2 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-3.5 h-3.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-[9px] flex items-center justify-center">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-1.5 border-t space-y-1">
              <div className="flex justify-between items-center text-[11px] font-black text-red-600">
                <span>TOTAL</span>
                <span className="text-xs">₱{totalAmount.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-1.5 rounded font-bold text-[10px] text-white transition shadow ${
                  cart.length > 0 ? 'bg-red-600 hover:bg-red-500 active:scale-95' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                PAY ₱
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
            <div>
              <h2 className="text-base font-bold">📦 Inventory & Stock List</h2>
              <p className="text-[10px] text-slate-500">Magdagdag, mag-edit, o magbura ng pyesa nang deretso sa screen.</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded text-xs transition shadow"
            >
              + Add Item
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600">
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Available Stock</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-semibold">{p.name}</td>
                      <td className="p-2 text-slate-500">{p.category}</td>
                      <td className="p-2 font-bold text-red-600">₱{p.price.toLocaleString()}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-1">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] hover:bg-amber-200"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded font-bold text-[10px] hover:bg-rose-200"
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
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
            <h2 className="text-base font-bold flex items-center gap-1">👨‍🔧 Mechanic Management & Earnings Tracker</h2>

            <form onSubmit={handleAddMechanic} className="flex gap-2 bg-slate-50 p-2 rounded border">
              <input
                type="text"
                placeholder="Pangalan ng bagong mekaniko..."
                value={newMechanicName}
                onChange={(e) => setNewMechanicName(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-xs bg-white"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1 rounded transition">
                + Add Mekaniko
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mechanicEarnings.map((mech) => (
                <div key={mech.name} className="border rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">👤 {mech.name}</h3>
                      <p className="text-[10px] text-slate-500">{mech.jobCount} Serbisyo Natapos</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-600">Kabuuang Labor</span>
                      <p className="text-lg font-black text-amber-600">₱{mech.totalLabor.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {mech.jobs.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">Wala pang naitalang labor ngayon.</p>
                    ) : (
                      mech.jobs.map((j, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] bg-white p-1.5 rounded border">
                          <span className="font-medium text-slate-700">{j.service} <span className="text-slate-400">({j.time})</span></span>
                          <span className="font-bold text-slate-800">₱{j.price.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMechanic(mech.name)}
                    className="text-[10px] font-bold text-rose-500 hover:underline pt-1 inline-block"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold">{editingProductId ? '✏ Edit Item / Stock' : '+ Add New Item'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-2">
              <div>
                <label className="font-bold text-slate-600 text-[10px]">Pangalan ng Item / Pyesa</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full border rounded p-1.5 text-xs mt-0.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 text-[10px]">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs mt-0.5"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 text-[10px]">Unit (e.g. pcs, bottle)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs mt-0.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 text-[10px]">Presyo (₱)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 text-[10px]">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs mt-0.5"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3 py-1 bg-slate-200 rounded text-xs font-bold"
                >
                  Kanselahin
                </button>
                <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-1.5">📊 Daily Sales Log & Reports</h3>
              <button onClick={() => setShowSalesModal(false)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg border">
                <span className="font-bold text-slate-700 text-[11px]">📅 Petsa:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSalesDateFilter('today')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${salesDateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Ngayong Araw
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('yesterday')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${salesDateFilter === 'yesterday' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Kahapon
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${salesDateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                  >
                    Lahat
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-[10px] uppercase text-emerald-600 font-bold">
                    Kabuuang Benta ({salesDateFilter === 'today' ? 'Ngayong Araw' : salesDateFilter === 'yesterday' ? 'Kahapon' : 'Lahat'})
                  </p>
                  <p className="text-2xl font-black text-emerald-700">₱{filteredTotalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Transaksyon</p>
                  <p className="text-base font-bold text-slate-700">{filteredSalesHistory.length} Orders</p>
                </div>
              </div>

              {filteredSalesHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <p>Walang naitalang benta.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSalesHistory.map((sale) => (
                    <div key={sale.id} className="border rounded-lg p-3 bg-slate-50 space-y-1">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="text-[10px] font-bold text-slate-500">🕒 {sale.date} - {sale.time}</span>
                        <span className="font-black text-red-600">Total: ₱{sale.total.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-0.5 text-[11px]">
                        {sale.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700">
                            <span>
                              • {item.name} x {item.qty}
                              {item.type === 'service' && <span className="text-[10px] text-amber-600 font-bold ml-1">({item.mechanic})</span>}
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

            <div className="p-3 bg-slate-100 border-t flex justify-between items-center">
              <button
                onClick={clearSalesHistory}
                className="px-3 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-xs font-bold transition"
              >
                🗑 Reset History
              </button>
              <div className="space-x-1.5">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold transition"
                >
                  🖨 Print
                </button>
                <button
                  onClick={() => setShowSalesModal(false)}
                  className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded text-xs font-bold transition"
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
