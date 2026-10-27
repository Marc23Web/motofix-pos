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
  { id: 10, code: 'ELE-002', name: 'Battery Motolite 12V 5Ah', category: 'Electrical', price: 980, stock: 5, unit: 'pcs' }
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
  const [prodForm, setProdForm] = useState({ code: '', name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });

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

  const resetToDefaultItems = () => {
    if (window.confirm('Gusto mo bang i-load ang kumpletong bagong listahan ng sample products?')) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('motofix_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  };

  const categories = ['All', 'Engine Oil', 'Tires & Tubes', 'Brake System', 'Drive System', 'Electrical', 'Accessories'];

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdForm({ code: `ITEM-${Date.now().toString().slice(-3)}`, name: '', category: 'Engine Oil', price: '', stock: '', unit: 'pcs' });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProductId(product.id);
    setProdForm({ code: product.code || '', name: product.name, category: product.category, price: product.price, stock: product.stock, unit: product.unit });
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
      (prod.code && prod.code.toLowerCase().includes(term)) ||
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
          <span className="text-base font-bold tracking-wider text-emerald-400">🔧 MotoFix <span className="bg-emerald-600 text-white text-[9px] px-1 py-0.2 rounded font-normal">POS</span></span>
          <span className="text-[9px] text-slate-400">Motorcycle Parts & Service</span>
        </div>
        <div className="flex space-x-1.5 mt-1 sm:mt-0 flex-wrap items-center">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${activeTab === 'pos' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🛒 POS Center
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${activeTab === 'stocks' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            📦 Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${activeTab === 'mechanics' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            👨‍🔧 Mechanics
          </button>
          <button
            onClick={() => setShowSalesModal(true)}
            className="px-2 py-1 rounded text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow"
          >
            📊 Sales Report
          </button>
        </div>
      </header>

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-3 space-y-2">
            {/* Top Controls: Search & Service */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <div className="sm:col-span-2 flex items-center bg-white border rounded px-2 py-1 shadow-sm">
                <span className="mr-1 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search item name, code, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-[10px] outline-none bg-transparent"
                />
              </div>
              <form onSubmit={handleAddService} className="flex gap-1 bg-amber-50 border border-amber-200 p-1 rounded">
                <input
                  type="text"
                  placeholder="Labor"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="w-1/2 border rounded px-1 text-[9px] bg-white"
                />
                <input
                  type="number"
                  placeholder="₱"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="w-1/4 border rounded px-1 text-[9px] bg-white"
                />
                <button type="submit" className="w-1/4 bg-amber-600 text-white text-[9px] font-bold rounded">
                  +Labor
                </button>
              </form>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchTerm('');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition ${
                    selectedCategory === cat && searchTerm === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="bg-white p-2 rounded border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-0.5">
                      <span>{prod.code || 'ITEM'}</span>
                      <span className={`px-1 rounded ${prod.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {prod.stock} left
                      </span>
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

          {/* Right Order Summary Cart Side Box */}
          <div className="bg-slate-900 text-white p-2 rounded-lg shadow border border-slate-800 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-2">
            <div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <h2 className="text-[11px] font-bold flex items-center gap-1 text-emerald-400">🛒 Current Order</h2>
                <button onClick={() => setCart([])} className="text-[9px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Clear</button>
              </div>

              <div className="mt-2 space-y-1 max-h-[58vh] overflow-y-auto pr-0.5">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <p className="text-2xl mb-1">🛒</p>
                    <p className="text-[9px]">Cart is Empty</p>
                    <p className="text-[8px]">Click item cards or add labor fees</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-1.5 bg-slate-800/80 rounded border border-slate-700 text-[10px] space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-[9px] text-slate-200 line-clamp-1 flex-1">{item.name}</p>
                        <span className="text-[9px] font-bold text-emerald-400 ml-1">₱{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        {item.type === 'service' ? (
                          <p className="text-[8px] text-amber-400 font-bold">👤 {item.mechanic}</p>
                        ) : (
                          <p className="text-[8px] text-slate-400">₱{item.price}</p>
                        )}
                        {item.type !== 'service' && (
                          <div className="flex items-center space-x-1">
                            <button onClick={() => updateCartQty(item.id, -1)} className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 font-bold text-[9px] flex items-center justify-center">-</button>
                            <span className="text-[9px] font-bold text-white">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} className="w-3.5 h-3.5 rounded bg-slate-700 hover:bg-slate-600 font-bold text-[9px] flex items-center justify-center">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Subtotal</span>
                <span>₱{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black text-white">
                <span>TOTAL</span>
                <span className="text-sm text-emerald-400">₱{totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-2 rounded font-bold text-xs text-white transition shadow ${
                  cart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                PAY ₱{totalAmount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
            <div>
              <h2 className="text-base font-bold">📦 Inventory Management</h2>
              <p className="text-[10px] text-slate-500">Magdagdag, mag-edit, o mag-reset ng sample products list.</p>
            </div>
            <div className="space-x-1">
              <button
                onClick={resetToDefaultItems}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded text-xs transition"
              >
                🔄 Reset 10 Sample Items
              </button>
              <button
                onClick={handleOpenAddProduct}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-xs transition shadow"
              >
                + Add New Item
              </button>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600">
                    <th className="p-2">Code</th>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-400">{p.code || 'ITEM'}</td>
                      <td className="p-2 font-semibold">{p.name}</td>
                      <td className="p-2 text-slate-500">{p.category}</td>
                      <td className="p-2 font-bold text-emerald-700">₱{p.price.toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-1">
                        <button onClick={() => handleOpenEditProduct(p)} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">✏ Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id, p.name)} className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded font-bold text-[10px]">🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mechanics Tab */}
      {activeTab === 'mechanics' && (
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
            <h2 className="text-base font-bold flex items-center gap-1">👨‍🔧 Mechanics Management</h2>
            <form onSubmit={handleAddMechanic} className="flex gap-2 bg-slate-50 p-2 rounded border">
              <input
                type="text"
                placeholder="Name of mechanic..."
                value={newMechanicName}
                onChange={(e) => setNewMechanicName(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-xs bg-white"
              />
              <button type="submit" className="bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded">
                + Add Mechanic
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mechanicEarnings.map((mech) => (
                <div key={mech.name} className="border rounded-lg p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">👤 {mech.name}</h3>
                      <p className="text-[10px] text-slate-500">{mech.jobCount} Jobs Completed</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-600">Total Earnings</span>
                      <p className="text-lg font-black text-amber-600">₱{mech.totalLabor.toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMechanic(mech.name)} className="text-[10px] font-bold text-rose-500 hover:underline">🗑 Remove Mechanic</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold">{editingProductId ? '✏ Edit Item' : '+ Add Item'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-2">
              <div>
                <label className="font-bold text-[10px]">Item Code</label>
                <input
                  type="text"
                  value={prodForm.code}
                  onChange={(e) => setProdForm({ ...prodForm, code: e.target.value })}
                  className="w-full border rounded p-1 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="font-bold text-[10px]">Item Name</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full border rounded p-1 text-xs mt-0.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[10px]">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full border rounded p-1 text-xs mt-0.5"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[10px]">Price (₱)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full border rounded p-1 text-xs mt-0.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[10px]">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full border rounded p-1 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[10px]">Unit</label>
                  <input
                    type="text"
                    required
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full border rounded p-1 text-xs mt-0.5"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-3 py-1 bg-slate-200 rounded text-xs font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
              <h3 className="text-sm font-bold">📊 Sales History & Reports</h3>
              <button onClick={() => setShowSalesModal(false)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded border border-emerald-200">
                <div>
                  <p className="text-[10px] uppercase text-emerald-600 font-bold">Total Sales</p>
                  <p className="text-2xl font-black text-emerald-700">₱{filteredTotalRevenue.toFixed(2)}</p>
                </div>
                <button onClick={clearSalesHistory} className="px-2 py-1 bg-rose-100 text-rose-700 rounded font-bold text-[10px]">Clear History</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
