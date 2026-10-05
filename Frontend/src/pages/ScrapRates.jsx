import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SCRAP_CATEGORIES, CITIES } from "../data/scrapRatesData";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import { useLogin } from "../components/LoginContext";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TrashIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ScaleIcon,
  CurrencyRupeeIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ScrapRates() {
  const navigate = useNavigate();
  const { user, loggedIn } = useLogin();
  const isAdmin = loggedIn && (user?.role === "admin" || user?.role === "superAdmin" || user?.userType === "admin");

  const [selectedCity, setSelectedCity] = useState("delhi-ncr");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [calculatorBasket, setCalculatorBasket] = useState({});
  const [showCalculator, setShowCalculator] = useState(false);

  // Dynamic rates state from MongoDB
  const [categories, setCategories] = useState(SCRAP_CATEGORIES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSyncedWithDb, setIsSyncedWithDb] = useState(false);

  // Rate Editor Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCity, setEditCity] = useState("all");
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Fetch dynamic rates from MongoDB backend
  const fetchRates = async (silent = false) => {
    if (!silent) setIsLoadingRates(true);
    try {
      const res = await api.get("/v1/rates", {
        params: { city: selectedCity },
      });
      const rawCategories = res.data?.data?.categories || res.data?.data;
      if (Array.isArray(rawCategories) && rawCategories.length > 0) {
        setCategories(rawCategories);
        setIsSyncedWithDb(true);
      }
    } catch (err) {
      console.warn("Using local scrap rates fallback:", err);
      setIsSyncedWithDb(false);
    } finally {
      if (!silent) setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedCity]);

  // Helper to safely get price based on selected city or fallback
  const getItemPrice = (item) => {
    if (!item) return 0;
    if (typeof item.effectivePrice === "number") return item.effectivePrice;
    if (typeof item.price === "number") return item.price;
    if (item.prices) {
      return item.prices[selectedCity] ?? item.prices["delhi-ncr"] ?? Object.values(item.prices)[0] ?? 0;
    }
    return 0;
  };

  // Filter items
  const filteredCategories = useMemo(() => {
    return categories.map((category) => {
      if (selectedCategory !== "all" && category.id !== selectedCategory) {
        return null;
      }
      const matchingItems = (category.items || []).filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      if (matchingItems.length === 0) return null;

      return {
        ...category,
        items: matchingItems,
      };
    }).filter(Boolean);
  }, [categories, selectedCategory, searchQuery]);

  // Handle calculator items
  const handleUpdateQuantity = (itemId, change, itemObj) => {
    const price = getItemPrice(itemObj);
    setCalculatorBasket((prev) => {
      const current = prev[itemId] || { ...itemObj, price, qty: 0 };
      const newQty = Math.max(0, (current.qty || 0) + change);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: {
          ...itemObj,
          price,
          qty: newQty,
        },
      };
    });
  };

  const handleClearBasket = () => {
    setCalculatorBasket({});
  };

  // Compute total basket value
  const totalBasketValue = useMemo(() => {
    return Object.values(calculatorBasket).reduce((sum, item) => {
      const price = getItemPrice(item);
      return sum + item.qty * price;
    }, 0);
  }, [calculatorBasket, selectedCity, categories]);

  const totalBasketItems = useMemo(() => {
    return Object.values(calculatorBasket).reduce((sum, item) => sum + item.qty, 0);
  }, [calculatorBasket]);

  const handleProceedToSell = () => {
    const itemsList = Object.values(calculatorBasket);
    const itemSummary = itemsList
      .map((item) => `${item.qty} ${item.unit} ${item.name}`)
      .join(", ");

    if (itemsList.length > 0) {
      // Store full structured basket and city so SellWaste preserves exact items, weights and prices
      sessionStorage.setItem("scrapsaathi_selected_basket", JSON.stringify(calculatorBasket));
      sessionStorage.setItem("scrapsaathi_selected_city", selectedCity);
    }
    if (itemSummary) {
      sessionStorage.setItem("scrapsaathi_preselected_items", itemSummary);
    }
    navigate("/sellWaste", { state: { basket: calculatorBasket, city: selectedCity } });
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setEditPrice(getItemPrice(item).toString());
    setEditCity("all");
  };

  // Save Rate to Backend MongoDB (Admin Only)
  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Unauthorized: Only administrators can modify scrap rates.");
      setEditingItem(null);
      return;
    }

    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid non-negative rate");
      return;
    }

    setIsSavingRate(true);
    try {
      await api.patch("/v1/rates/item", {
        itemId: editingItem.id,
        price: numPrice,
        city: editCity === "all" ? undefined : editCity,
      });
      toast.success(`Updated ${editingItem.name} rate to ₹${numPrice}/${editingItem.unit}!`);
      setEditingItem(null);
      await fetchRates(true);
    } catch (err) {
      toast.error("Failed to update rate on server");
    } finally {
      setIsSavingRate(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #020d18 0%, #051a14 30%, #0a1628 60%, #071a1a 100%)",
      }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-float-slow absolute top-10 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              {isSyncedWithDb ? "● Live Market MongoDB Synced" : "Dynamic Scrap Market Rates"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Today's Scrap Rates &{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Price Calculator
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Get highest doorstep scrap value with accurate digital weighing scales & instant UPI payout.
          </p>

          {/* City Selection Bar & Live Refresh */}
          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-emerald-400" /> Select Location:
            </span>
            <div className="inline-flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  disabled={!city.active}
                  onClick={() => setSelectedCity(city.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCity === city.id
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : city.active
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchRates(false)}
              disabled={isLoadingRates}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-all flex items-center gap-1.5 text-xs font-bold shadow-lg cursor-pointer"
              title="Sync Latest Rates"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoadingRates ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">Refresh Rates</span>
            </button>
          </div>
        </div>

        {/* 4 Value Pillars Mini Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ScaleIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">ISO Certified Scales</h4>
              <p className="text-[11px] text-slate-400">Zero scale manipulation</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <CurrencyRupeeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Instant UPI Payout</h4>
              <p className="text-[11px] text-slate-400">GPay/PhonePe at door</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Verified Staff</h4>
              <p className="text-[11px] text-slate-400">Uniformed & trained</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-white text-xs">Free Doorstep Pickup</h4>
              <p className="text-[11px] text-slate-400">Zero hidden costs</p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search scrap item (e.g. Iron, Newspaper, AC, Copper)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-lg"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Summary Pill */}
            {totalBasketItems > 0 && (
              <button
                onClick={() => setShowCalculator(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Estimated Value: ₹{totalBasketValue} ({totalBasketItems} Items)</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name || cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rates Grid */}
        <div className="space-y-10">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-xl font-black text-white">{category.name || category.title}</h3>
                <span className="text-xs text-slate-400 ml-auto">
                  {(category.items || []).length} Items Listed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(category.items || []).map((item) => {
                  const qtyInBasket = calculatorBasket[item.id]?.qty || 0;
                  const currentPrice = getItemPrice(item);
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative group ${
                        qtyInBasket > 0
                          ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-emerald-400 shrink-0">
                              ₹{currentPrice}/{item.unit}
                            </span>
                            {/* Live Quick Edit Rate Button (Admin Only) */}
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Update live price in database (Admin Only)"
                                className="opacity-60 hover:opacity-100 hover:text-emerald-400 text-slate-400 transition-opacity p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                              >
                                <PencilSquareIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                      </div>

                      {/* Quantity Adder */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-bold text-slate-400">Estimate Price:</span>
                        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1, item)}
                            disabled={qtyInBasket === 0}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-400">
                            {qtyInBasket}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1, item)}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Quick Sell CTA if items added */}
        {totalBasketItems > 0 && (
          <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-40 bg-slate-900 border border-emerald-500/50 p-4 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-6">
            <div>
              <p className="text-xs text-slate-400 font-semibold">Total Estimated Payout</p>
              <p className="text-xl font-black text-emerald-400">₹{totalBasketValue}</p>
            </div>
            <button
              onClick={handleProceedToSell}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Book Pickup with Items</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Rate Editor Modal (Admin Only) */}
        {isAdmin && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <PencilSquareIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Live Rate Editor</h3>
                    <p className="text-[11px] text-slate-400">{editingItem.name} ({editingItem.unit})</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target City Scope
                  </label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">Global Base Price (All Cities)</option>
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} Specific Rate
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    New Rate (₹ per {editingItem.unit})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      placeholder="e.g. 35"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Updates will sync immediately to MongoDB and reflect for all users & quotes.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRate}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingRate ? "Saving to DB..." : "Update Live Rate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
