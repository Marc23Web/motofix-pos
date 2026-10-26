import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, ShoppingCart, AlertTriangle, Plus, Search, 
  Trash2, RefreshCw, CheckCircle, FileText, ArrowRight, DollarSign, 
  TrendingUp, Users, Check, Printer, X, Tag, List, Box, HardDrive
} from 'lucide-react';

// Sample Initial Products
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Yamalube 10W-40 4T (800ml)', category: 'Engine Oil', price: 250, cost: 190, stock: 18, minStock: 10, unit: 'bottle' },
  { id: 2, name: 'Motul 7100 10W-40 1L', category: 'Engine Oil', price: 580, cost: 480, stock: 4, minStock: 8, unit: 'bottle' },
  { id: 3, name: 'NGK Spark Plug CPR8EA-9', category: 'Electrical', price: 140, cost: 95, stock: 32, minStock: 15, unit: 'pcs' },
  { id: 4, name: 'FDR Sport XR Evo 90/80-17', category: 'Tires', price: 1450, cost: 1150, stock: 3, minStock: 5, unit: 'pcs' },
  { id: 5, name: 'RCB Brake Pad S-Series (NMAX)', category: 'Brake System', price: 380, cost: 260, stock: 12, minStock: 6, unit: 'set' },
  { id: 6, name: 'Drive Belt Click 125i (Honda)', category: 'Engine Parts', price: 650, cost: 480, stock: 2, minStock: 5, unit: 'pcs' },
  { id: 7, name: 'Osram LED Headlight Bulb T19', category: 'Electrical', price: 320, cost: 210, stock: 15, minStock: 8, unit: 'pcs' },
];

const MECHANICS = ['Kuya Jun', 'Master Ben', 'Roldan'];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // pos, inventory, joborders, dashboard
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('mc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentModal, setPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);

  // Job Orders
  const [jobOrders, setJobOrders] = useState([
    { id: 'JO-101', customer: 'Juan Dela Cruz', plate: 'ABC 1234', model: 'Yamaha NMAX', mechanic: 'Kuya Jun', issue: 'Change oil & Belt replacement', status: 'In Progress', items: [{ name: 'Yamalube 10W-40', price: 250, qty: 1 }], laborFee: 200 }
  ]);
  const [newJOModal, setNewJOModal] = useState(false);
  const [newJO, setNewJO] = useState({ customer: '', plate: '', model: '', mechanic: MECHANICS[0], issue: '', laborFee: 150 });

  // Add/Edit Product State
  const [productModal, setProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Engine Oil', price: '', cost: '', stock: '', minStock: 5, unit: 'pcs' });
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    localStorage.setItem('mc_products', JSON.stringify(products));
  }, [products]);

  // Categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtered products for Cashier search
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // POS Actions
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Out of stock na ang item na ito!');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return alert('Nasa limit ka na ng natitirang stock!');
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1, type: 'product' }]);
    }
  };

  const addLaborFeeToCart = () => {
    const fee = prompt('Magkano ang Labor / Mechanic Service Fee? (₱)', '150');
    if (fee && !isNaN(fee) && Number(fee) > 0) {
      setCart([...cart, { id: 'labor-' + Date.now(), name: `Labor / Mechanic Fee`, price: Number(fee), qty: 1, type: 'service' }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const item = cart.find(i => i.id === id);
    if (item.type === 'product') {
      const prod = products.find(p => p.id === id);
      if (qty > prod.stock) return alert('Sobra na sa available stock!');
    }
    setCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const changeAmount = Number(amountPaid) >= cartTotal ? Number(amountPaid) - cartTotal : 0;

  const handleCompleteSale = () => {
    if (Number(amountPaid) < cartTotal) return alert('Kulang ang inabot na pera ng customer!');
    
    // Deduct stock
    const updated = products.map(p => {
      const inCart = cart.find(c => c.id === p.id && c.type === 'product');
      if (inCart) {
        return { ...p, stock: p.stock - inCart.qty };
      }
      return p;
    });

    setProducts(updated);
    setLastReceipt({
      items: [...cart],
      total: cartTotal,
      paid: Number(amountPaid),
      change: changeAmount,
      date: new Date().toLocaleString()
    });
    setCart([]);
    setAmountPaid('');
    setPaymentModal(false);
    alert('Transaksyon Kumpleto! Nabawasan na ang stock.');
  };

  // Product Encoding
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const item = {
      id: Date.now(),
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      cost: Number(newProduct.cost || 0),
      stock: Number(newProduct.stock || 0),
      minStock: Number(newProduct.minStock || 5),
      unit: newProduct.unit || 'pcs'
    };
    setProducts([...products, item]);
    setNewProduct({ name: '', category: 'Engine Oil', price: '', cost: '', stock: '', minStock: 5, unit: 'pcs' });
    setProductModal(false);
  };

  const handleRestock = () => {
    if (!restockItem || !restockQty || isNaN(restockQty)) return;
    setProducts(products.map(p => p.id === restockItem.id ? { ...p, stock: p.stock + Number(restockQty) } : p));
    setRestockItem(null);
    setRestockQty('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800">
      {/* TOP NAVBAR */}
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide leading-none">MOTOFIX PARTS & SERBISYO</h1>
            <p className="text-xs text-slate-400">Inventory & Cashier POS Tool</p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <nav className="flex bg-slate-800 p-1 rounded-xl space-x-1">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'pos' ? 'bg-red-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cashier / POS</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            <Package className="h-4 w-4" />
            <span>Stocks & Prices</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-amber-500 text-slate-900 text-xs px-1.5 py-0.5 rounded-full font-bold ml-1">
                {lowStockProducts.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('joborders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'joborders' ? 'bg-red-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            <Users className="h-4 w-4" />
            <span>Mechanic Jobs</span>
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden">
        
        {/* TAB 1: CASHIER / POS */}
        {activeTab === 'pos' && (
          <div className="flex h-full p-4 gap-4">
            {/* LEFT SIDE: ITEM SEARCH & SELECTOR */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Search Header */}
              <div className="p-4 border-b border-slate-100 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Mag-search ng pyesa o gamit (e.g. Yamalube, Spark plug)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={addLaborFeeToCart}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Service / Labor</span>
                </button>
              </div>

              {/* Categories Bar */}
              <div className="flex px-4 py-2 bg-slate-50 border-b border-slate-100 gap-2 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map(product => {
                  const isLow = product.stock <= product.minStock;
                  const isOut = product.stock <= 0;
                  return (
                    <div 
                      key={product.id}
                      onClick={() => !isOut && addToCart(product)}
                      className={`p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition select-none ${isOut ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed' : 'hover:border-red-500 hover:shadow-md bg-white border-slate-200'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-slate-400 font-medium uppercase">{product.category}</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {isOut ? 'OUT OF STOCK' : `${product.stock} ${product.unit}`}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2">{product.name}</h3>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold text-red-600 text-base">₱{product.price.toLocaleString()}</span>
                        <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-1 rounded-md">Add +</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: CART & CALCULATOR */}
            <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-red-500" />
                  <h2 className="font-bold">Current Order</h2>
                </div>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold">{cart.length} items</span>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Walang laman ang cart.</p>
                    <p className="text-xs text-slate-400">Pumili ng item sa kaliwa o mag-add ng labor.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="pt-2 flex justify-between items-center">
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-xs text-slate-800">{item.name}</h4>
                        <span className="text-xs text-slate-500">₱{item.price} x {item.qty}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-slate-200 rounded-md">
                          <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200">-</button>
                          <span className="px-2 text-xs font-bold">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200">+</button>
                        </div>
                        <span className="font-bold text-xs w-16 text-right">₱{(item.price * item.qty).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Calculator Summary */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                  <span>TOTAL AMOUNT</span>
                  <span className="text-red-600 text-2xl">₱{cartTotal.toLocaleString()}</span>
                </div>

                <button 
                  disabled={cart.length === 0}
                  onClick={() => setPaymentModal(true)}
                  className={`w-full py-3.5 rounded-xl font-bold text-base shadow-md flex justify-center items-center space-x-2 transition ${cart.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  <DollarSign className="h-5 w-5" />
                  <span>MAG-BAYAD (CHECKOUT)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY ENCODING & STOCKS */}
        {activeTab === 'inventory' && (
          <div className="h-full p-4 flex flex-col space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold text-slate-800">Master Stock List</h2>
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                  Total Items: {products.length}
                </span>
              </div>
              
              <button 
                onClick={() => setProductModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center space-x-2 shadow"
              >
                <Plus className="h-5 w-5" />
                <span>+ Mag-Encode ng Bagong Item</span>
              </button>
            </div>

            {/* Low Stock Warning Banner */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-semibold">
                    Mayroong ({lowStockProducts.length}) item na kailangan na ng stock replenishment!
                  </span>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white sticky top-0">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Kategorya</th>
                      <th className="p-3">Capital Price (Cost)</th>
                      <th className="p-3">Selling Price</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Min Alert Level</th>
                      <th className="p-3 text-center">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(product => {
                      const isLow = product.stock <= product.minStock;
                      return (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{product.name}</td>
                          <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{product.category}</span></td>
                          <td className="p-3 text-slate-500">₱{product.cost}</td>
                          <td className="p-3 font-bold text-red-600">₱{product.price}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded font-bold text-xs ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                              {product.stock} {product.unit}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-xs">{product.minStock} {product.unit}</td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => setRestockItem(product)}
                              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              + Replenish Stock
                            </button>
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

        {/* TAB 3: MECHANIC JOB ORDERS */}
        {activeTab === 'joborders' && (
          <div className="h-full p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Mechanic Service Jobs</h2>
              <button 
                onClick={() => setNewJOModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>+ Bagong Job Order</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobOrders.map(jo => (
                <div key={jo.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400">{jo.id}</span>
                      <h3 className="font-bold text-slate-800 text-base">{jo.customer}</h3>
                      <p className="text-xs text-slate-500">{jo.model} • <span className="font-semibold text-slate-700">{jo.plate}</span></p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">{jo.status}</span>
                  </div>

                  <div className="text-sm">
                    <p className="text-slate-600"><strong>Assigned Mechanic:</strong> {jo.mechanic}</p>
                    <p className="text-slate-600"><strong>Gawain / Issue:</strong> {jo.issue}</p>
                    <p className="text-slate-600"><strong>Labor Fee:</strong> ₱{jo.laborFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL (CALCULATOR SUKLI) */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Cashier Calculator</h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Babayaran:</span>
                <span className="font-bold text-slate-900">₱{cartTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Inabot na Pera ng Customer (₱):</label>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="e.g. 1000"
                  className="w-full text-2xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-red-500 focus:outline-none"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 pt-2 border-t">
                <span>SUKLI:</span>
                <span className={`text-2xl ${changeAmount < 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                  ₱{changeAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => setPaymentModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleCompleteSale}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow"
              >
                Kumpletuhin ang Benta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {productModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center p-4 z-50">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Mag-encode ng Bagong Item</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pangalan ng Pyesa / Item</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Yamalube 10W-40"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kategorya</label>
                  <select 
                    className="w-full p-2.5 border rounded-lg"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="Engine Oil">Engine Oil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Tires">Tires</option>
                    <option value="Brake System">Brake System</option>
                    <option value="Engine Parts">Engine Parts</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Unit</label>
                  <input 
                    type="text" 
                    placeholder="pcs, bottle, set"
                    className="w-full p-2.5 border rounded-lg"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Puhunan (Cost ₱)</label>
                  <input 
                    type="number" 
                    placeholder="190"
                    className="w-full p-2.5 border rounded-lg"
                    value={newProduct.cost}
                    onChange={e => setNewProduct({...newProduct, cost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Benta (Price ₱)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="250"
                    className="w-full p-2.5 border rounded-lg font-bold text-red-600"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Initial Stock Count</label>
                  <input 
                    type="number" 
                    placeholder="20"
                    className="w-full p-2.5 border rounded-lg"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Min Replenish Alert</label>
                  <input 
                    type="number" 
                    placeholder="5"
                    className="w-full p-2.5 border rounded-lg"
                    value={newProduct.minStock}
                    onChange={e => setNewProduct({...newProduct, minStock: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setProductModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow">Save Item</button>
            </div>
          </form>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Replenish Stock</h3>
            <p className="text-sm text-slate-600">Magdagdag ng dagdag na stock para sa: <br/><strong className="text-slate-900">{restockItem.name}</strong></p>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ilang pcs/items ang idadagdag?</label>
              <input 
                type="number" 
                autoFocus
                placeholder="e.g. 10"
                className="w-full text-xl font-bold p-3 border rounded-xl"
                value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button onClick={() => setRestockItem(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button onClick={handleRestock} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">+ Dagdag Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
