import React, { useState, useEffect } from 'react';

const DEFAULT_USERS = [
  { id: 1, name: 'Owner (Master)', role: 'admin', pin: '1234' },
  { id: 2, name: 'Cashier 1', role: 'cashier', pin: '0000' }
];

const MASTER_RECOVERY_CODE = 'MOTOFIX-ADMIN'; // Secret Key para sa Forgot PIN Reset

const DEFAULT_PRODUCTS = [
  { id: 1, code: 'OIL-001', name: 'Yamalube AT 10W-40 (800ml)', category: 'Engine Oil', price: 280, salePrice: 0, stock: 24, unit: 'pcs' },
  { id: 2, code: 'OIL-002', name: 'Shell Advance AX7 10W-40 (1L)', category: 'Engine Oil', price: 340, salePrice: 0, stock: 15, unit: 'pcs' },
  { id: 3, code: 'BRK-001', name: 'Nissin Front Brake Pad (Mio/Beat)', category: 'Brake System', price: 180, salePrice: 150, stock: 8, unit: 'set' },
  { id: 4, code: 'BRK-002', name: 'Brake Shoe Rear (Wave/TMX)', category: 'Brake System', price: 140, salePrice: 0, stock: 3, unit: 'set' },
  { id: 5, code: 'TIR-001', name: 'IRC Tire 80/90 x 14 Tubeless', category: 'Tires & Tubes', price: 850, salePrice: 790, stock: 6, unit: 'pcs' },
  { id: 6, code: 'TIR-002', name: 'FDR Sport XR 90/80 x 17', category: 'Tires & Tubes', price: 1250, salePrice: 0, stock: 4, unit: 'pcs' },
  { id: 7, code: 'DRV-001', name: 'Drive Belt Gates Powerlink Mio', category: 'Drive System', price: 450, salePrice: 0, stock: 10, unit: 'pcs' },
  { id: 8, code: 'DRV-002', name: 'Flyball Roller Set 12g', category: 'Drive System', price: 220, salePrice: 190, stock: 18, unit: 'set' },
  { id: 9, code: 'ELE-001', name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 130, salePrice: 0, stock: 30, unit: 'pcs' },
  { id: 10, code: 'ELE-002', name: 'Battery Motolite 12V 5Ah', category: 'Electrical', price: 980, salePrice: 0, stock: 0, unit: 'pcs' }
];

const DEFAULT_MECHANICS = ['Juan', 'Pedro', 'Cardo', 'Talyer Shop / House'];

export default function App() {
  // User Authentication State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('motofix_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('motofix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginPin, setLoginPin] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');

  // Forgot PIN Reset Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  // Edit Profile Modal State (Name & PIN for Logged-in User)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [changeNewPinInput, setChangeNewPinInput] = useState('');

  // User Management Form (Admin Only)
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('cashier');
  const [newUserPin, setNewUserPin] = useState('');

  // Main App Navigation
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
  const [referenceNo, setReferenceNo] = useState('');
  const [amountTendered, setAmountTendered] = useState('');

  // Mechanic Add State
  const [newMechanicName, setNewMechanicName] = useState('');

  // Inventory Management State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({ code: '', name: '', category: 'Engine Oil', price: '', salePrice: '', stock: '', unit: 'pcs' });

  // Sales History State
  const [salesHistory, setSalesHistory] = useState(() => {
    const saved = localStorage.getItem('motofix_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesDateFilter, setSalesDateFilter] = useState('today');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('motofix_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('motofix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('motofix_current_user');
    }
  }, [currentUser]);

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

  const categories = ['All', '🔥 On Sale', 'Engine Oil', 'Tires & Tubes', 'Brake System', 'Drive System', 'Electrical', 'Accessories'];

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === Number(selectedUserId));
    if (!targetUser) return alert('Pumili ng account!');

    if (targetUser.pin === loginPin.trim()) {
      setCurrentUser(targetUser);
      setLoginPin('');
      setActiveTab('pos');
    } else {
      alert('Maling PIN Code!');
    }
  };

  const handleForgotPinReset = (e) => {
    e.preventDefault();
    if (recoveryInput.trim() !== MASTER_RECOVERY_CODE) {
      return alert('Maling Master Recovery Code!');
    }

    if (!newPinInput.trim()) {
      return alert('Paki-lagay ang bagong PIN Code!');
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === Number(selectedUserId) ? { ...u, pin: newPinInput.trim() } : u))
    );

    alert('Matagumpay na pinalitan ang iyong PIN Code! Pwede ka nang mag-login.');
    setShowForgotModal(false);
    setRecoveryInput('');
    setNewPinInput('');
  };

  const handleOpenEditProfile = () => {
    setEditNameInput(currentUser?.name || '');
    setOldPinInput('');
    setChangeNewPinInput('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editNameInput.trim()) {
      return alert('Paki-lagay ang iyong pangalan!');
    }

    if (oldPinInput.trim() !== currentUser.pin) {
      return alert('Maling kasalukuyang PIN Code!');
    }

    const updatedPin = changeNewPinInput.trim() ? changeNewPinInput.trim() : currentUser.pin;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, name: editNameInput.trim(), pin: updatedPin } : u))
    );

    setCurrentUser((prev) => ({ ...prev, name: editNameInput.trim(), pin: updatedPin }));

    alert('Matagumpay na na-update ang iyong Profile details!');
    setShowEditProfileModal(false);
    setOldPinInput('');
    setChangeNewPinInput('');
  };

  const handleResetUserToDefault = (userId, userName) => {
    if (window.confirm(`I-reset ang PIN Code ni ${userName} sa default ("0000")?`)) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, pin: '0000' } : u))
      );
      alert(`Ang PIN Code ni ${userName} ay na-reset na sa "0000". Pwede na niya itong baguhin pagka-login.`);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Gusto mo bang mag-log out?')) {
      setCurrentUser(null);
      setLoginPin('');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPin.trim()) return alert('Kumpletuhin ang mga detalye!');

    const newUser = {
      id: Date.now(),
      name: newUserName.trim(),
      role: newUserRole,
      pin: newUserPin.trim()
    };

    setUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserPin('');
    alert(`Account for ${newUser.name} created successfully!`);
  };

  const handleDeleteUser = (id, name) => {
    if (id === currentUser?.id) return alert('Hindi mo pwedeng burahin ang sarili mong account habang nakalog-in!');
    if (window.confirm(`Burahin ang account ni ${name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const resetToDefaultItems = () => {
    if (window.confirm('I-load ang kumpletong bagong listahan ng sample products?')) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('motofix_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdForm({ code: `ITEM-${Date.now().toString().slice(-3)}`, name: '', category: 'Engine Oil', price: '', salePrice: '', stock: '', unit: 'pcs' });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProductId(product.id);
    setProdForm({
      code: product.code || '',
      name: product.name,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice || '',
      stock: product.stock,
      unit: product.unit
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.stock) return alert('Paki-kumpleto ang mga detalye!');

    const parsedPrice = Number(prodForm.price);
    const parsedSalePrice = Number(prodForm.salePrice) || 0;

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? { ...p, ...prodForm, price: parsedPrice, salePrice: parsedSalePrice, stock: Number(prodForm.stock) }
            : p
        )
      );
    } else {
      const newProd = {
        id: Date.now(),
        ...prodForm,
        price: parsedPrice,
        salePrice: parsedSalePrice,
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

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Out of stock na ang item na ito!');
    
    // Determine effective selling price (Sale Price if valid, otherwise Regular Price)
    const effectivePrice = (product.salePrice && Number(product.salePrice) > 0 && Number(product.salePrice) < product.price)
      ? Number(product.salePrice)
      : product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert('Naabot na ang maximum available stock!');
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, price: effectivePrice, originalPrice: product.price, qty: 1, type: 'part' }];
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

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalAmount = Math.max(0, subtotal - Number(discount));
  const tenderedNum = Number(amountTendered) || 0;
  const change = Math.max(0, tenderedNum - totalAmount);

  const handleCheckoutOnly = () => {
    if (cart.length === 0) return alert('Walang laman ang cart!');
    if (paymentMethod === 'Cash' && tenderedNum < totalAmount) {
      return alert('Kulang ang ibinayad na pera (Amount Tendered)!');
    }

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-PH'),
      time: new Date().toLocaleTimeString('en-PH'),
      cashier: currentUser?.name || 'Unknown',
      items: [...cart],
      subtotal,
      discount: Number(discount),
      total: totalAmount,
      paymentMethod,
      referenceNo: paymentMethod !== 'Cash' ? referenceNo : '',
      amountTendered: paymentMethod === 'Cash' ? tenderedNum : totalAmount,
      change: paymentMethod === 'Cash' ? change : 0
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

    let msg = `Checkout Complete!\nCashier: ${newSale.cashier}\nTotal: ₱${totalAmount.toLocaleString()}`;
    if (paymentMethod !== 'Cash' && referenceNo) {
      msg += `\nPayment: ${paymentMethod} (Ref: ${referenceNo})`;
    } else {
      msg += `\nSukli: ₱${change.toLocaleString()}`;
    }
    alert(msg);

    // Reset Cart & Payment Form
    setCart([]);
    setDiscount(0);
    setAmountTendered('');
    setReferenceNo('');
  };

  const clearSalesHistory = () => {
    if (window.confirm('Sigurado ka bang gusto mong i-reset ang LAHAT ng Sales History? Hindi na ito mababawi.')) {
      setSalesHistory([]);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase().trim();
    const isSale = prod.salePrice && Number(prod.salePrice) > 0 && Number(prod.salePrice) < prod.price;

    let matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    if (selectedCategory === '🔥 On Sale') {
      matchesCategory = isSale;
    }

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
  const filteredTotalRevenue = filteredSalesHistory.reduce((sum, s) => sum + s.total, 0);

  const mechanicEarnings = mechanics.map((mech) => {
    let totalLabor = 0;
    let jobCount = 0;
    salesHistory.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === 'service' && item.mechanic === mech) {
          totalLabor += item.price * item.qty;
          jobCount += item.qty;
        }
      });
    });
    return { name: mech, totalLabor, jobCount };
  });

  // 1. SECURE LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center p-3 font-sans text-xs">
        <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-5 space-y-4 text-slate-800">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-red-600 tracking-wider">🔧 MotoFix POS</h1>
            <p className="text-[10px] text-slate-500">Pumili ng Account at i-enter ang PIN Code</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="font-bold text-[10px] text-slate-600">Account / Staff</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border rounded p-2 mt-0.5 font-bold text-xs bg-slate-50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="font-bold text-[10px] text-slate-600">PIN Code</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[9px] text-red-600 font-bold hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Enter PIN Code"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full border rounded p-2 mt-0.5 text-center font-bold text-base tracking-widest bg-slate-50"
              />
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded shadow transition">
              LOG IN 🔑
            </button>
          </form>
        </div>

        {/* FORGOT PIN RESET MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-3">
            <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-4 space-y-3 text-slate-800">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-xs text-red-600">🔑 Reset Account PIN</h3>
                <button onClick={() => setShowForgotModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleForgotPinReset} className="space-y-2.5">
                <div>
                  <label className="font-bold text-[10px]">Master Recovery Code</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Secret Key"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    className="w-full border rounded p-1.5 text-xs mt-0.5"
                  />
                </div>

                <div>
                  <label className="font-bold text-[10px]">New 4-Digit PIN</label>
                  <input
                    type="password"
                    required
                    placeholder="Bagong PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full border rounded p-1.5 text-xs mt-0.5 font-bold text-center"
                  />
                </div>

                <div className="flex justify-end gap-1.5 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1 bg-slate-200 rounded text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
                  >
                    Reset PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. MAIN APP DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 text-[11px]">
      {/* Header Bar */}
      <header className="bg-slate-900 text-white px-3 py-2 flex flex-wrap justify-between items-center shadow gap-y-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="text-base font-bold text-red-500">🔧 MotoFix POS</span>
          <span className="text-[9px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 border border-slate-700">
            👤 {currentUser.name} ({currentUser.role})
          </span>
          <button
            onClick={handleOpenEditProfile}
            className="text-[9px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded font-bold transition shadow"
          >
            ✏️ Edit My Name & PIN
          </button>
        </div>

        <div className="flex space-x-1 items-center flex-wrap gap-y-1">
          <button onClick={() => setActiveTab('pos')} className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'pos' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>🛒 POS Center</button>

          {/* Master Admin Only Tabs */}
          {currentUser.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('stocks')} className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'stocks' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>📦 Inventory ({products.length})</button>
              <button onClick={() => setActiveTab('mechanics')} className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'mechanics' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>👨‍🔧 Mechanics</button>
              <button onClick={() => setShowUsersModal(true)} className="px-2 py-1 rounded text-[10px] font-bold bg-amber-600 text-white">⚙️ Accounts</button>
            </>
          )}

          <button onClick={() => setShowSalesModal(true)} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white">📊 Sales (₱{todayRevenue.toLocaleString()})</button>
          <button onClick={handleLogout} className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-rose-600 text-slate-300 transition">🚪 Logout</button>
        </div>
      </header>

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
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

            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchTerm(''); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border ${
                    selectedCategory === cat && searchTerm === ''
                      ? 'bg-slate-900 text-white'
                      : cat === '🔥 On Sale'
                      ? 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {filteredProducts.map((prod) => {
                const isOnSale = prod.salePrice && Number(prod.salePrice) > 0 && Number(prod.salePrice) < prod.price;
                const activePrice = isOnSale ? Number(prod.salePrice) : prod.price;

                return (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className={`bg-white p-2 rounded border shadow-sm hover:border-red-500 cursor-pointer flex flex-col justify-between relative ${
                      isOnSale ? 'border-rose-300 bg-rose-50/20' : ''
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 mb-0.5">
                        <div className="flex items-center gap-1">
                          <span>{prod.code || 'ITEM'}</span>
                          {isOnSale && (
                            <span className="bg-rose-600 text-white font-black px-1 rounded text-[7px] uppercase tracking-wider animate-pulse">
                              🔥 SALE
                            </span>
                          )}
                        </div>
                        {getStockBadge(prod.stock)}
                      </div>
                      <h3 className="font-bold text-[10px] text-slate-800 leading-tight line-clamp-2">{prod.name}</h3>
                      <p className="text-[8px] text-slate-400 mt-0.5">{prod.category}</p>
                    </div>

                    <div className="mt-1.5 flex justify-between items-center pt-1 border-t border-slate-100">
                      <div>
                        {isOnSale ? (
                          <div className="flex items-baseline space-x-1">
                            <span className="text-[11px] font-black text-rose-600">₱{activePrice.toFixed(2)}</span>
                            <span className="text-[8px] text-slate-400 line-through">₱{prod.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-red-600">₱{prod.price.toFixed(2)}</span>
                        )}
                      </div>
                      <span className="text-[9px] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-1.5 py-0.5 rounded font-bold transition">
                        +Add
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow border border-slate-800 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-2">
            <div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <h2 className="text-[11px] font-bold text-red-400">🛒 Current Order</h2>
                <button onClick={() => setCart([])} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Clear</button>
              </div>

              <div className="mt-2 space-y-1 max-h-[35vh] overflow-y-auto pr-0.5">
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
                        <span className="font-bold text-red-400">₱{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-[8px] text-slate-400 flex items-center gap-1">
                          <span>₱{item.price} each</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-rose-400 text-[7px] font-bold">(ON SALE)</span>
                          )}
                        </div>
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
                <span className="text-sm text-red-500">₱{totalAmount.toFixed(2)}</span>
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

                {paymentMethod !== 'Cash' ? (
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-bold">Ref / Payment No.</span>
                    <input
                      type="text"
                      placeholder="e.g. 10023485"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="w-24 bg-slate-800 border border-amber-500/50 rounded text-right px-1 py-0.5 text-amber-300 font-bold text-[9px]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Amount Tendered</span>
                      <input
                        type="number"
                        placeholder="₱0.00"
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                        className="w-20 bg-slate-800 border border-slate-700 rounded text-right px-1 py-0.5 text-red-400 font-bold text-[10px]"
                      />
                    </div>

                    <div className="flex justify-between items-center font-bold text-amber-400">
                      <span>Change</span>
                      <span>₱{change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleCheckoutOnly}
                disabled={cart.length === 0}
                className={`w-full py-2 rounded font-bold text-xs text-white transition shadow ${
                  cart.length > 0 ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                COMPLETE ORDER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mechanics Tab (Master Admin Only) */}
      {activeTab === 'mechanics' && currentUser.role === 'admin' && (
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
            <h2 className="text-base font-bold flex items-center gap-1">👨‍🔧 Mechanics Management & Earnings</h2>
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

      {/* Stocks Tab (Master Admin Only) */}
      {activeTab === 'stocks' && currentUser.role === 'admin' && (
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded shadow border">
            <div>
              <h2 className="text-base font-bold">📦 Inventory Management</h2>
              <p className="text-[10px] text-slate-500">Magdagdag, mag-edit, o mag-sale ng pyesa at stocks.</p>
            </div>
            <div className="space-x-1">
              <button onClick={resetToDefaultItems} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2 py-1 rounded text-xs">🔄 Reset Sample Items</button>
              <button onClick={handleOpenAddProduct} className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded text-xs transition shadow">+ Add New Item</button>
            </div>
          </div>

          <div className="bg-white p-3 rounded shadow border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-600">
                    <th className="p-2">Code</th>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Reg Price</th>
                    <th className="p-2">Sale Price</th>
                    <th className="p-2">Available Stock</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isOnSale = p.salePrice && Number(p.salePrice) > 0 && Number(p.salePrice) < p.price;
                    return (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-400">{p.code || 'ITEM'}</td>
                        <td className="p-2 font-semibold flex items-center gap-1">
                          {p.name}
                          {isOnSale && <span className="bg-rose-100 text-rose-700 font-extrabold text-[8px] px-1 rounded">ON SALE</span>}
                        </td>
                        <td className="p-2 text-slate-500">{p.category}</td>
                        <td className="p-2 font-bold text-slate-700">₱{p.price.toFixed(2)}</td>
                        <td className="p-2 font-bold text-rose-600">
                          {isOnSale ? `₱${Number(p.salePrice).toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2">{getStockBadge(p.stock)}</td>
                        <td className="p-2 text-center space-x-1">
                          <button onClick={() => handleOpenEditProduct(p)} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">✏ Edit</button>
                          <button onClick={() => handleDeleteProduct(p.id, p.name)} className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded font-bold text-[10px]">🗑 Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Account Control Modal (Master Admin Only) */}
      {showUsersModal && currentUser.role === 'admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
              <h3 className="text-sm font-bold">⚙️ Staff & Cashier Account Manager</h3>
              <button onClick={() => setShowUsersModal(false)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <form onSubmit={handleAddUser} className="bg-slate-50 p-3 rounded border space-y-2">
                <h4 className="font-bold text-slate-800">+ Add New Cashier / Staff Account</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[9px] text-slate-600">Name / Handle</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full border rounded p-1 text-xs mt-0.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[9px] text-slate-600">PIN Code</label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 5555"
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value)}
                      className="w-full border rounded p-1 text-xs mt-0.5 bg-white font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-[9px] text-slate-600">Account Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full border rounded p-1 text-xs mt-0.5 bg-white font-bold"
                  >
                    <option value="cashier">Cashier (POS & Sales Viewing Only)</option>
                    <option value="admin">Master Admin (Full Control)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded transition">
                  Create Staff Account
                </button>
              </form>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800">Existing Accounts:</h4>
                <div className="space-y-1">
                  {users.map((u) => (
                    <div key={u.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                      <div>
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className="ml-1 text-[9px] uppercase font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">
                          {u.role}
                        </span>
                        <p className="text-[9px] text-slate-400">PIN: **** (Protected)</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleResetUserToDefault(u.id, u.name)}
                          className="px-2 py-0.5 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded font-bold text-[9px]"
                        >
                          🔄 Reset PIN
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-2 py-0.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded font-bold text-[9px]"
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t text-right">
              <button onClick={() => setShowUsersModal(false)} className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded font-bold">
                Isara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Own Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-4 space-y-3 text-slate-800 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-xs text-slate-900">✏️ Edit My Profile & PIN</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-2.5">
              <div>
                <label className="font-bold text-[10px]">Pangalan / Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="I-type ang iyong pangalan"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full border rounded p-1.5 text-xs mt-0.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[10px]">Kasalukuyang PIN (Current PIN)</label>
                <input
                  type="password"
                  required
                  placeholder="Kasalukuyang PIN Code"
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  className="w-full border rounded p-1.5 text-xs mt-0.5 text-center font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[10px]">Bagong PIN Code (Optional)</label>
                <input
                  type="password"
                  placeholder="Iwanang blangko kung ayaw baguhin"
                  value={changeNewPinInput}
                  onChange={(e) => setChangeNewPinInput(e.target.value)}
                  className="w-full border rounded p-1.5 text-xs mt-0.5 text-center font-bold"
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-3 py-1 bg-slate-200 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal (With Sale Price Field) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden p-4 space-y-3 text-xs">
            <h3 className="text-sm font-bold">{editingProductId ? '✏ Edit Item' : '+ Add New Item'}</h3>
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
                    {categories.filter((c) => c !== 'All' && c !== '🔥 On Sale').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[10px]">Regular Price (₱)</label>
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
                  <label className="font-bold text-[10px] text-rose-600">Sale Price (₱) [Optional]</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                    className="w-full border border-rose-300 rounded p-1 text-xs mt-0.5 bg-rose-50/30 text-rose-700 font-bold"
                  />
                </div>
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
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-3 py-1 bg-slate-200 rounded text-xs font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Report Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-1.5">📊 Daily Sales Log & History</h3>
              <button onClick={() => setShowSalesModal(false)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="flex justify-between items-center bg-slate-100 p-2 rounded border">
                <span className="font-bold text-slate-700 text-[10px]">📅 Date Filter:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSalesDateFilter('today')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${salesDateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    Ngayong Araw
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('yesterday')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${salesDateFilter === 'yesterday' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    Kahapon
                  </button>
                  <button
                    onClick={() => setSalesDateFilter('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${salesDateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'}`}
                  >
                    Lahat (All Time)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded border border-emerald-200">
                <div>
                  <p className="text-[10px] uppercase text-emerald-600 font-bold">
                    Kabuuang Benta ({salesDateFilter === 'today' ? 'Today' : salesDateFilter === 'yesterday' ? 'Yesterday' : 'All Time'})
                  </p>
                  <p className="text-2xl font-black text-emerald-700">₱{filteredTotalRevenue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Total Transactions</p>
                  <p className="text-sm font-bold text-slate-700">{filteredSalesHistory.length} Orders</p>
                </div>
              </div>

              {filteredSalesHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Walang naitalang benta sa napiling petsa.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSalesHistory.map((sale) => (
                    <div key={sale.id} className="border rounded-lg p-2.5 bg-slate-50 space-y-1">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          🕒 {sale.date} - {sale.time} | <span className="text-slate-800 font-bold">👤 Cashier: {sale.cashier || 'N/A'}</span>
                        </span>
                        <span className="font-black text-red-600">Total: ₱{sale.total.toFixed(2)}</span>
                      </div>
                      <ul className="space-y-0.5 text-[10px] pt-1">
                        {sale.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-slate-700">
                            <span>
                              • {item.name} x {item.qty}
                              {item.type === 'service' && <span className="text-[9px] text-amber-600 font-bold ml-1">({item.mechanic})</span>}
                            </span>
                            <span className="font-semibold">₱{(item.price * item.qty).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      {sale.discount > 0 && (
                        <div className="text-[9px] text-rose-500 text-right pt-0.5">Discount: -₱{sale.discount.toFixed(2)}</div>
                      )}
                      <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t">
                        <span className="font-bold">
                          Payment: {sale.paymentMethod || 'Cash'}
                          {sale.referenceNo && <span className="text-amber-600 ml-1">(Ref: {sale.referenceNo})</span>}
                        </span>
                        {sale.paymentMethod === 'Cash' ? (
                          <span>Inabot: ₱{(sale.amountTendered || 0).toFixed(2)} | Sukli: ₱{(sale.change || 0).toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">PAID ONLINE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-between items-center">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={clearSalesHistory}
                  className="px-3 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-xs font-bold transition"
                >
                  🗑 Reset All History (Admin Only)
                </button>
              ) : (
                <span className="text-[9px] text-slate-400 italic">Logged in as Cashier</span>
              )}
              <button
                onClick={() => setShowSalesModal(false)}
                className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded text-xs font-bold transition"
              >
                Isara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
