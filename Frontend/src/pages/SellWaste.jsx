import React, { useState, useEffect, useMemo } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import LocationPickerMap from "../components/LocationPickerMap";
import PayoutMethodModal from "../components/PayoutMethodModal";
import { SCRAP_CATEGORIES, CITIES } from "../data/scrapRatesData";
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
  TrashIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function SellWaste() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useLogin();

  // Selected City for Rates
  const [selectedCity, setSelectedCity] = useState("delhi-ncr");

  // Dynamic Categories and Live Rates (fetched or local fallback)
  const [categories, setCategories] = useState(SCRAP_CATEGORIES);

  // Search & Category Filter for Item Selector
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Items Manifest: { [itemId]: { id, name, categoryName, unit, rate, quantity, icon, description, isCustom } }
  const [selectedItems, setSelectedItems] = useState({
    newspaper: {
      id: "newspaper",
      name: "Newspaper",
      categoryName: "Normal Recyclables",
      unit: "kg",
      rate: 15,
      quantity: 10,
      icon: "🗞️",
      description: "Old newspapers, raddi",
    },
  });

  // Custom Scrap Item Modal / Toggle
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: "",
    quantity: "1",
    unit: "kg",
    estimatedRate: "",
  });

  // Main Form fields
  const [formData, setFormData] = useState({
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

  const [isServiceable, setIsServiceable] = useState(true);
  const [serviceLocationInfo, setServiceLocationInfo] = useState({
    serviceable: true,
    hub: "Delhi NCR",
  });

  const [showMap, setShowMap] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState({
    type: "upi",
    details: { upiId: user?.upiId || "citizen@okhdfcbank" },
  });

  // Helper to get item price based on city
  const getItemPrice = (item, cityId = selectedCity) => {
    if (!item) return 0;
    if (typeof item.effectivePrice === "number") return item.effectivePrice;
    if (typeof item.price === "number") return item.price;
    if (item.prices) {
      return item.prices[cityId] ?? item.prices["delhi-ncr"] ?? Object.values(item.prices)[0] ?? 0;
    }
    return 0;
  };

  // Fetch dynamic rates from backend if available
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get("/v1/rates", { params: { city: selectedCity } });
        const raw = res.data?.data?.categories || res.data?.data;
        if (Array.isArray(raw) && raw.length > 0) {
          setCategories(raw);
        }
      } catch {
        // Fallback to static SCRAP_CATEGORIES
      }
    };
    fetchRates();
  }, [selectedCity]);

  // Flatten all items across categories for fast lookup
  const allAvailableItems = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        list.push({
          ...item,
          categoryName: cat.name || cat.title || "Scrap",
          categoryId: cat.id,
          rate: getItemPrice(item),
        });
      });
    });
    return list;
  }, [categories, selectedCity]);

  // Pre-populate items from Price Calculator or Navigation state (seamlessly without annoying toasts)
  useEffect(() => {
    const stateBasket = location.state?.basket;
    const stateCity = location.state?.city;
    const storedBasket = sessionStorage.getItem("scrapsaathi_selected_basket");
    const storedCity = sessionStorage.getItem("scrapsaathi_selected_city");
    const quickMobile = sessionStorage.getItem("scrapsaathi_quick_mobile");
    const preselectedLegacy = sessionStorage.getItem("scrapsaathi_preselected_items");

    if (stateCity || storedCity) {
      setSelectedCity(stateCity || storedCity);
    }
    if (quickMobile) {
      setFormData((prev) => ({ ...prev, phone: quickMobile }));
      sessionStorage.removeItem("scrapsaathi_quick_mobile");
    }

    let basketToLoad = stateBasket;
    if (!basketToLoad && storedBasket) {
      try {
        basketToLoad = JSON.parse(storedBasket);
      } catch {
        basketToLoad = null;
      }
    }

    if (basketToLoad && Object.keys(basketToLoad).length > 0) {
      const formatted = {};
      Object.entries(basketToLoad).forEach(([key, item]) => {
        formatted[key] = {
          id: item.id || key,
          name: item.name,
          categoryName: item.categoryName || item.category || "Scrap",
          unit: item.unit || "kg",
          rate: Number(item.price || item.rate || getItemPrice(item)),
          quantity: Number(item.qty || item.quantity || 1),
          icon: item.icon || "📦",
          description: item.description || "",
        };
      });

      setSelectedItems(formatted);

      // Silently clean up after consuming — no intrusive banner or toast
      sessionStorage.removeItem("scrapsaathi_selected_basket");
      sessionStorage.removeItem("scrapsaathi_preselected_items");
      return;
    }

    // Handle legacy single-item string if someone clicked from quick card
    if (preselectedLegacy) {
      const lower = preselectedLegacy.toLowerCase();
      const matched = allAvailableItems.find((i) => lower.includes(i.name.toLowerCase()));
      if (matched) {
        setSelectedItems({
          [matched.id]: {
            id: matched.id,
            name: matched.name,
            categoryName: matched.categoryName,
            unit: matched.unit,
            rate: getItemPrice(matched),
            quantity: matched.unit === "unit" ? 1 : 10,
            icon: matched.icon,
            description: matched.description,
          },
        });
      } else {
        setFormData((prev) => ({ ...prev, notes: preselectedLegacy }));
      }
      sessionStorage.removeItem("scrapsaathi_preselected_items");
    }
  }, [allAvailableItems]);

  // Add an item to the selected manifest (+1 increment)
  const handleAddItem = (item) => {
    setSelectedItems((prev) => {
      const current = prev[item.id];
      const newQty = current ? Number(current.quantity) + 1 : 1;
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          categoryName: item.categoryName || "Scrap",
          unit: item.unit,
          rate: getItemPrice(item),
          quantity: newQty,
          icon: item.icon,
          description: item.description,
        },
      };
    });
  };

  // Update specific item quantity directly via input
  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    const qtyNum = parseFloat(newQuantity);
    setSelectedItems((prev) => {
      if (!prev[itemId]) return prev;
      if (isNaN(qtyNum) || qtyNum <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: qtyNum,
        },
      };
    });
  };

  // Stepper increment/decrement (+1 / -1)
  const handleStepQuantity = (itemId, delta) => {
    setSelectedItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const current = Number(item.quantity) || 0;
      const next = current + delta * 1;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: {
          ...item,
          quantity: Math.max(0.5, next),
        },
      };
    });
  };

  // Remove item from manifest
  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  // Add custom unlisted scrap (evaluation at home, optional matched estimated price)
  const handleAddCustomScrap = (e) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) {
      toast.error("Please enter scrap material name");
      return;
    }
    const qty = Number(customItemForm.quantity) > 0 ? Number(customItemForm.quantity) : 1;
    const estRate = customItemForm.estimatedRate ? Number(customItemForm.estimatedRate) : 0;
    const customId = `custom-${Date.now()}`;

    setSelectedItems((prev) => ({
      ...prev,
      [customId]: {
        id: customId,
        name: customItemForm.name.trim(),
        categoryName: "Custom / Unlisted Scrap",
        unit: customItemForm.unit,
        rate: estRate,
        isCustom: true,
        quantity: qty,
        icon: "📦",
        description: estRate > 0 ? `Expected ₹${estRate}/${customItemForm.unit} (Collector verification)` : "Evaluation at home by certified collector",
      },
    }));

    setCustomItemForm({ name: "", quantity: "1", unit: "kg", estimatedRate: "" });
    setShowCustomItem(false);
  };

  // Summary calculations
  const selectedItemsArray = Object.values(selectedItems);

  const totalEstimatedPayout = useMemo(() => {
    return Math.round(
      selectedItemsArray.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      }, 0)
    );
  }, [selectedItemsArray]);

  const hasCustomUnpricedItems = useMemo(() => {
    return selectedItemsArray.some((i) => i.isCustom && (!i.rate || i.rate === 0));
  }, [selectedItemsArray]);

  const totalWeightKg = useMemo(() => {
    return selectedItemsArray
      .filter((i) => i.unit === "kg")
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [selectedItemsArray]);

  const totalUnitsCount = useMemo(() => {
    return selectedItemsArray
      .filter((i) => i.unit === "unit")
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [selectedItemsArray]);

  // Filter items in the catalog picker
  const filteredCatalogItems = useMemo(() => {
    return allAvailableItems.filter((item) => {
      if (activeCategoryFilter !== "all" && item.categoryId !== activeCategoryFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q)
      );
    });
  }, [allAvailableItems, activeCategoryFilter, searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    const resolvedAddress = loc.address || loc.formattedAddress || "";
    setCoordinates({
      lat: loc.lat,
      lng: loc.lng,
      address: resolvedAddress,
    });
    if (typeof loc.serviceable === "boolean") {
      setIsServiceable(loc.serviceable);
      setServiceLocationInfo(loc);
    }
    if (resolvedAddress) {
      setFormData((prev) => ({
        ...prev,
        address: resolvedAddress,
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

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      toast.error("Please pin your location on the map or type your full address");
      return;
    }
    if (!isServiceable) {
      toast.error(
        "The selected address is outside our operational service hubs. ScrapSaathi currently operates in Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Jaipur, Lucknow, Kolkata, and Chennai."
      );
      return;
    }
    if (selectedItemsArray.length === 0) {
      toast.error("Please select at least one scrap item with quantity to schedule pickup");
      return;
    }

    setLoading(true);
    try {
      // Build structured wasteDetails array
      const wasteDetails = selectedItemsArray.map((item) => ({
        wasteType: item.categoryName || "Scrap",
        subcategory: item.name,
        quantity: Number(item.quantity),
        unit: item.unit === "unit" ? "pieces" : "kg",
      }));

      // Itemized summary string for subcategory & notes
      const subcategorySummary = selectedItemsArray
        .map((i) => {
          if (i.isCustom && (!i.rate || i.rate === 0)) {
            return `${i.quantity} ${i.unit} ${i.name} (Evaluation at Home)`;
          }
          return `${i.quantity} ${i.unit} ${i.name} (@₹${i.rate}/${i.unit})`;
        })
        .join(", ");

      const totalQuantity = totalWeightKg > 0 ? totalWeightKg : (totalUnitsCount || 1);

      const payload = new FormData();
      payload.append("wasteType", selectedItemsArray.length === 1 ? selectedItemsArray[0].name : "Multiple / Mixed Scrap");
      payload.append("subcategory", subcategorySummary);
      payload.append("quantity", String(totalQuantity));
      payload.append("unit", totalWeightKg > 0 ? "kg" : "pieces");
      payload.append("address", formData.address);
      payload.append("preferredTimeSlot", formData.preferredTimeSlot);
      payload.append("scheduledDate", formData.scheduledDate);
      payload.append("latitude", String(coordinates.lat));
      payload.append("longitude", String(coordinates.lng));
      payload.append("wasteDetails", JSON.stringify(wasteDetails));
      if (formData.notes) {
        payload.append("notes", formData.notes);
      }
      if (imageFile) {
        payload.append("photo", imageFile);
      }

      await api.post("/v1/pickups", payload, {
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
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Itemized Doorstep Scrap Pickup & Live Payout</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Schedule Scrap Pickup
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Select exact scrap items, specify weights, and get certified digital scale weighing with instant UPI payout at your doorstep.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* ── Step 1: Map & Doorstep Address ── */}
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-4">
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
                    initialLocation={[coordinates.lat, coordinates.lng]}
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
                  <span>
                    Selected GPS Coordinates:{" "}
                    <strong className="text-emerald-300 font-mono">
                      [{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}]
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Main Form (Step 2 onwards) ── */}
            <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-8">
              
              {/* Step 2: Itemized Scrap Selection & Weights */}
              <div className="space-y-6">
                
                {/* Section Header with City Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                      <ScaleIcon className="w-4 h-4" />
                      Step 2: Select Scrap Items & Individual Weights
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add each scrap type with its exact or estimated weight to see accurate itemized cashout.
                    </p>
                  </div>

                  {/* City Selector */}
                  <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700 shrink-0">
                    <MapPinIcon className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-2 cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id} disabled={!c.active} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── A) Live Selected Scrap Manifest (Receipt Breakdown) ── */}
                <div className="bg-slate-950/70 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                        {selectedItemsArray.length}
                      </div>
                      <h3 className="text-sm font-black text-white">
                        Your Scheduled Scrap Manifest ({selectedItemsArray.length} items)
                      </h3>
                    </div>

                    {selectedItemsArray.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedItems({})}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {selectedItemsArray.length === 0 ? (
                    <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                      <p className="text-sm font-bold text-slate-400">No scrap items added yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Browse the scrap categories below or search to add items with their respective quantities and rates.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedItemsArray.map((item) => {
                        const itemSubtotal = Math.round((Number(item.quantity) || 0) * (Number(item.rate) || 0));
                        return (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
                          >
                            {/* Left: Icon & Title */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl p-1 bg-slate-950 rounded-lg shrink-0">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                  {item.isCustom && (
                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                                      Evaluation at Home
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  {item.isCustom ? (
                                    item.rate > 0 ? (
                                      <span>
                                        Expected Rate: <strong className="text-emerald-400">₹{item.rate}/{item.unit}</strong> (Collector verification)
                                      </span>
                                    ) : (
                                      <span className="text-amber-300 font-medium">Rate determined upon inspection at home</span>
                                    )
                                  ) : (
                                    <>
                                      <span className="text-emerald-400 font-semibold">₹{item.rate}/{item.unit}</span>
                                      {item.categoryName && ` • ${item.categoryName}`}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Right: Quantity Stepper & Subtotal */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              
                              {/* Quantity Stepper Input (+1 / -1) */}
                              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => handleStepQuantity(item.id, -1)}
                                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                                  title="Decrease quantity by 1"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>

                                <input
                                  type="number"
                                  min="0.5"
                                  step="0.5"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItemQuantity(item.id, e.target.value)}
                                  className="w-14 text-center bg-transparent text-xs font-bold font-mono text-emerald-300 focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 pr-1">{item.unit}</span>

                                <button
                                  type="button"
                                  onClick={() => handleStepQuantity(item.id, 1)}
                                  className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center text-xs font-bold cursor-pointer"
                                  title="Increase quantity by 1"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Item Subtotal */}
                              <div className="text-right min-w-[75px]">
                                {item.isCustom && (!item.rate || item.rate === 0) ? (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 inline-block">
                                    At Home
                                  </span>
                                ) : (
                                  <span className="text-xs font-black text-emerald-400">
                                    ₹{itemSubtotal}
                                    {item.isCustom && item.rate > 0 && (
                                      <span className="text-[9px] text-slate-400 block font-normal">(Est.)</span>
                                    )}
                                  </span>
                                )}
                              </div>

                              {/* Remove Trash Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Manifest Totals Strip */}
                      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 text-slate-400">
                          {totalWeightKg > 0 && (
                            <span>
                              Total Weight: <strong className="text-white font-mono">{totalWeightKg} kg</strong>
                            </span>
                          )}
                          {totalUnitsCount > 0 && (
                            <span>
                              Appliances: <strong className="text-white font-mono">{totalUnitsCount} units</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold uppercase text-[11px]">Estimated Cashout:</span>
                          <span className="text-xl font-black text-emerald-300">
                            ₹{totalEstimatedPayout}
                            {hasCustomUnpricedItems && (
                              <span className="text-xs font-bold text-amber-400 ml-1.5">+ Evaluation at Home</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── B) Catalog Browser & Search (Add More Scrap) ── */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Browse & Add Scrap Items from Catalog
                    </span>
                    
                    {/* Search Input */}
                    <div className="relative max-w-xs w-full">
                      <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Iron, AC, Paper, Copper..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryFilter("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        activeCategoryFilter === "all"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      All ({allAvailableItems.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeCategoryFilter === cat.id
                            ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                            : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Catalog Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                    {filteredCatalogItems.map((item) => {
                      const isSelected = !!selectedItems[item.id];
                      const rate = getItemPrice(item);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? "bg-emerald-950/40 border-emerald-500/50"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl p-1 bg-slate-950 rounded-lg shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-300" : "text-white"}`}>
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                <strong className="text-emerald-400">₹{rate}/{item.unit}</strong>
                                {item.description && ` • ${item.description}`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                : "bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700"
                            }`}
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>{isSelected ? `+ 1 ${item.unit}` : `Add`}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Unlisted Custom Item Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomItem(!showCustomItem)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Have unlisted or mixed scrap? Add custom item for doorstep evaluation</span>
                    </button>

                    {showCustomItem && (
                      <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-fade-in shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔍</span>
                            <div>
                              <h4 className="text-xs font-black text-white">Add Custom Scrap Material</h4>
                              <p className="text-[11px] text-slate-400">Rate will be evaluated fairly by the collector at your home</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                            Evaluation at Home
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Material Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Copper Wire, Heavy Motors, Old Gate"
                              value={customItemForm.name}
                              onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Weight / Qty</label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              placeholder="Qty (e.g. 1)"
                              value={customItemForm.quantity}
                              onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: e.target.value })}
                              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Unit</label>
                            <select
                              value={customItemForm.unit}
                              onChange={(e) => setCustomItemForm({ ...customItemForm, unit: e.target.value })}
                              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                            >
                              <option value="kg">kg</option>
                              <option value="unit">unit/piece</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Expected Rate ₹ <span className="text-slate-500 font-normal">(optional)</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="Target price if known"
                              value={customItemForm.estimatedRate}
                              onChange={(e) => setCustomItemForm({ ...customItemForm, estimatedRate: e.target.value })}
                              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                          <p className="text-[11px] text-slate-400">
                            💡 Collector brings calibrated scale and matches market rate upon home inspection.
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setShowCustomItem(false)}
                              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddCustomScrap}
                              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              Add to Manifest
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Scrap Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Special Instructions / Heavy Machinery Details (optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. 3rd floor without elevator, bring trolley scale, large AC dismantling needed"
                    className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
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
                      className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
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
                        {payoutMethod.type === "upi"
                          ? `UPI: ${payoutMethod.details.upiId}`
                          : payoutMethod.type === "cash"
                          ? "Cash at Doorstep"
                          : "Direct Bank IMPS"}
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

              {/* Serviceability Warning Card if location is outside service hubs */}
              {!isServiceable && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    ⚠️
                  </div>
                  <div className="text-xs text-rose-200">
                    <p className="font-bold text-rose-300">Location Outside Active Service Area</p>
                    <p className="mt-0.5 text-rose-300/80 leading-relaxed">
                      ScrapSaathi currently only operates in <strong>Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Jaipur, Lucknow, Kolkata, and Chennai</strong>. Pickups cannot be scheduled in this area yet. Please select an address within one of our active cities.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || selectedItemsArray.length === 0 || !isServiceable}
                className={`w-full py-4 font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  !isServiceable
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white shadow-emerald-500/20"
                }`}
              >
                <span>
                  {loading
                    ? "Confirming Coordinates & Booking..."
                    : !isServiceable
                    ? "Location Outside Service Coverage — Select an Active City"
                    : `Confirm & Schedule Pickup (${selectedItemsArray.length} items • ₹${totalEstimatedPayout}${hasCustomUnpricedItems ? " + Evaluation at Home" : ""})`}
                </span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Guarantee, Rate Card, and Trust Badges */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Manifest Quick Card */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Estimated Doorstep Payout
                </span>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live Rates
                </span>
              </div>

              <div>
                <p className="text-4xl font-black text-white">
                  ₹{totalEstimatedPayout}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedItemsArray.length} item{selectedItemsArray.length !== 1 ? "s" : ""} selected • {totalWeightKg} kg estimated
                  {hasCustomUnpricedItems && <span className="text-amber-400 block font-semibold">+ Evaluation at Home items included</span>}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckBadgeIcon className="w-4 h-4 shrink-0" />
                  <span>Doorstep Scale Protocol</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Collector brings certified digital scale. Exact payout is computed in real-time and credited via {payoutMethod.type.toUpperCase()} on spot.
                </p>
              </div>
            </div>

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
                    <p className="text-slate-400">Zero scale manipulation. Calibrated & certified digital scales.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <BanknotesIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Instant UPI on Spot</p>
                    <p className="text-slate-400">Payment sent to your UPI ID or cash in hand before collector departs.</p>
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
                  <span>Explore All 50+ Scrap Rates & Calculator</span>
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
                Recycling <strong className="text-white">{totalWeightKg || 10} kg</strong> across {selectedItemsArray.length} items prevents approx:
              </p>
              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="text-lg font-black text-emerald-400">
                    {((totalWeightKg || 10) * 1.8).toFixed(1)} kg
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">CO₂ Prevented</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="text-lg font-black text-emerald-400">
                    {Math.max(1, Math.floor((totalWeightKg || 10) / 10))} Trees
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
        estimatedAmount={totalEstimatedPayout}
      />
    </div>
  );
}
