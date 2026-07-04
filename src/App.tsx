import React, { useState, useMemo, useEffect } from "react";
import { 
  Folder, 
  FileCode, 
  Terminal, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  Activity, 
  FileSpreadsheet, 
  LogOut, 
  ChevronRight, 
  Info, 
  Sparkles, 
  Laptop,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_SALES, 
  FILE_CONTENTS,
  Product,
  Sale,
  User as AuthUser
} from "./data";

export default function App() {
  // --- Workspace States ---
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [fileContents, setFileContents] = useState<Record<string, string>>(FILE_CONTENTS);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'editor' | 'instructions'>('editor');

  // --- Python Simulator States ---
  const [users, setUsers] = useState<AuthUser[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Admin' | 'Staff'>('Staff');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // App running state
  const [simulatorTab, setSimulatorTab] = useState<'inventory' | 'sales' | 'history' | 'reports'>('inventory');

  // --- GUI Emulator Splash Screen States ---
  const [emulatorSplash, setEmulatorSplash] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatus, setSplashStatus] = useState<string>("Initializing Python interpreter...");

  useEffect(() => {
    if (!emulatorSplash) return;
    
    const interval = setInterval(() => {
      setSplashProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setEmulatorSplash(false);
          }, 500);
          return 100;
        }
        
        // CustomTkinter simulation boot steps
        if (next === 20) setSplashStatus("Loading modules (customtkinter, sqlite3)...");
        if (next === 45) setSplashStatus("Connecting to database 'python_world.db'...");
        if (next === 70) setSplashStatus("Instantiating GUI frames and widgets...");
        if (next === 90) setSplashStatus("Starting Tkinter event loop...");
        
        return next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [emulatorSplash]);

  // Inventory tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Inventory form inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMinStock, setFormMinStock] = useState('');

  // Sales terminal states
  const [activeCheckoutProduct, setActiveCheckoutProduct] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<string>('1');

  // Alerts/Toasts state
  const [simulationToast, setSimulationToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- Simulator Actions & Handlers ---
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setSimulationToast({ message, type });
    setTimeout(() => {
      setSimulationToast(null);
    }, 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginUsername.trim() || !loginPassword) {
      setAuthError("Username and password cannot be empty.");
      return;
    }

    // SHA-256 simulation: we just match plain usernames and verify password for seeded users
    const matchedUser = users.find(
      u => u.username.toLowerCase() === loginUsername.trim().toLowerCase()
    );

    if (matchedUser) {
      // Admin bypass or password match verification
      if (loginUsername === 'admin' && loginPassword === 'admin123') {
        setCurrentUser(matchedUser);
        showToast("Logged in as Administrator", "success");
        setLoginPassword('');
        setLoginUsername('');
      } else if (loginUsername === 'sarah_clerk' && loginPassword === 'password') {
        setCurrentUser(matchedUser);
        showToast("Logged in as Staff member", "success");
        setLoginPassword('');
        setLoginUsername('');
      } else if (loginPassword.length >= 6) {
        // Any custom signed up user accepts password lengths >= 6 for seamless testing
        setCurrentUser(matchedUser);
        showToast(`Welcome back, ${matchedUser.username}!`, "success");
        setLoginPassword('');
        setLoginUsername('');
      } else {
        setAuthError("Invalid credentials. Try 'admin' / 'admin123'");
      }
    } else {
      setAuthError("Username not found. Try signing up!");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!signupUsername.trim() || !signupPassword || !signupConfirmPassword) {
      setAuthError("All fields are mandatory.");
      return;
    }

    if (signupUsername.trim().length < 3) {
      setAuthError("Username must be at least 3 characters.");
      return;
    }

    if (signupPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (users.some(u => u.username.toLowerCase() === signupUsername.trim().toLowerCase())) {
      setAuthError("Username already exists in SQLite.");
      return;
    }

    const newUser: AuthUser = {
      id: users.length + 1,
      username: signupUsername.trim(),
      role: signupRole,
      passwordHash: "simulated_hash"
    };

    setUsers([...users, newUser]);
    setAuthSuccess("Account registered successfully! Please log in.");
    setSignupUsername('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setAuthMode('login');
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of Python The World?")) {
      setCurrentUser(null);
      setSimulatorTab('inventory');
      setSelectedProduct(null);
      setActiveCheckoutProduct(null);
      showToast("Signed out successfully", "info");
    }
  };

  // --- Products Catalog Filtered List ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Click on product in inventory list
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormQuantity(product.quantity.toString());
    setFormPrice(product.price.toString());
    setFormMinStock(product.min_stock.toString());
  };

  const handleClearForm = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormCategory('');
    setFormQuantity('');
    setFormPrice('');
    setFormMinStock('');
  };

  const handleSaveProduct = () => {
    if (!formName.trim() || !formCategory.trim() || !formQuantity.trim() || !formPrice.trim()) {
      showToast("Please fill in all mandatory product fields.", "error");
      return;
    }

    const qty = parseInt(formQuantity);
    const price = parseFloat(formPrice);
    const minS = formMinStock.trim() ? parseInt(formMinStock) : 5;

    if (isNaN(qty) || qty < 0 || isNaN(price) || price < 0 || isNaN(minS)) {
      showToast("Quantity, Price, and Min Stock must be valid non-negative numbers.", "error");
      return;
    }

    if (selectedProduct) {
      // Update existing
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, name: formName.trim(), category: formCategory.trim(), quantity: qty, price, min_stock: minS }
          : p
      ));
      showToast("Product updated inside SQLite successfully!", "success");
    } else {
      // Create new
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id), 100) + 1,
        name: formName.trim(),
        category: formCategory.trim(),
        quantity: qty,
        price,
        min_stock: minS
      };
      setProducts([...products, newProduct]);
      showToast("New Product inserted into SQLite!", "success");
    }
    handleClearForm();
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    if (currentUser?.role !== 'Admin') {
      alert("❌ Authorization Error\n\nOnly Users with the 'Admin' role are permitted to delete product records!");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete '${selectedProduct.name}'?`)) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      showToast("Product deleted from SQLite database.", "success");
      handleClearForm();
    }
  };

  // --- Sales Terminal Action ---
  const handleSelectCheckoutProduct = (product: Product) => {
    setActiveCheckoutProduct(product);
    setSaleQuantity('1');
  };

  const handleExecuteSale = () => {
    if (!activeCheckoutProduct || !currentUser) return;

    const sellQty = parseInt(saleQuantity);
    if (isNaN(sellQty) || sellQty <= 0) {
      showToast("Please enter a valid positive quantity to sell.", "error");
      return;
    }

    if (sellQty > activeCheckoutProduct.quantity) {
      showToast(`Insufficient stock! Only ${activeCheckoutProduct.quantity} units available.`, "error");
      return;
    }

    // Decrement inventory quantity
    setProducts(products.map(p => 
      p.id === activeCheckoutProduct.id 
        ? { ...p, quantity: p.quantity - sellQty }
        : p
    ));

    // Record Sale
    const totalAmount = activeCheckoutProduct.price * sellQty;
    const newTxId = Math.max(...sales.map(s => s.id), 1000) + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newSale: Sale = {
      id: newTxId,
      productName: activeCheckoutProduct.name,
      quantity: sellQty,
      totalPrice: totalAmount,
      date: formattedDate,
      username: currentUser.username
    };

    setSales([newSale, ...sales]);
    showToast(`Transaction Recorded! Total: $${totalAmount.toFixed(2)}`, "success");

    // Reset active checkout
    setActiveCheckoutProduct(null);
    setSaleQuantity('1');
  };

  // --- Export Actions ---
  const simulateExportCSV = (type: 'inventory' | 'sales') => {
    const csvContent = type === 'inventory' 
      ? "Product ID,Product Name,Category,Stock,Price,Min Stock\n" + products.map(p => `${p.id},"${p.name}","${p.category}",${p.quantity},${p.price},${p.min_stock}`).join("\n")
      : "Transaction ID,Product Name,Units Sold,Total Revenue,Timestamp,Clerk\n" + sales.map(s => `${s.id},"${s.productName}",${s.quantity},${s.totalPrice},"${s.date}","${s.username}"`).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully downloaded physical CSV export file!`, "success");
  };

  // --- Copy File To Clipboard Helper ---
  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContents[selectedFile] || '');
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // --- Reports Metrics ---
  const statsSummary = useMemo(() => {
    const revenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const units = sales.reduce((sum, s) => sum + s.quantity, 0);
    const alertsCount = products.filter(p => p.quantity <= p.min_stock).length;

    // Revenue per category
    const categoryBreakdown: Record<string, number> = {};
    sales.forEach(s => {
      // Find category from products (or fallback)
      const prod = products.find(p => p.name === s.productName);
      const cat = prod ? prod.category : "Unassigned";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + s.totalPrice;
    });

    const categoriesSorted = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);

    return {
      revenue,
      units,
      transactions: sales.length,
      totalProducts: products.length,
      alertsCount,
      categoryShare: categoriesSorted
    };
  }, [sales, products]);

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#e3e4e6] font-sans flex flex-col antialiased selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      {/* Ambient glass glow background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[30%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- TOP BRANDED DASHBOARD HEADER --- */}
      <header className="bg-[#10121a]/60 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shrink-0 relative">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-35 group-hover:opacity-60 transition duration-300" />
            <img 
              src="/src/assets/images/python_world_logo_1783168975662.jpg" 
              alt="Python The World Logo" 
              className="relative w-11 h-11 rounded-xl border border-white/10 object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              Python The World Studio
              <span className="bg-gradient-to-r from-emerald-500/15 to-blue-500/15 text-emerald-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                CustomTkinter + SQLite
              </span>
            </h1>
            <p className="text-xs text-gray-400">Interact with the Tkinter desktop app mockup on the right, or explore source code files on the left.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <a
            href="/python_project/main.py"
            download
            className="flex items-center gap-2 text-xs bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] backdrop-blur-md transition-all text-white px-3.5 py-2.5 rounded-lg font-medium border border-white/10 shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-400 animate-pulse" />
            Download Source Code (.ZIP)
          </a>
          <span className="text-[11px] font-mono text-gray-500 hidden xl:inline-block">
            Local time: 2026-07-04 UTC
          </span>
        </div>
      </header>

      {/* --- MAIN SPLIT CONTAINER --- */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 w-full relative">
        
        {/* =========================================================================
            LEFT COLUMN: DEVELOPER SOURCE CODE WORKSPACE (55% width)
            ========================================================================= */}
        <section className="w-full lg:w-[52%] border-r border-white/[0.08] bg-transparent flex flex-col min-h-[450px] lg:min-h-0 relative z-10">
          <div className="bg-[#10121a]/40 border-b border-white/[0.08] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setActiveWorkspaceTab('editor')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeWorkspaceTab === 'editor' 
                    ? 'bg-white/10 text-blue-400 border border-white/10 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5" />
                  Code Explorer
                </div>
              </button>
              <button 
                onClick={() => setActiveWorkspaceTab('instructions')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeWorkspaceTab === 'instructions' 
                    ? 'bg-white/10 text-blue-400 border border-white/10 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Setup Guide
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/10">
                {selectedFile}
              </span>
            </div>
          </div>

          {activeWorkspaceTab === 'editor' ? (
            <div className="flex-1 flex min-h-0 bg-[#0c0d12]/20 backdrop-blur-md">
              {/* Sidebar file tree */}
              <div className="w-[180px] bg-black/35 border-r border-white/10 p-3 flex flex-col gap-1.5 shrink-0 select-none">
                <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5 px-1">
                  Workspace Files
                </div>
                {Object.keys(fileContents).map(filename => (
                  <button
                    key={filename}
                    onClick={() => setSelectedFile(filename)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-all group ${
                      selectedFile === filename 
                        ? 'bg-white/10 text-white border-l-2 border-blue-500 pl-2 shadow-inner' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 pl-2.5'
                    }`}
                  >
                    {filename.endsWith('.md') ? (
                      <FileText className={`h-4 w-4 shrink-0 ${selectedFile === filename ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`} />
                    ) : filename === 'requirements.txt' ? (
                      <Terminal className={`h-4 w-4 shrink-0 ${selectedFile === filename ? 'text-amber-400' : 'text-gray-500 group-hover:text-amber-400'}`} />
                    ) : (
                      <FileCode className={`h-4 w-4 shrink-0 ${selectedFile === filename ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} />
                    )}
                    <span className="truncate">{filename}</span>
                  </button>
                ))}

                <div className="mt-auto pt-4 border-t border-white/10 text-[11px] text-gray-500 px-1 leading-relaxed">
                  <div className="flex items-center gap-1 mb-1 font-semibold text-gray-400">
                    <Sparkles className="h-3 w-3 text-yellow-500 shrink-0" />
                    Offline Persistent
                  </div>
                  Uses standard Python libraries. The code is structured securely into objects.
                </div>
              </div>

              {/* Code window */}
              <div className="flex-1 flex flex-col bg-black/10 overflow-hidden relative">
                {/* Editor control bar */}
                <div className="bg-white/[0.02] px-4 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Read-only reference viewer
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors rounded-md border border-white/10"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Editor body */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed select-text bg-black/45 text-blue-300">
                  <pre className="text-gray-300 whitespace-pre">
                    <code>
                      {fileContents[selectedFile] || ''}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#0c0d12]/15 backdrop-blur-md">
              <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-400" />
                  What is this workspace?
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We have generated the complete Python production files under the <code className="text-blue-400 font-mono">/python_project/</code> directory. You can read, view, or export them. The simulator on the right runs a high-fidelity visual translation of the Python CustomTkinter code.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Windows Execution Guide
                </h4>
                <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400">PowerShell Terminal Script</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Step-by-Step</span>
                  </div>
                  
                  <div className="p-4 space-y-4 font-mono text-xs text-gray-300">
                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold"># Step 1: Open PowerShell inside the downloaded directory</span>
                      <div className="bg-black/40 p-2.5 rounded-lg text-gray-400 border border-white/5">
                        cd python_project
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold"># Step 2: Provision virtual environment</span>
                      <div className="bg-black/40 p-2.5 rounded-lg text-gray-400 border border-white/5">
                        python -m venv venv
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold"># Step 3: Activate environment on Windows</span>
                      <div className="bg-black/40 p-2.5 rounded-lg text-gray-400 border border-white/5">
                        .\venv\Scripts\activate
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold"># Step 4: Install dependencies from requirements.txt</span>
                      <div className="bg-black/40 p-2.5 rounded-lg text-gray-400 border border-white/5">
                        pip install -r requirements.txt
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold"># Step 5: Start desktop Tkinter application</span>
                      <div className="bg-black/40 p-2.5 rounded-lg text-gray-400 border border-white/5">
                        python main.py
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/20 backdrop-blur-md border border-red-900/30 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-200">Windows Defender Hint</h4>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    CustomTkinter downloads graphic canvas assets via standard Tkinter window handles. If your Windows machine has aggressive firewall settings, make sure python is allowed to start standard local Tk window loops without blocking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            RIGHT COLUMN: HIGH-FIDELITY CUSTOMTKINTER DESKTOP EMULATOR (48% width)
            ========================================================================= */}
        <section className="w-full lg:w-[48%] bg-transparent p-6 flex flex-col justify-center items-center overflow-y-auto relative min-h-[500px] z-10">
          
          {/* Active Toast notifications */}
          <AnimatePresence>
            {simulationToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`absolute top-4 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-2 text-xs font-medium ${
                  simulationToast.type === 'success' 
                    ? 'bg-emerald-950/75 text-emerald-300 border-emerald-500/30 shadow-emerald-950/20'
                    : simulationToast.type === 'error'
                    ? 'bg-red-950/75 text-red-300 border-red-500/30 shadow-red-950/20'
                    : 'bg-blue-950/75 text-blue-300 border-blue-500/30 shadow-blue-950/20'
                }`}
              >
                <CheckCircle className="h-4 w-4 shrink-0 animate-bounce" />
                {simulationToast.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-[580px] space-y-4">
            
            {/* Emulator tag label */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3 text-green-500 animate-pulse fill-green-500" />
                Live Interactive GUI Mockup
              </span>
              <span className="font-mono text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                Port: Emulator-State
              </span>
            </div>

            {/* --- WINDOW FRAME WRAPPER --- */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col min-h-[500px] text-sm select-none">
              
              {/* Windows Window Title Bar */}
              <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Small circular Python logo icon */}
                  <img 
                    src="/src/assets/images/python_world_logo_1783168975662.jpg" 
                    className="w-4 h-4 rounded-full border border-white/15 object-cover" 
                    alt="Mini Logo" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-semibold text-gray-300 font-mono tracking-tight">
                    Python The World — Inventory & Sales Portal
                  </span>
                </div>
                
                {/* Windows Window controls */}
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-red-500/80 transition-colors cursor-pointer"></span>
                </div>
              </div>

              {/* Window Content: Checked if Logged in or Not */}
              {emulatorSplash ? (
                /* ================= EMULATOR SPLASH SCREEN ================= */
                <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0c0d12] relative overflow-hidden">
                  {/* Subtle decorative grid background for high-tech feel */}
                  <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                  
                  <div className="z-10 text-center space-y-6 max-w-[320px] w-full">
                    {/* Glowing outer ring for Python logo */}
                    <div className="relative inline-block">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 to-blue-500/30 blur-xl animate-pulse" />
                      <img 
                        src="/src/assets/images/python_world_logo_1783168975662.jpg" 
                        alt="Python The World Logo" 
                        className="w-20 h-20 rounded-full border border-white/20 shadow-2xl relative z-10" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                        Python The World
                      </h2>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        CustomTkinter Desktop Launcher
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* Custom Tkinter progress bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-100 ease-out"
                          style={{ width: `${splashProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 px-0.5">
                        <span className="truncate max-w-[200px] text-left text-emerald-400/80">{splashStatus}</span>
                        <span className="font-bold text-blue-400">{splashProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !currentUser ? (
                /* ================= AUTHENTICATION VIEW ================= */
                <div className="flex-1 flex flex-col justify-center items-center p-8 bg-black/10">
                  
                  {/* Outer Frame card */}
                  <div className="w-full max-w-[340px] bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-5 shadow-2xl">
                    <div className="text-center space-y-3">
                      <img 
                        src="/src/assets/images/python_world_logo_1783168975662.jpg" 
                        className="w-14 h-14 rounded-2xl border border-white/15 mx-auto shadow-md" 
                        alt="Logo" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Python The World</h2>
                        <p className="text-[11px] text-gray-400">Secure Database Access Portal</p>
                      </div>
                    </div>

                    <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                      {authError && (
                        <div className="bg-red-950/40 text-red-300 text-[11px] p-2.5 rounded-lg border border-red-500/20 leading-relaxed flex items-start gap-1.5">
                          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                          <span>{authError}</span>
                        </div>
                      )}

                      {authSuccess && (
                        <div className="bg-emerald-950/40 text-emerald-300 text-[11px] p-2.5 rounded-lg border border-emerald-500/20 leading-relaxed flex items-start gap-1.5">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>{authSuccess}</span>
                        </div>
                      )}

                      {authMode === 'login' ? (
                        <>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Username"
                              value={loginUsername}
                              onChange={(e) => setLoginUsername(e.target.value)}
                              className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white placeholder-gray-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                            />
                            <input
                              type="password"
                              placeholder="Password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white placeholder-gray-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-blue-600/85 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
                          >
                            Login Securely
                          </button>

                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                              className="text-xs text-blue-400 hover:underline"
                            >
                              Don't have an account? Sign Up
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Choose Username"
                              value={signupUsername}
                              onChange={(e) => setSignupUsername(e.target.value)}
                              className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white placeholder-gray-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                            />
                            <input
                              type="password"
                              placeholder="Password (Min 6 chars)"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white placeholder-gray-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                            />
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white placeholder-gray-500 rounded-lg px-3.5 py-2.5 outline-none transition-all"
                            />

                            <div className="space-y-1">
                              <label className="text-[11px] text-gray-400 block px-0.5">Select Role in Store:</label>
                              <select
                                value={signupRole}
                                onChange={(e) => setSignupRole(e.target.value as 'Admin' | 'Staff')}
                                className="w-full bg-black/25 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-xs text-white rounded-lg px-3 py-2 outline-none transition-all cursor-pointer"
                              >
                                <option value="Staff">Staff (Regular clerk)</option>
                                <option value="Admin">Admin (Full inventory manager)</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-600/85 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-lg shadow-lg shadow-emerald-500/10 transition-colors cursor-pointer"
                          >
                            Register User
                          </button>

                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => { setAuthMode('login'); setAuthError(null); }}
                              className="text-xs text-blue-400 hover:underline"
                            >
                              Already registered? Log In
                            </button>
                          </div>
                        </>
                      )}
                    </form>

                    <div className="pt-3 border-t border-white/10 text-[10px] text-gray-500 text-center space-y-1 font-mono">
                      <p>✨ Testing Credentials Seeded:</p>
                      <p>Admin: <span className="text-gray-300 font-bold">admin</span> / <span className="text-gray-300 font-bold">admin123</span></p>
                      <p>Staff: <span className="text-gray-300 font-bold">sarah_clerk</span> / <span className="text-gray-300 font-bold">password</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= MAIN RUNNING APPLICATION VIEW ================= */
                <div className="flex-1 flex min-h-0 bg-transparent">
                  
                  {/* --- SIDEBAR PANEL (CustomTkinter layout mimic) --- */}
                  <div className="w-[155px] bg-black/25 border-r border-white/10 p-3 flex flex-col justify-between shrink-0 select-none">
                    <div className="space-y-4">
                      {/* Brand & Badge */}
                      <div className="space-y-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <img 
                            src="/src/assets/images/python_world_logo_1783168975662.jpg" 
                            className="w-5 h-5 rounded-md border border-white/10 shadow-sm" 
                            alt="Logo" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-[11px] font-bold text-white tracking-tight font-mono">Python World</div>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-500/20">
                          <User className="h-2 w-2" />
                          {currentUser.username}
                        </div>
                      </div>

                      {/* Navigation tabs */}
                      <nav className="space-y-1.5">
                        <button
                          onClick={() => setSimulatorTab('inventory')}
                          className={`w-full text-left text-[11px] px-2 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                            simulatorTab === 'inventory' 
                              ? 'bg-blue-600/80 text-white shadow-md border border-blue-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Layers className="h-3.5 w-3.5 shrink-0" />
                          Inventory
                        </button>
                        <button
                          onClick={() => setSimulatorTab('sales')}
                          className={`w-full text-left text-[11px] px-2 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                            simulatorTab === 'sales' 
                              ? 'bg-blue-600/80 text-white shadow-md border border-blue-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Activity className="h-3.5 w-3.5 shrink-0" />
                          Record Sale
                        </button>
                        <button
                          onClick={() => setSimulatorTab('history')}
                          className={`w-full text-left text-[11px] px-2 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                            simulatorTab === 'history' 
                              ? 'bg-blue-600/80 text-white shadow-md border border-blue-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
                          Sales Log
                        </button>
                        <button
                          onClick={() => setSimulatorTab('reports')}
                          className={`w-full text-left text-[11px] px-2 py-2 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                            simulatorTab === 'reports' 
                              ? 'bg-blue-600/80 text-white shadow-md border border-blue-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                          Analytics
                        </button>
                      </nav>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-950/20 text-[11px] font-semibold transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>

                  {/* --- RIGHT INNER PANEL (The responsive tab screens) --- */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col min-h-0 bg-transparent">
                    
                    {/* ================= INVENTORY TAB ================= */}
                    {simulatorTab === 'inventory' && (
                      <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Inventory Database</h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => simulateExportCSV('inventory')}
                              className="text-[10px] bg-white/5 border border-white/10 text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-2.5 w-2.5 text-blue-400" />
                              Export CSV
                            </button>
                          </div>
                        </div>

                        {/* Search & filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search item..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 text-[11px] text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"
                            />
                          </div>
                          <div>
                            <select
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all cursor-pointer"
                            >
                              {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Bottom half: list table on left, editor on right */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-3 min-h-0">
                          
                          {/* Products Table (Treeview) */}
                          <div className="xl:col-span-3 bg-black/25 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[160px] max-h-[220px] xl:max-h-none overflow-y-auto shadow-lg">
                            <table className="w-full text-[11px] text-left">
                              <thead className="bg-white/5 text-gray-400 border-b border-white/10 font-mono sticky top-0 z-10">
                                <tr>
                                  <th className="p-2 text-center w-8">ID</th>
                                  <th className="p-2">Name</th>
                                  <th className="p-2">Cat</th>
                                  <th className="p-2 text-center">Qty</th>
                                  <th className="p-2 text-right">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredProducts.map(p => {
                                  const isLowStock = p.quantity <= p.min_stock;
                                  return (
                                    <tr 
                                      key={p.id}
                                      onClick={() => handleProductSelect(p)}
                                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                                        selectedProduct?.id === p.id ? 'bg-blue-600/20 text-white' : ''
                                      }`}
                                    >
                                      <td className="p-2 font-mono text-center text-gray-500">{p.id}</td>
                                      <td className="p-2 font-semibold text-white truncate max-w-[90px]">{p.name}</td>
                                      <td className="p-2 text-gray-400 truncate max-w-[60px]">{p.category}</td>
                                      <td className={`p-2 text-center font-bold ${isLowStock ? 'text-red-400' : 'text-gray-300'}`}>
                                        {p.quantity}
                                        {isLowStock && <span className="text-[9px] block text-red-500 font-normal">LOW</span>}
                                      </td>
                                      <td className="p-2 text-right font-mono text-emerald-400 font-bold">${p.price.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                                {filteredProducts.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-500 font-mono">
                                      No products match search criteria.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* SQLite Product Editor form on right */}
                          <div className="xl:col-span-2 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 space-y-2.5 flex flex-col justify-between shrink-0 shadow-lg">
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex justify-between items-center border-b border-white/10 pb-1.5 mb-2">
                                <span>Product Editor</span>
                                <span className="text-blue-400 font-mono text-[9px]">
                                  {selectedProduct ? `Product ID: ${selectedProduct.id}` : '[New Product Record]'}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Product Name"
                                  value={formName}
                                  onChange={(e) => setFormName(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-all"
                                />
                                <input
                                  type="text"
                                  placeholder="Category"
                                  value={formCategory}
                                  onChange={(e) => setFormCategory(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-all"
                                />
                                <div className="grid grid-cols-3 gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="Qty"
                                    value={formQuantity}
                                    onChange={(e) => setFormQuantity(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-all"
                                  />
                                  <input
                                    type="text"
                                    placeholder="$ Price"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-all"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Min Warn"
                                    value={formMinStock}
                                    onChange={(e) => setFormMinStock(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-[11px] text-white rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-all"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={handleSaveProduct}
                                  className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-semibold py-1.5 rounded transition-all cursor-pointer shadow-md shadow-emerald-950/10"
                                >
                                  Add / Save
                                </button>
                                <button
                                  onClick={handleClearForm}
                                  className="bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] py-1.5 rounded border border-white/5 transition-all cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>

                              <button
                                onClick={handleDeleteProduct}
                                disabled={!selectedProduct}
                                className={`w-full text-white text-[10px] font-semibold py-1.5 rounded transition-all flex items-center justify-center gap-1 ${
                                  selectedProduct 
                                    ? 'bg-red-600/80 hover:bg-red-600 cursor-pointer' 
                                    : 'bg-red-950/20 text-gray-600 cursor-not-allowed border border-white/5'
                                }`}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete Product Record
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= RECORD SALE TAB ================= */}
                    {simulatorTab === 'sales' && (
                      <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                        <div className="border-b border-white/10 pb-1.5">
                          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Store Checkout Terminal</h3>
                        </div>

                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-3 min-h-0">
                          {/* Products List panel */}
                          <div className="xl:col-span-3 bg-black/25 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[160px] max-h-[220px] xl:max-h-none overflow-y-auto shadow-lg">
                            <div className="bg-white/5 p-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-white/10 sticky top-0 z-10">
                              Select Item to Add to Receipt
                            </div>
                            <table className="w-full text-[11px] text-left">
                              <tbody>
                                {products.map(p => (
                                  <tr 
                                    key={p.id}
                                    onClick={() => handleSelectCheckoutProduct(p)}
                                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                                      activeCheckoutProduct?.id === p.id ? 'bg-blue-600/20 text-white' : ''
                                    }`}
                                  >
                                    <td className="p-3">
                                      <p className="font-semibold text-white">{p.name}</p>
                                      <p className="text-[10px] text-gray-500 font-mono">{p.category} • ID: {p.id}</p>
                                    </td>
                                    <td className="p-3 text-right">
                                      <p className="font-bold text-emerald-400 font-mono">${p.price.toFixed(2)}</p>
                                      <p className="text-[10px] text-gray-400">Stock: <span className={p.quantity <= p.min_stock ? 'text-red-400 font-bold' : ''}>{p.quantity}</span></p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Active receipt terminal on right */}
                          <div className="xl:col-span-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between shrink-0 shadow-lg">
                            <div className="space-y-4">
                              <div className="text-center pb-2 border-b border-white/10 space-y-1">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Receipt Invoice</h4>
                                <p className="text-[10px] text-gray-500 font-mono">Cashier ID: {currentUser.username}</p>
                              </div>

                              {activeCheckoutProduct ? (
                                <div className="space-y-3.5">
                                  <div className="text-center space-y-1">
                                    <p className="text-xs text-blue-400 font-bold">{activeCheckoutProduct.name}</p>
                                    <p className="text-[11px] text-gray-400">Unit Cost: ${activeCheckoutProduct.price.toFixed(2)}</p>
                                    <p className="text-[11px] text-gray-500 font-mono">Available Stock: {activeCheckoutProduct.quantity}</p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-400 block text-center font-bold">Units to Sell:</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max={activeCheckoutProduct.quantity}
                                      value={saleQuantity}
                                      onChange={(e) => setSaleQuantity(e.target.value)}
                                      className="w-24 mx-auto block bg-black/20 border border-white/10 hover:border-blue-500/40 focus:border-blue-500 focus:bg-black/40 text-center text-xs text-white font-bold rounded py-1.5 outline-none transition-all"
                                    />
                                  </div>

                                  <div className="bg-black/20 p-3 rounded-xl border border-white/10 text-center space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Receivable</p>
                                    <p className="text-lg font-bold text-emerald-400 font-mono">
                                      ${(activeCheckoutProduct.price * (parseInt(saleQuantity) || 0)).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-12 text-center text-gray-500 text-xs">
                                  Select an item from the inventory catalog to build sales receipt invoice.
                                </div>
                              )}
                            </div>

                            <button
                              onClick={handleExecuteSale}
                              disabled={!activeCheckoutProduct || activeCheckoutProduct.quantity === 0}
                              className={`w-full py-2.5 rounded-lg text-xs font-semibold shadow transition-all ${
                                activeCheckoutProduct && activeCheckoutProduct.quantity > 0
                                  ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white cursor-pointer'
                                  : 'bg-emerald-950/20 text-gray-600 cursor-not-allowed border border-white/5'
                              }`}
                            >
                              Confirm Sale & Record Transaction
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= SALES HISTORY TAB ================= */}
                    {simulatorTab === 'history' && (
                      <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Sales Ledger (SQLite Audit)</h3>
                          <button
                            onClick={() => simulateExportCSV('sales')}
                            className="text-[10px] bg-white/5 border border-white/10 text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-2.5 w-2.5 text-blue-400" />
                            Export Audit Log
                          </button>
                        </div>

                        {/* Audit Table */}
                        <div className="flex-1 bg-black/25 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[220px] overflow-y-auto shadow-lg">
                          <table className="w-full text-[11px] text-left">
                            <thead className="bg-white/5 text-gray-400 border-b border-white/10 font-mono sticky top-0">
                              <tr>
                                <th className="p-2.5 text-center w-12">Tx ID</th>
                                <th className="p-2.5">Product Name</th>
                                <th className="p-2.5 text-center">Units</th>
                                <th className="p-2.5 text-right">Revenue</th>
                                <th className="p-2.5">Processed By</th>
                                <th className="p-2.5 text-right">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sales.map(s => (
                                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="p-2.5 font-mono text-center text-gray-500">{s.id}</td>
                                  <td className="p-2.5 font-semibold text-white">{s.productName}</td>
                                  <td className="p-2.5 text-center text-gray-300 font-mono">{s.quantity}</td>
                                  <td className="p-2.5 text-right text-emerald-400 font-bold font-mono">${s.totalPrice.toFixed(2)}</td>
                                  <td className="p-2.5">
                                    <span className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-blue-400 font-bold font-mono">
                                      {s.username}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-right text-gray-400 font-mono text-[10px]">{s.date}</td>
                                </tr>
                              ))}
                              {sales.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                                    No transaction audit entries exist yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ================= REPORTS TAB ================= */}
                    {simulatorTab === 'reports' && (
                      <div className="flex-1 space-y-4">
                        <div className="border-b border-white/10 pb-1.5">
                          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Sales Analytics</h3>
                        </div>

                        {/* Top summary boxes */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 text-center space-y-1 shadow-md">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
                            <p className="text-sm font-extrabold text-[#4caf50] font-mono">${statsSummary.revenue.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 text-center space-y-1 shadow-md">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Units Sold</p>
                            <p className="text-sm font-extrabold text-[#ff9800] font-mono">{statsSummary.units}</p>
                          </div>
                          <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 text-center space-y-1 shadow-md">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Tx Audited</p>
                            <p className="text-sm font-extrabold text-[#00bcd4] font-mono">{statsSummary.transactions}</p>
                          </div>
                          <div className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-3 text-center space-y-1 shadow-md">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">SQLite Products</p>
                            <p className="text-sm font-extrabold text-[#9c27b0] font-mono">{statsSummary.totalProducts}</p>
                          </div>
                        </div>

                        {/* Inventory warnings */}
                        <div className="bg-red-950/20 backdrop-blur-md border border-red-500/20 rounded-xl p-3 space-y-2">
                          <h4 className="text-[11px] font-bold text-red-300 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Low Stock Alerts ({statsSummary.alertsCount})
                          </h4>
                          <div className="max-h-[100px] overflow-y-auto space-y-1.5">
                            {products.filter(p => p.quantity <= p.min_stock).map(p => (
                              <div key={p.id} className="flex justify-between items-center text-[10px] bg-red-950/40 border border-red-500/10 px-2 py-1 rounded">
                                <span className="text-red-200 font-semibold">{p.name}</span>
                                <span className="text-red-400 font-mono font-bold">Qty Left: {p.quantity} (Min Alert: {p.min_stock})</span>
                              </div>
                            ))}
                            {statsSummary.alertsCount === 0 && (
                              <p className="text-gray-500 text-[10px] text-center font-mono py-2">
                                All items in stock above warnings!
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Category split */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-3 space-y-2 shadow-md">
                          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Revenue Split by Category</h4>
                          <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                            {statsSummary.categoryShare.map(([cat, amount]) => (
                              <div key={cat} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
                                <span className="text-gray-300">{cat}</span>
                                <span className="text-emerald-400 font-mono font-semibold">${amount.toFixed(2)}</span>
                              </div>
                            ))}
                            {statsSummary.categoryShare.length === 0 && (
                              <p className="text-gray-500 text-[10px] text-center font-mono py-2">No category records found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER BANNER --- */}
      <footer className="bg-[#0a0b10]/60 backdrop-blur-xl border-t border-white/[0.08] px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 shrink-0 select-none relative">
        <p className="text-center md:text-left">
          © 2026 Python The World Desktop Creator. Built with 
          <span className="text-blue-400 font-semibold mx-1">Python CustomTkinter</span> & 
          <span className="text-blue-400 font-semibold ml-1">SQLite3</span>.
        </p>
        <p className="text-gray-500 font-mono mt-1 md:mt-0 text-[11px]">
          Designed with desk-first responsive layouts & architectural honesty.
        </p>
      </footer>
    </div>
  );
}
