import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Search, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

// Fix Leaflet Default Icon issue in Vite / React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Eco Home Pin Icon
const homeEcoIcon = L.divIcon({
  className: 'custom-eco-pin',
  html: `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        background: rgba(16, 185, 129, 0.25);
        border-radius: 50%;
        animation: pulse-ring 2s infinite;
      "></div>
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        background: linear-gradient(135deg, #10b981, #059669);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 8px 16px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
        🏠
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

// Predefined Quick-Jump Cities
const QUICK_CITIES = [
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
];

// Component to handle map clicks & dragging
function LocationMarker({ position, setPosition, onAddressFound }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      reverseGeocode(newPos[0], newPos[1], onAddressFound);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        const newPos = [latLng.lat, latLng.lng];
        setPosition(newPos);
        reverseGeocode(newPos[0], newPos[1], onAddressFound);
      }
    },
  };

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={homeEcoIcon}
    >
      <Popup>
        <div className="text-center font-sans">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Pickup Location</p>
          <p className="text-xs text-slate-600 mt-1">Drag marker or click anywhere to reposition</p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Controller to smoothly pan map on position change
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Reverse Geocoding helper using Backend Proxy with Indian Localities
async function reverseGeocode(lat, lng, callback) {
  try {
    const res = await api.get('/v1/geocode/reverse', {
      params: { lat, lon: lng },
    });
    const result = res.data?.data;
    if (result) {
      callback({
        formattedAddress: result.formattedAddress || result.display_name,
        road: result.road || '',
        city: result.city || '',
        postcode: result.postcode || '',
        lat,
        lng,
      });
      return;
    }
  } catch (err) {
    console.warn('Backend reverse geocoding fallback:', err);
  }

  // Fallback if network fails
  callback({
    formattedAddress: `Location at Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
    lat,
    lng,
  });
}

export default function LocationPickerMap({
  initialLocation = [28.6139, 77.2090], // Default: Delhi NCR
  onLocationSelect,
  className = '',
}) {
  const [position, setPosition] = useState(initialLocation);
  const [addressDetails, setAddressDetails] = useState({
    formattedAddress: 'Pin your location on the map or search address',
    lat: initialLocation[0],
    lng: initialLocation[1],
  });
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const searchTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  // Initial geocode
  useEffect(() => {
    reverseGeocode(initialLocation[0], initialLocation[1], (details) => {
      setAddressDetails(details);
      if (onLocationSelect) {
        onLocationSelect(details);
      }
    });
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressFound = (details) => {
    setAddressDetails(details);
    setStatusMessage('Location updated from map pin!');
    setTimeout(() => setStatusMessage(null), 3000);
    if (onLocationSelect) {
      onLocationSelect(details);
    }
  };

  // Debounced autocomplete search on input
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get('/v1/geocode/search', {
          params: { q: query.trim(), limit: 6 },
        });
        const items = res.data?.data || [];
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  // Select a suggestion from the dropdown
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon || item.lng);
    const newPos = [lat, lng];
    setPosition(newPos);
    setSearchQuery(item.display_name);
    setShowSuggestions(false);

    const details = {
      formattedAddress: item.display_name,
      city: item.city || '',
      state: item.state || '',
      postcode: item.postcode || '',
      lat,
      lng,
    };
    setAddressDetails(details);
    setStatusMessage(`Jumped to ${item.city || 'selected area'}!`);
    setTimeout(() => setStatusMessage(null), 3000);
    if (onLocationSelect) {
      onLocationSelect(details);
    }
  };

  // Direct search submit
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.get('/v1/geocode/search', {
        params: { q: searchQuery.trim(), limit: 1 },
      });
      const items = res.data?.data || [];
      if (items.length > 0) {
        handleSelectSuggestion(items[0]);
      } else {
        setStatusMessage('Location not found. Click on the map to pin!');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Quick City Click
  const handleCityJump = (city) => {
    const newPos = [city.lat, city.lng];
    setPosition(newPos);
    setSearchQuery(`${city.name}, India`);
    reverseGeocode(city.lat, city.lng, (details) => {
      setAddressDetails(details);
      setStatusMessage(`Centered on ${city.name}!`);
      setTimeout(() => setStatusMessage(null), 3000);
      if (onLocationSelect) {
        onLocationSelect(details);
      }
    });
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        reverseGeocode(latitude, longitude, (details) => {
          handleAddressFound(details);
          setIsLocating(false);
        });
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsLocating(false);
        setStatusMessage('Could not retrieve GPS. Please select on map.');
        setTimeout(() => setStatusMessage(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`bg-slate-900/90 rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}
    >
      {/* Map Header & Controls */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/80 text-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-wide flex items-center gap-2 text-white">
              ScrapSaathi Precision GPS Pin
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE GPS
              </span>
            </h4>
            <p className="text-xs text-slate-400">Search address or drag the eco-pin to your exact doorway</p>
          </div>
        </div>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-slate-950 fill-slate-950" />
          )}
          {isLocating ? 'Locating You...' : 'Detect My GPS'}
        </button>
      </div>

      {/* Search Bar Overlay with Autocomplete Dropdown */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 relative">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search locality, street, or landmark (e.g. Hauz Khas, Bandra, Koramangala)..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all text-white placeholder-slate-500 font-medium"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Autocomplete Suggestions Menu */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-3 right-3 z-50 mt-1 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>Matching Indian Localities</span>
              <span className="text-[10px] text-emerald-400 font-normal">Click to pin</span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left p-2.5 hover:bg-emerald-500/10 transition-colors flex items-start gap-2.5 border-b border-slate-800/40 last:border-0 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Jump City Chips */}
        <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Jump:
          </span>
          {QUICK_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleCityJump(c)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 font-semibold border border-slate-700/60 transition-all shrink-0 cursor-pointer"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative h-64 sm:h-76 w-full z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onAddressFound={handleAddressFound}
          />
          <MapCenterController center={position} />
        </MapContainer>

        {/* Floating Coordinates Badge */}
        <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Lat: {position[0].toFixed(5)}</span>
          <span className="text-slate-600">|</span>
          <span>Lng: {position[1].toFixed(5)}</span>
        </div>
      </div>

      {/* Address Confirmation Footer */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <MapPin className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              Doorstep Pickup Address
            </span>
            {statusMessage && (
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 animate-fade-in bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {statusMessage}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium line-clamp-2 mt-1">
            {addressDetails.formattedAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
