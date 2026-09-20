import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import LiveTrackingMap from "../components/LiveTrackingMap";
import PayoutMethodModal from "../components/PayoutMethodModal";
import ErrorBoundary from "../components/ErrorBoundary";
import { SCRAP_CATEGORIES, CITIES } from "../data/scrapRatesData";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  SparklesIcon,
  TruckIcon,
  ArrowPathIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  XCircleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

function UserDashboardContent() {
  const { user } = useLogin();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTrackingPickup, setActiveTrackingPickup] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState({
    type: "upi",
    details: { upiId: "citizen@okhdfcbank" },
  });

  // Rates board state in dashboard
  const [ratesCity, setRatesCity] = useState("delhi-ncr");
  const [ratesCategory, setRatesCategory] = useState("all");
  const [rateSearch, setRateSearch] = useState("");
  const [liveCategories, setLiveCategories] = useState(SCRAP_CATEGORIES);

  useEffect(() => {
    api.get("/v1/rates", { params: { city: ratesCity } })
      .then((res) => {
        const rawCategories = res.data?.data?.categories || res.data?.data;
        if (Array.isArray(rawCategories) && rawCategories.length > 0) {
          setLiveCategories(rawCategories);
        }
      })
      .catch((err) => console.warn("Using local rates in dashboard:", err));
  }, [ratesCity]);

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await api.get("/v1/pickups");
      
      // Robust array extraction handling all nested schema variants
      const rawData =
        response.data?.data?.pickups ||
        response.data?.pickups ||
        response.data?.data ||
        response.data;

      const list = Array.isArray(rawData) ? rawData : [];
      setPickups(list);

      // Auto select the first in-progress or accepted pickup for tracking preview if available
      const ongoing = list.find((p) => p?.status === "in-progress" || p?.status === "accepted");
      if (ongoing) {
        setActiveTrackingPickup((prev) => prev || ongoing);
      }
    } catch (error) {
      console.error("Error fetching user pickups:", error);
      setFetchError("Unable to sync your scheduled pickups. Please check your network or try again.");
      toast.error("Could not sync live pickups.");
      setPickups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const handleCancelPickup = async (pickupId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled pickup?")) return;
    try {
      await api.patch(`/v1/pickups/${pickupId}/cancel`);
      toast.success("Pickup cancelled successfully.");
      fetchPickups();
      if (activeTrackingPickup?._id === pickupId) {
        setActiveTrackingPickup(null);
      }
    } catch (error) {
      console.error("Cancel pickup error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel pickup.");
    }
  };

  const safePickups = Array.isArray(pickups) ? pickups : [];

  // Metrics computation
  const completedPickups = safePickups.filter((p) => p?.status === "completed");
  const totalWeightRecycled = completedPickups.reduce((sum, p) => sum + (Number(p?.quantity) || 0), 0);
  const estimatedTotalEarned = totalWeightRecycled * 22; // approx average scrap rate
  const co2Offset = (totalWeightRecycled * 1.8).toFixed(1);
  const treesSaved = Math.max(0, Math.floor(totalWeightRecycled / 12));

  // Filter scrap items for dashboard quick rate card
  const dashboardScrapItems = useMemo(() => {
    return liveCategories.flatMap((category) => {
      if (ratesCategory !== "all" && category.id !== ratesCategory) return [];
      return (category.items || [])
        .filter((item) => {
          if (!rateSearch) return item.popular || ratesCategory !== "all";
          return (
            item.name.toLowerCase().includes(rateSearch.toLowerCase()) ||
            item.description?.toLowerCase().includes(rateSearch.toLowerCase())
          );
        })
        .map((item) => ({
          ...item,
          categoryName: category.name || category.title,
          categoryIcon: category.icon,
          effectivePrice:
            typeof item.effectivePrice === "number"
              ? item.effectivePrice
              : item.prices?.[ratesCity] ?? item.prices?.["delhi-ncr"] ?? item.price ?? 0,
        }));
    }).slice(0, 8);
  }, [liveCategories, ratesCategory, rateSearch, ratesCity]);

  const handleSellItem = (item) => {
    sessionStorage.setItem("scrapsaathi_preselected_items", `${item.name} (${item.unit})`);
    navigate("/sellWaste");
  };

  // Get active pickup
  const activePickups = safePickups.filter((p) => p?.status === "pending" || p?.status === "accepted" || p?.status === "in-progress");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Eco-Citizen Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name || "Scrap Eco Champion"}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track your scrap collector live on map, manage doorstep pickups, and monitor your ecological footprint.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPickups}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Pickups"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <Link
              to="/sellWaste"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-98"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Schedule New Pickup</span>
            </Link>
          </div>
        </div>

        {/* Graceful Degradation Error Banner if fetch failed */}
        {fetchError && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">{fetchError}</p>
                <p className="text-[11px] text-amber-300/80">Offline mode enabled. You can still schedule new pickups or retry.</p>
              </div>
            </div>
            <button
              onClick={fetchPickups}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer w-fit"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Environmental & Financial Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Scrap Recycled</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ♻️
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{totalWeightRecycled} <span className="text-xs font-bold text-slate-400">KG</span></p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">100% Diverted from Landfills</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">CO₂ Offset</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                🌍
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-teal-300">{co2Offset} <span className="text-xs font-bold text-slate-400">KG</span></p>
            <p className="text-[11px] text-teal-400 font-semibold mt-1">Atmospheric Carbon Saved</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Trees Preserved</span>
              <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
                🌳
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-green-300">{treesSaved} <span className="text-xs font-bold text-slate-400">Trees</span></p>
            <p className="text-[11px] text-green-400 font-semibold mt-1">Deforestation Reduced</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Cashouts</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">₹{estimatedTotalEarned}</p>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="text-[11px] text-slate-400 hover:text-emerald-400 underline font-semibold mt-1 cursor-pointer"
            >
              Payout Mode: <span className="uppercase text-emerald-400 font-bold">{payoutMethod.type}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Live Map Tracking Section */}
        {activePickups.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <TruckIcon className="w-6 h-6 text-emerald-400" />
                  <span>Live Doorstep Collector Tracking</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Real-time GPS vehicle coordinates, live ETA calculation, route line, and instant executive contact.
                </p>
              </div>

              {/* Active Pickup Selector Buttons if multiple */}
              {activePickups.length > 1 && (
                <div className="flex gap-2">
                  {activePickups.map((p, idx) => (
                    <button
                      key={p?._id || idx}
                      onClick={() => setActiveTrackingPickup(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTrackingPickup?._id === p?._id
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      Pickup #{idx + 1} ({p?.wasteType})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-slate-800 border border-slate-800 shadow-2xl">
              <LiveTrackingMap
                pickup={activeTrackingPickup || activePickups[0]}
                collectorName="Ramesh Kumar (Verified Partner)"
                collectorPhone="+91 98765 43210"
                vehicleNumber="DL 3S AB 4492 (Electric Eco-Van)"
              />
            </div>
          </div>
        ) : null}

        {/* Today's Live Scrap Rates Board */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Live Scrap Rate Index</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <CurrencyRupeeIcon className="w-6 h-6 text-emerald-400" />
                <span>Today's Verified Scrap Market Rates</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Highest doorstep rates with certified digital scales & instant payment on pickup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* City Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {CITIES.slice(0, 2).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setRatesCity(city.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ratesCity === city.id
                        ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              <Link
                to="/rates"
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Full Rate Card & Calculator</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search scrap item (e.g. Iron, Newspaper, AC, Copper)..."
                value={rateSearch}
                onChange={(e) => setRateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setRatesCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  ratesCategory === "all"
                    ? "bg-emerald-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Popular
              </button>
              {liveCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRatesCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                    ratesCategory === cat.id
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrap Rates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {dashboardScrapItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 bg-slate-900 rounded-xl border border-slate-800/80 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Rate</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">
                      ₹{item.effectivePrice}/{item.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSellItem(item)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Sell this item"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled & Active Pickups Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Pickups List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center justify-between">
              <span>Active Scheduled Pickups ({activePickups.length})</span>
            </h3>

            {activePickups.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                  📦
                </div>
                <p className="text-sm font-bold text-slate-300">No active pickup requests right now</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Have recyclable waste at home? Schedule an instant doorstep pickup and earn top market rates.
                </p>
                <Link
                  to="/sellWaste"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors"
                >
                  <span>Book Pickup Now</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activePickups.map((pickup, idx) => {
                  const isSelectedForTracking = activeTrackingPickup?._id === pickup?._id;
                  return (
                    <div
                      key={pickup?._id || idx}
                      className={`p-5 rounded-3xl border transition-all ${
                        isSelectedForTracking
                          ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm">
                            📦
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {pickup?.wasteType || "Recyclable Scrap"} {pickup?.subcategory ? `• ${pickup.subcategory}` : ""}
                            </h4>
                            <p className="text-xs text-slate-400">
                              Estimated: <strong className="text-white">{pickup?.quantity || 0} {pickup?.unit || "kg"}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              pickup?.status === "in-progress"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                : pickup?.status === "accepted"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {pickup?.status || "pending"}
                          </span>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl mb-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Date: <strong className="text-slate-200">{pickup?.scheduledDate ? new Date(pickup.scheduledDate).toLocaleDateString() : (pickup?.createdAt ? new Date(pickup.createdAt).toLocaleDateString() : "Scheduled")}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Slot: <strong className="text-slate-200">{pickup?.preferredTimeSlot || "Morning"}</strong></span>
                        </div>
                        <div className="sm:col-span-2 flex items-start gap-1.5 pt-1 border-t border-slate-800">
                          <MapPinIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="truncate text-slate-300">{pickup?.address || "Address provided"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => setActiveTrackingPickup(pickup)}
                          className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <TruckIcon className="w-4 h-4 text-emerald-400" />
                          <span>View on Live Map</span>
                        </button>

                        {pickup?._id && (
                          <button
                            onClick={() => handleCancelPickup(pickup._id)}
                            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Pickups & Digital Receipts */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center justify-between">
              <span>Recycling History & Receipts ({completedPickups.length})</span>
            </h3>

            {completedPickups.length === 0 ? (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
                Completed pickups and digital cashout invoices will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {completedPickups.map((history, idx) => (
                  <div
                    key={history?._id || idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">
                        {history?.wasteType || "Scrap"} ({history?.quantity || 0} {history?.unit || "kg"})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {history?.completedAt ? new Date(history.completedAt).toLocaleDateString() : (history?.createdAt ? new Date(history.createdAt).toLocaleDateString() : "Settled")} • Doorstep Settled
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">
                        +₹{(Number(history?.quantity) || 1) * 20}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        UPI Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Tips Box */}
            <div className="p-5 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                <CheckBadgeIcon className="w-4 h-4" />
                <span>Doorstep Payout Safety Tip</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Always ensure the scrap collector resets the digital scale to 0.00 KG before weighing. Receive payment directly into your UPI or Cash before sharing the pickup verification code.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Payout Method Modal */}
      <PayoutMethodModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSelect={(selected) => setPayoutMethod(selected)}
        currentMethod={payoutMethod}
        estimatedAmount={estimatedTotalEarned}
      />
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ErrorBoundary>
      <UserDashboardContent />
    </ErrorBoundary>
  );
}