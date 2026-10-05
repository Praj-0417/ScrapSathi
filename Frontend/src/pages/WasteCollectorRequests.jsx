import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  XCircle,
  Truck,
  Scale,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function WasteCollectorRequests() {
  const { user } = useLogin();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.allSettled([
        api.get("/v1/collector/pickups/available"),
        api.get("/v1/collector/pickups"),
      ]);

      let combined = [];

      if (availRes.status === "fulfilled") {
        const raw =
          availRes.value.data?.data?.pickups ||
          availRes.value.data?.pickups ||
          availRes.value.data?.data ||
          availRes.value.data;
        if (Array.isArray(raw)) combined = [...combined, ...raw];
      }

      if (myRes.status === "fulfilled") {
        const raw =
          myRes.value.data?.data?.pickups ||
          myRes.value.data?.pickups ||
          myRes.value.data?.data ||
          myRes.value.data;
        if (Array.isArray(raw)) {
          // Avoid duplicate IDs
          const existingIds = new Set(combined.map((c) => c._id));
          const uniqueMy = raw.filter((p) => !existingIds.has(p._id));
          combined = [...combined, ...uniqueMy];
        }
      }

      const active = combined.filter((r) => r.status !== "completed");
      setRequests(active);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Could not sync live requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.post(`/v1/collector/pickups/${requestId}/accept`);
      toast.success("Request accepted! Navigation and contact ready.");
      fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error.response?.data?.message || "Failed to accept pickup.");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelAcceptedRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.post(`/v1/collector/pickups/${requestId}/cancel`);
      toast.info("Pickup cancelled and released back to available board.");
      fetchRequests();
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error(error.response?.data?.message || "Failed to cancel request.");
    } finally {
      setActionLoading(null);
    }
  };

  const markAsCompleted = async (requestId, quantity) => {
    setActionLoading(requestId);
    try {
      const actualWeight = Number(quantity) || 10;
      const paidAmount = actualWeight * 20;
      await api.post(`/v1/collector/pickups/${requestId}/complete`, {
        actualWeight,
        paidAmount,
      });
      toast.success("Pickup completed and doorstep payment settled!");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Error completing request:", error);
      toast.error(error.response?.data?.message || "Failed to complete pickup.");
    } finally {
      setActionLoading(null);
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "in-progress" && b.status !== "in-progress") return -1;
    if (a.status === "accepted" && b.status !== "accepted") return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collector Job Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Scrap Collection Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active neighborhood bookings waiting for inspection, doorstep weighing, and pickup.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <Link
              to="/collector-dashboard"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-98"
            >
              <Truck className="w-4 h-4" />
              <span>Full Route Map</span>
            </Link>
          </div>
        </div>

        {/* Requests List */}
        {loading && requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
            Loading live pickup requests...
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm space-y-2">
            <p className="text-base font-bold text-slate-300">No active pickup requests right now.</p>
            <p className="text-xs text-slate-500">
              New customer requests will show up automatically. Keep your phone notifications on!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRequests.map((req) => {
              const customerName = req.user?.name || "Scrap Citizen";
              const customerPhone = req.user?.phone || req.phone || "";
              const lat = req?.location?.coordinates?.[1] || 28.6139;
              const lng = req?.location?.coordinates?.[0] || 77.209;
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

              return (
                <div
                  key={req._id}
                  className={`p-6 rounded-3xl border transition-all shadow-xl space-y-4 ${
                    req.status === "accepted" || req.status === "in-progress"
                      ? "bg-slate-900/90 border-emerald-500/40"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          req.status === "accepted" || req.status === "in-progress"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {req.status || "Pending"}
                      </span>
                      <span className="text-xs text-slate-400">
                        Slot: <strong className="text-white">{req.preferredTimeSlot || "Morning"}</strong>
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {req.scheduledDate
                        ? new Date(req.scheduledDate).toLocaleDateString()
                        : "Scheduled Today"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-white">{customerName}</h3>
                      <p className="text-xs text-slate-300 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req.address || "Address provided upon acceptance"}</span>
                      </p>
                      {customerPhone && (
                        <p className="text-xs text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{customerPhone}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Waste Material:</span>
                        <strong className="text-emerald-300">{req.wasteType || "Mixed Recyclables"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Weight:</span>
                        <strong className="text-white">
                          {req.quantity || 0} {req.unit || "kg"}
                        </strong>
                      </div>
                      {req.estimatedPrice && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. Payout:</span>
                          <strong className="text-emerald-400">₹{req.estimatedPrice}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={actionLoading === req._id}
                        className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Pickup</span>
                      </button>
                    )}

                    {(req.status === "accepted" || req.status === "in-progress") && (
                      <>
                        <button
                          onClick={() => markAsCompleted(req._id, req.quantity)}
                          disabled={actionLoading === req._id}
                          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          <Scale className="w-4 h-4" />
                          <span>Weigh & Settle Payment</span>
                        </button>
                        <button
                          onClick={() => cancelAcceptedRequest(req._id)}
                          disabled={actionLoading === req._id}
                          className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Release Job</span>
                        </button>
                      </>
                    )}

                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone.replace(/\s+/g, "")}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>Call Customer</span>
                      </a>
                    )}

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>GPS Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
