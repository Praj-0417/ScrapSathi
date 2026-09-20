import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import ErrorBoundary from "../components/ErrorBoundary";
import CollectorRouteMap from "../components/CollectorRouteMap";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function WasteCollectorDashboardContent() {
  const { user } = useLogin();
  const [availablePickups, setAvailablePickups] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Weighing Scale Completion Modal
  const [completingPickup, setCompletingPickup] = useState(null);
  const [actualWeight, setActualWeight] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [availRes, myRes] = await Promise.allSettled([
        api.get("/v1/collector/pickups/available"),
        api.get("/v1/collector/pickups"),
      ]);

      if (availRes.status === "fulfilled") {
        const raw =
          availRes.value.data?.data?.pickups ||
          availRes.value.data?.pickups ||
          availRes.value.data?.data ||
          availRes.value.data;
        setAvailablePickups(Array.isArray(raw) ? raw : []);
      }
      if (myRes.status === "fulfilled") {
        const raw =
          myRes.value.data?.data?.pickups ||
          myRes.value.data?.pickups ||
          myRes.value.data?.data ||
          myRes.value.data;
        setMyPickups(Array.isArray(raw) ? raw : []);
      }
    } catch (error) {
      console.error("Collector dashboard data error:", error);
      setFetchError("Unable to load collector jobs. Please try refreshing.");
      toast.error("Could not sync collector tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/v1/collector/pickups/${id}/accept`);
      toast.success("Pickup accepted! Route navigation is ready.");
      fetchData();
    } catch (error) {
      console.error("Accept error:", error);
      toast.error(error.response?.data?.message || "Failed to accept pickup.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingPickup) return;
    setActionLoading(completingPickup._id);
    try {
      await api.post(`/v1/collector/pickups/${completingPickup._id}/complete`, {
        actualQuantity: Number(actualWeight) || Number(completingPickup.quantity),
        amountPaid: Number(paidAmount) || (Number(actualWeight) || Number(completingPickup.quantity)) * 20,
      });
      toast.success("Pickup completed & digital receipt generated!");
      setCompletingPickup(null);
      setActualWeight("");
      setPaidAmount("");
      fetchData();
    } catch (error) {
      console.error("Complete error:", error);
      toast.error(error.response?.data?.message || "Failed to complete pickup.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelPickup = async (id) => {
    if (!window.confirm("Release this pickup back to the pool?")) return;
    setActionLoading(id);
    try {
      await api.post(`/v1/collector/pickups/${id}/cancel`);
      toast.info("Pickup released back to available pool.");
      fetchData();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel.");
    } finally {
      setActionLoading(null);
    }
  };

  const safeMyPickups = Array.isArray(myPickups) ? myPickups : [];
  const safeAvailPickups = Array.isArray(availablePickups) ? availablePickups : [];

  const activeMyPickups = safeMyPickups.filter((p) => p?.status === "accepted" || p?.status === "in-progress");
  const completedMyPickups = safeMyPickups.filter((p) => p?.status === "completed");
  const totalCollectedKg = completedMyPickups.reduce((sum, p) => sum + (Number(p?.quantity) || 0), 0);
  const totalEarningsEst = completedMyPickups.length * 80 + totalCollectedKg * 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <TruckIcon className="w-3.5 h-3.5" />
              <span>Collector Field Operations</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Waste Partner Hub — <span className="text-emerald-400">{user?.name || "Green Executive"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              View nearby scrap pickups, navigate to customer doorsteps, and execute digital weighments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Tasks"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">{fetchError}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Assigned Active</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{activeMyPickups.length}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Doorsteps pending</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Nearby Available</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{safeAvailPickups.length}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">Ready for pickup claim</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Scrap Collected</span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{totalCollectedKg} <span className="text-xs text-slate-400">KG</span></p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Verified with digital scale</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Estimated Payout Earnings</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">₹{totalEarningsEst}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">Includes collector commission</p>
          </div>
        </div>

        {/* Live GPS Fleet Navigation & Customer Doorstep Map */}
        <div className="space-y-3">
          <CollectorRouteMap
            activePickups={safeMyPickups}
            availablePickups={safeAvailPickups}
            onAcceptPickup={handleAccept}
            onOpenSettleModal={(pickup) => {
              setCompletingPickup(pickup);
              setActualWeight(pickup?.quantity || "");
              setPaidAmount(((pickup?.quantity || 1) * 20).toString());
            }}
          />
        </div>

        {/* Active Route / Jobs in Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-emerald-400" />
            <span>My Active Doorstep Routes ({activeMyPickups.length})</span>
          </h2>

          {activeMyPickups.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              No pickups currently assigned to you. Claim available requests from the board below!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMyPickups.map((p, idx) => {
                const lat = p?.location?.coordinates?.[1] || 28.6139;
                const lng = p?.location?.coordinates?.[0] || 77.2090;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                return (
                  <div key={p?._id || idx} className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p?.status || "accepted"}
                      </span>
                      <span className="text-xs text-slate-400">
                        Slot: <strong className="text-white">{p?.preferredTimeSlot || "Morning"}</strong>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-white text-base">
                        {p?.wasteType || "Recyclable Scrap"} {p?.subcategory ? `• ${p.subcategory}` : ""}
                      </h3>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">
                        Est. Weight: {p?.quantity || 0} {p?.unit || "kg"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{p?.address || "Address provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Customer: <strong className="text-white">{p?.user?.name || "Scrap Citizen"}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-emerald-400" />
                        <span>Navigate GPS</span>
                      </a>

                      <button
                        onClick={() => {
                          setCompletingPickup(p);
                          setActualWeight(p?.quantity || "");
                          setPaidAmount(((p?.quantity || 1) * 20).toString());
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <ScaleIcon className="w-4 h-4" />
                        <span>Weigh & Settle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Neighborhood Pickups Board */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-emerald-400" />
            <span>Available Neighborhood Requests ({safeAvailPickups.length})</span>
          </h2>

          {safeAvailPickups.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              All neighborhood pickups have been accepted! Refresh periodically for new customer requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {safeAvailPickups.map((p, idx) => (
                <div key={p?._id || idx} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {p?.wasteType || "Scrap"}
                      </span>
                      <span className="text-slate-400">
                        {p?.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : (p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Today")}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-sm">
                      {p?.subcategory || p?.wasteType || "Scrap Items"}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      📍 {p?.address || "Customer location"}
                    </p>
                    <p className="text-xs font-bold text-emerald-400">
                      Est. Quantity: {p?.quantity || 0} {p?.unit || "kg"}
                    </p>
                  </div>

                  {p?._id && (
                    <button
                      onClick={() => handleAccept(p._id)}
                      disabled={actionLoading === p._id}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
                    >
                      <span>{actionLoading === p._id ? "Claiming..." : "Accept This Pickup"}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Weighing Scale & Completion Settlement Modal */}
      {completingPickup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ScaleIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">Digital Scale Weighment</h3>
              </div>
              <button
                onClick={() => setCompletingPickup(null)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Actual Certified Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  placeholder="e.g. 18.5"
                  className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-base font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Total Cashout Paid to Customer (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="e.g. 370"
                  className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-base font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-slate-300">
                <p className="font-bold text-emerald-400">✓ Instant Proof of Weighment</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Upon completion, the customer receives an instant digital receipt and carbon offset certificate.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingPickup(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === completingPickup._id}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {actionLoading === completingPickup._id ? "Settling..." : "Confirm & Settle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WasteCollectorDashboard() {
  return (
    <ErrorBoundary>
      <WasteCollectorDashboardContent />
    </ErrorBoundary>
  );
}