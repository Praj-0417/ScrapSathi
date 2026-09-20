import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import LocationPickerMap from "../components/LocationPickerMap";
import PayoutMethodModal from "../components/PayoutMethodModal";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PhotoIcon,
  ScaleIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  TruckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Category quick estimates per KG/unit
const CATEGORY_RATES = {
  "Paper & Cardboard": { rate: 15, unit: "kg", icon: "📰", example: "Newspaper, books, corrugated boxes" },
  "Metals & Utensils": { rate: 38, unit: "kg", icon: "🔩", example: "Iron, aluminium, brass, copper" },
  "Large Appliances": { rate: 850, unit: "piece", icon: "❄️", example: "Split/Window AC, Refrigerator, Washing Machine" },
  "IT & E-Waste": { rate: 45, unit: "kg", icon: "💻", example: "Laptops, CPUs, monitors, wires" },
  "Vehicle Scrap": { rate: 2500, unit: "vehicle", icon: "🛵", example: "Two wheelers, bicycles, car batteries" },
  "Plastic & Bottles": { rate: 12, unit: "kg", icon: "🧴", example: "PET bottles, hard plastic, HDPE containers" },
  "Multiple / Mixed Scrap": { rate: 22, unit: "kg", icon: "📦", example: "Assorted household recyclable scrap" },
};

export default function SellWaste() {
  const navigate = useNavigate();
  const { user } = useLogin();

  const [formData, setFormData] = useState({
    wasteType: "Paper & Cardboard",
    subcategory: "",
    quantity: "15",
    address: "",
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    preferredTimeSlot: "Morning (9 AM - 1 PM)",
    phone: "",
    notes: "",
  });

  // Coordinates from interactive map (Defaulting to New Delhi center)
  const [coordinates, setCoordinates] = useState({
    lat: 28.6139,
    lng: 77.2090,
    address: "",
  });

  const [showMap, setShowMap] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState({
    type: "upi",
    details: { upiId: "citizen@okhdfcbank" },
  });

  // Prepopulate from session storage if coming from Quick Hero or Rates Calculator
  useEffect(() => {
    const quickMobile = sessionStorage.getItem("scrapsaathi_quick_mobile");
    const preselectedItems = sessionStorage.getItem("scrapsaathi_preselected_items");

    if (quickMobile) {
      setFormData((prev) => ({ ...prev, phone: quickMobile }));
      sessionStorage.removeItem("scrapsaathi_quick_mobile");
    }
    if (preselectedItems) {
      setFormData((prev) => ({
        ...prev,
        subcategory: preselectedItems,
        wasteType: "Multiple / Mixed Scrap",
      }));
      sessionStorage.removeItem("scrapsaathi_preselected_items");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setCoordinates({
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
    });
    if (loc.address) {
      setFormData((prev) => ({
        ...prev,
        address: loc.address,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Estimated payout calculation
  const currentCategory = CATEGORY_RATES[formData.wasteType] || { rate: 15, unit: "kg" };
  const estimatedPayout = Math.round((Number(formData.quantity) || 0) * currentCategory.rate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      toast.error("Please pin your location on the map or type your full address");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error("Please enter an estimated quantity");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("wasteType", formData.wasteType);
      payload.append("subcategory", formData.subcategory || formData.wasteType);
      payload.append("quantity", formData.quantity);
      payload.append("unit", currentCategory.unit === "piece" ? "unit" : "kg");
      payload.append("address", formData.address);
      payload.append("preferredTimeSlot", formData.preferredTimeSlot);
      payload.append("scheduledDate", formData.scheduledDate);
      payload.append("latitude", coordinates.lat);
      payload.append("longitude", coordinates.lng);
      if (imageFile) {
        payload.append("photo", imageFile);
      }

      const response = await api.post("/v1/pickups", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Pickup scheduled successfully! Track your collector live on the dashboard.");
      navigate("/individual-dashboard");
    } catch (error) {
      console.error("Pickup submission error:", error);
      toast.error(error.response?.data?.message || "Failed to schedule pickup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-28 pb-20 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Glow */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Real-Time Doorstep Pickup & GPS Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Schedule Scrap Pickup
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Pin your home on the interactive map, select your doorstep payout method, and our verified green collector will arrive with an ISO certified digital scale.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form & Map Column */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-7">
              
              {/* Step 1: Precision Doorstep Location Pinning */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                    <MapPinIcon className="w-4 h-4" />
                    Step 1: Pin Exact Home Location on Map
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs text-slate-400 hover:text-emerald-400 font-semibold underline transition-colors cursor-pointer"
                  >
                    {showMap ? "Hide Map" : "Show Map"}
                  </button>
                </div>

                {showMap && (
                  <div className="transition-all duration-300">
                    <LocationPickerMap
                      initialLat={coordinates.lat}
                      initialLng={coordinates.lng}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Doorstep Address & Society / Landmark
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Flat No, Apartment name, Street, Landmark, City & Pincode"
                    className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Selected GPS Coordinates: <strong className="text-emerald-300 font-mono">[{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}]</strong></span>
                  </div>
                </div>
              </div>

              {/* Step 2: Scrap Categories & Estimated Weight */}
              <div className="space-y-4 pt-4 border-t border-slate-700/60">
                <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                  <ScaleIcon className="w-4 h-4" />
                  Step 2: Scrap Items & Estimated Quantity
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Primary Scrap Category
                    </label>
                    <select
                      name="wasteType"
                      value={formData.wasteType}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      {Object.keys(CATEGORY_RATES).map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_RATES[cat].icon} {cat} (₹{CATEGORY_RATES[cat].rate}/{CATEGORY_RATES[cat].unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Item Description / Details
                    </label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      placeholder={currentCategory.example}
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Estimated Weight / Count ({currentCategory.unit})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="0.5"
                        required
                        value={formData.quantity}
                        onChange={handleChange}
                        className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-base font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-emerald-400">
                        {currentCategory.unit.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Realtime Payout Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-emerald-400">Estimated Cashout</p>
                      <p className="text-xl font-black text-emerald-300">₹{estimatedPayout}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <span>Rate: ₹{currentCategory.rate}/{currentCategory.unit}</span>
                      <p className="text-emerald-400 font-bold">Instant Payout</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Date, Time Slot & Doorstep Payout Choice */}
              <div className="space-y-4 pt-4 border-t border-slate-700/60">
                <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Step 3: Schedule Slot & Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Preferred Time Slot
                    </label>
                    <select
                      name="preferredTimeSlot"
                      value={formData.preferredTimeSlot}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="Morning (9 AM - 1 PM)">🌅 Morning (9 AM - 1 PM)</option>
                      <option value="Afternoon (1 PM - 5 PM)">☀️ Afternoon (1 PM - 5 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">🌆 Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Doorstep Payout Method Selector */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">
                        Payout Method: <span className="text-emerald-400 uppercase">{payoutMethod.type}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {payoutMethod.type === "upi" ? `UPI: ${payoutMethod.details.upiId}` : payoutMethod.type === "cash" ? "Cash at Doorstep" : "Direct Bank IMPS"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Change Payout Mode
                  </button>
                </div>
              </div>

              {/* Step 4: Scrap Photo Upload (Optional) */}
              <div className="space-y-3 pt-4 border-t border-slate-700/60">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Upload Scrap Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-emerald-950/20 group">
                    <PhotoIcon className="w-7 h-7 mx-auto text-slate-500 group-hover:text-emerald-400 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 block">
                      Click to upload scrap photo (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-rose-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{loading ? "Confirming Coordinates & Booking..." : "Confirm & Schedule Doorstep Pickup"}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Guarantee, Rate Card, and Trust Badges */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payout & Scale Guarantee */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-700/70 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">ScrapSaathi Guarantee</h3>
                  <p className="text-xs text-slate-400">100% Transparent & Fair</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <ScaleIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">ISO Digital Scales</p>
                    <p className="text-slate-400">Zero scale manipulation. Calibrated & certified weighing scales.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <BanknotesIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Instant UPI on Spot</p>
                    <p className="text-slate-400">Payment sent to your UPI ID or cash in hand before the collector leaves.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <TruckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Live Vehicle Tracking</p>
                    <p className="text-slate-400">Watch the collector drive towards your doorstep on the live map in real time.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/rates"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>View All 50+ Real-Time Scrap Rates</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Environmental Impact Estimation Card */}
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 rounded-3xl p-6 border border-emerald-500/20 space-y-3">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                🌱 Your Ecological Contribution
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recycling <strong className="text-white">{formData.quantity || 15} {currentCategory.unit}</strong> of {formData.wasteType} prevents approx:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="text-lg font-black text-emerald-400">
                    {((Number(formData.quantity) || 15) * 1.8).toFixed(1)} kg
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">CO₂ Prevented</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="text-lg font-black text-emerald-400">
                    {Math.max(1, Math.floor((Number(formData.quantity) || 15) / 10))} Trees
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Equivalent Saved</p>
                </div>
              </div>
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
        estimatedAmount={estimatedPayout}
      />
    </div>
  );
}
