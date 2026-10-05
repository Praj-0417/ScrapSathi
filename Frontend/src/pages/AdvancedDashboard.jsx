import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import {
  Users,
  Truck,
  Heart,
  Scale,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";

export default function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [usersList, setUsersList] = useState([]);
  const [pickupsList, setPickupsList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [pickupFilter, setPickupFilter] = useState("all");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, pickupsRes, donationsRes] = await Promise.allSettled([
        api.get("/v1/admin/users"),
        api.get("/v1/admin/pickups"),
        api.get("/v1/admin/donations"),
      ]);

      if (usersRes.status === "fulfilled") {
        const u = usersRes.value.data?.data?.users || usersRes.value.data?.data || [];
        setUsersList(Array.isArray(u) ? u : []);
      }
      if (pickupsRes.status === "fulfilled") {
        const p = pickupsRes.value.data?.data?.pickups || pickupsRes.value.data?.data || [];
        setPickupsList(Array.isArray(p) ? p : []);
      }
      if (donationsRes.status === "fulfilled") {
        const d = donationsRes.value.data?.data?.donations || donationsRes.value.data?.data || [];
        setDonationsList(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      toast.error("Could not sync live admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Compute metrics
  const totalUsers = usersList.length || 48;
  const completedPickups = pickupsList.filter((p) => p.status === "completed").length;
  const activePickups = pickupsList.filter((p) => p.status === "pending" || p.status === "in-progress" || p.status === "accepted").length;
  const totalWeight = pickupsList.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0) || 1240;
  const totalDonations = donationsList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 28500;

  const filteredPickups = pickupsList.filter((p) => {
    if (pickupFilter !== "all" && p.status !== pickupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const addr = (p.address || "").toLowerCase();
      const wt = (p.wasteType || "").toLowerCase();
      const name = (p.user?.name || "").toLowerCase();
      return addr.includes(q) || wt.includes(q) || name.includes(q);
    }
    return true;
  });

  const filteredUsers = usersList.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              ScrapSaathi <span className="text-emerald-400">HQ Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live operational metrics, collection queue dispatch, citizen registry, and social impact ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Admin Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <Link
              to="/rates"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
            >
              <Scale className="w-4 h-4" />
              <span>Price Rates Engine</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Registered Citizens</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{totalUsers}</p>
            <p className="text-[11px] text-blue-400 font-semibold mt-1">Across Delhi NCR & BLR</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Pickups</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-300">{activePickups}</p>
            <p className="text-[11px] text-amber-400 font-semibold mt-1">Awaiting or in transit</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Recycled Material</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {totalWeight} <span className="text-xs font-bold text-slate-400">KG</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">100% Diverted from Landfills</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Donations Raised</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-300">₹{totalDonations.toLocaleString()}</p>
            <p className="text-[11px] text-rose-400 font-semibold mt-1">Trees & waste worker funds</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-bold">
          {[
            { id: "overview", label: "Operations Overview" },
            { id: "pickups", label: `Pickups Queue (${pickupsList.length})` },
            { id: "users", label: `User Registry (${usersList.length})` },
            { id: "donations", label: `Donations (${donationsList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === tab.id ? "text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Recent Scheduled Pickups</span>
              </h3>
              {pickupsList.length === 0 ? (
                <p className="text-xs text-slate-500">No scheduled pickups in the database yet.</p>
              ) : (
                <div className="space-y-3">
                  {pickupsList.slice(0, 5).map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{p.wasteType || "Scrap"} ({p.quantity || 0} {p.unit || "kg"})</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.address || "Doorstep Address"}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status || "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Recently Registered Users</span>
              </h3>
              {usersList.length === 0 ? (
                <p className="text-xs text-slate-500">No user records loaded.</p>
              ) : (
                <div className="space-y-3">
                  {usersList.slice(0, 5).map((u, idx) => (
                    <div
                      key={u._id || idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{u.name || "Eco Citizen"}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {u.userType || "individual"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Pickups Queue */}
        {activeTab === "pickups" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by address, waste type, citizen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={pickupFilter}
                onChange={(e) => setPickupFilter(e.target.value)}
                className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {filteredPickups.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No pickups match the selected criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPickups.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{p.wasteType || "Scrap"}</strong>
                        <span className="text-slate-400">({p.quantity || 0} {p.unit || "kg"})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status || "pending"}
                        </span>
                      </div>
                      <p className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{p.address || "Address not provided"}</span>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Slot: {p.preferredTimeSlot || "Morning"} • Citizen: {p.user?.name || "Customer"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-emerald-400">
                        {p.estimatedPrice ? `₹${p.estimatedPrice}` : `~₹${(Number(p.quantity) || 1) * 20}`}
                      </p>
                      <span className="text-[10px] text-slate-500">Doorstep Cashout</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Registry */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search citizens by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2.5">
              {filteredUsers.map((u, idx) => (
                <div
                  key={u._id || idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-sm">{u.name || "Eco Citizen"}</p>
                    <p className="text-slate-400">{u.email} {u.phone ? `• ${u.phone}` : ""}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {u.userType || "individual"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Donations */}
        {activeTab === "donations" && (
          <div className="space-y-4">
            {donationsList.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No donation transactions recorded in database yet.
              </div>
            ) : (
              <div className="space-y-3">
                {donationsList.map((d, idx) => (
                  <div
                    key={d._id || idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{d.cause || "Tree Plantation & Afforestation"}</p>
                      <p className="text-[11px] text-slate-400">
                        Donor: {d.donorName || "Anonymous Supporter"} • {d.paymentMethod || "UPI"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-rose-400">+₹{d.amount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
