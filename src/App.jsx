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

const INITIAL_MECHANICS = ['Juan', 'Pedro', 'Cardo', 'Talyer Shop / House'];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Custom Service Input State
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState('Juan');

  // Sales History State na nakakabit sa LocalStorage
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSalesModal, setShowSalesModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('motofix_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const categories = ['All', 'Engine Oil', 'Electrical', 'Tires', 'Brake System', 'Engine Parts'];

  // Add Product to Cart
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
      return [...prev, { ...product, qty: 1, type: 'part' }];
    });
  };

  // Add Labor/Service to Cart
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
      mechanic: selectedMechanic
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
            if (item.type === 'service') return item; // Fixed 1 qty for services
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

    // Bawasan ang stock ng mga nabentang pyesa
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

  // Mechanic Performance Calculation
  const mechanicEarnings = INITIAL_MECHANICS.map((mech) => {
    let totalLabor = 0;
    let jobCount = 0;
    const jobs = [];

    salesHistory.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === 'service' && item.mechanic === mech) {
          totalLabor += item.price * item.qty;
          jobCount += item.qty;
          jobs.push({
            time: sale.time,
            date: sale.date,
            service: item.name,
            price: item.price
          });
        }
      });
    });

    return { name: mech, totalLabor, jobCount, jobs };
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Header Bar */}
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
            📦 Stocks & Prices ({products.filter(p => p.stock < 5).length})
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
            📊 Daily Sales (₱{totalDailyRevenue.toLocaleString()})
          </button>
        </div>
      </header>

      {/* Main Container */}
      {activeTab === 'pos' && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Catalog & Add Service Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Service / Labor Form */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">👨‍🔧 + Add Labor / Serbisyo Fee</h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Uri ng Trabaho (e.g. Change Oil, Tune Up)"
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
                  {INITIAL_MECHANICS.map((m) => (
                    <option key={m} value={m}>Mekaniko: {m}</option>
                  ))}
                </select>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition">
                  + Add Labor
                </button>
              </form>
            </div>

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
                      <span className
