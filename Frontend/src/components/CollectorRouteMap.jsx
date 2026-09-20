import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation2,
  MapPin,
  Truck,
  Phone,
  Scale,
  CheckCircle,
  Clock,
  Compass,
  ArrowUpRight,
  Sparkles,
  Layers,
  Crosshair,
  ExternalLink,
} from 'lucide-react';

// Custom Map Marker Icons
const collectorLocationIcon = L.divIcon({
  className: 'custom-collector-pin',
  html: `
    <div style="
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 48px;
        height: 48px;
        background: rgba(16, 185, 129, 0.35);
        border-radius: 50%;
        animation: pulse-ring 1.8s infinite;
      "></div>
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #10b981, #047857);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      ">
        🚛
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const customerAssignedIcon = L.divIcon({
  className: 'custom-assigned-pin',
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
        background: rgba(245, 158, 11, 0.3);
        border-radius: 50%;
        animation: pulse-ring 2s infinite;
      "></div>
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
      ">
        🏠
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const customerAvailableIcon = L.divIcon({
  className: 'custom-available-pin',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #06b6d4, #0284c7);
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      ">
        📦
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapController({ center, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [bounds, center, map]);
  return null;
}

export default function CollectorRouteMap({
  activePickups = [],
  availablePickups = [],
  onAcceptPickup,
  onOpenSettleModal,
  className = '',
}) {
  // Collector's simulated/GPS current position (Default: Delhi NCR / Mumbai Hub)
  const [collectorPos, setCollectorPos] = useState([28.6139, 77.2090]);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'assigned', 'available'

  // Extract lat/lng safely from pickup object
  const getPickupCoords = (p, offset = 0) => {
    if (p?.location?.coordinates && Array.isArray(p.location.coordinates) && p.location.coordinates.length >= 2) {
      // GeoJSON is [longitude, latitude]
      return [p.location.coordinates[1], p.location.coordinates[0]];
    }
    // Fallback pseudo-coordinates around 28.6139, 77.2090
    return [28.6139 + (offset % 5) * 0.008 - 0.012, 77.2090 + (offset % 7) * 0.007 - 0.015];
  };

  // Prepare normalized lists
  const assignedList = useMemo(() => {
    return (Array.isArray(activePickups) ? activePickups : []).map((p, idx) => ({
      ...p,
      isAssigned: true,
      coords: getPickupCoords(p, idx + 1),
    }));
  }, [activePickups]);

  const availableList = useMemo(() => {
    return (Array.isArray(availablePickups) ? availablePickups : []).map((p, idx) => ({
      ...p,
      isAssigned: false,
      coords: getPickupCoords(p, idx + 10),
    }));
  }, [availablePickups]);

  // Derive selected pickup without cyclic state updates
  const allPickups = useMemo(() => [...assignedList, ...availableList], [assignedList, availableList]);

  const selectedPickup = useMemo(() => {
    if (selectedPickupId) {
      return allPickups.find((p) => p._id === selectedPickupId) || allPickups[0] || null;
    }
    return allPickups[0] || null;
  }, [allPickups, selectedPickupId]);

  // Try fetching actual device GPS location
  const handleGetLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setCollectorPos(newPos);
        },
        (err) => {
          console.warn('Geolocation access failed:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Generate route polyline to selected customer
  const routePoints = useMemo(() => {
    if (!selectedPickup?.coords) return [];
    const dest = selectedPickup.coords;
    const midLat = (collectorPos[0] + dest[0]) / 2 + 0.003;
    const midLng = (collectorPos[1] + dest[1]) / 2 - 0.002;
    return [collectorPos, [midLat, midLng], dest];
  }, [collectorPos, selectedPickup]);

  // Calculate approximate distance & drive time
  const distanceKm = useMemo(() => {
    if (!selectedPickup?.coords) return 0;
    const [lat1, lon1] = collectorPos;
    const [lat2, lon2] = selectedPickup.coords;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }, [collectorPos, selectedPickup]);

  const estDriveMinutes = Math.max(2, Math.round(distanceKm * 3.5));

  // Compute map bounds to fit collector + selected customer
  const mapBounds = useMemo(() => {
    if (selectedPickup?.coords) {
      return [collectorPos, selectedPickup.coords];
    }
    const allCoords = [collectorPos, ...assignedList.map((p) => p.coords), ...availableList.map((p) => p.coords)];
    return allCoords.length > 1 ? allCoords : null;
  }, [collectorPos, selectedPickup, assignedList, availableList]);

  // Filtered displayed pickups
  const displayedPickups = useMemo(() => {
    if (filterMode === 'assigned') return assignedList;
    if (filterMode === 'available') return availableList;
    return [...assignedList, ...availableList];
  }, [filterMode, assignedList, availableList]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl ${className}`}>
      {/* Map Header & Controls */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border-b border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  ScrapSaathi GPS Fleet Nav
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LIVE RADAR
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Collector Field Operations Map
              </h2>
            </div>
          </div>

          {/* Filter Pills & Location Center */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950/80 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({assignedList.length + availableList.length})
              </button>
              <button
                onClick={() => setFilterMode('assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterMode === 'assigned'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assigned ({assignedList.length})
              </button>
              <button
                onClick={() => setFilterMode('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterMode === 'available'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Available ({availableList.length})
              </button>
            </div>

            <button
              onClick={handleGetLiveLocation}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
              title="Center on My GPS Location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative h-80 sm:h-96 w-full z-0">
        <MapContainer
          center={collectorPos}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 1, background: '#090d16' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Collector's Current Vehicle Pin */}
          <Marker position={collectorPos} icon={collectorLocationIcon}>
            <Popup>
              <div className="text-center font-sans p-1">
                <p className="text-xs font-black text-emerald-700">🚛 Your Current Location</p>
                <p className="text-[11px] text-slate-600 mt-0.5">ScrapSaathi Waste Partner</p>
              </div>
            </Popup>
          </Marker>

          {/* Customer Pickup Markers */}
          {displayedPickups.map((pickup, idx) => {
            return (
              <Marker
                key={pickup?._id || idx}
                position={pickup.coords}
                icon={pickup.isAssigned ? customerAssignedIcon : customerAvailableIcon}
                eventHandlers={{
                  click: () => setSelectedPickupId(pickup._id || idx),
                }}
              >
                <Popup>
                  <div className="text-left font-sans p-1 max-w-[220px]">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          pickup.isAssigned
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {pickup.isAssigned ? 'Assigned Route' : 'Available'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {pickup?.preferredTimeSlot || 'Morning'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">
                      {pickup?.wasteType || 'Scrap Items'} ({pickup?.quantity || 0} {pickup?.unit || 'kg'})
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      📍 {pickup?.address || 'Customer doorstep address'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      👤 {pickup?.user?.name || 'Scrap Citizen'}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                      <button
                        onClick={() => setSelectedPickupId(pickup._id || idx)}
                        className="w-full py-1.5 px-2 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer"
                      >
                        Select for GPS Route
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route Polyline to Selected Customer */}
          {routePoints.length > 0 && (
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: selectedPickup?.isAssigned ? '#f59e0b' : '#06b6d4',
                weight: 5,
                opacity: 0.9,
                dashArray: '10, 8',
                lineJoin: 'round',
              }}
            />
          )}

          <MapController center={collectorPos} bounds={mapBounds} />
        </MapContainer>

        {/* Floating Turn-by-Turn GPS HUD Banner */}
        {selectedPickup && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400] bg-slate-950/95 backdrop-blur-md p-4 rounded-3xl border border-emerald-500/30 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-black">
                  <Navigation2 className="w-5 h-5 animate-bounce-subtle" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    {selectedPickup.isAssigned ? 'Active Assigned Route' : 'Neighborhood Target'}
                  </span>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    To: {selectedPickup.user?.name || 'Customer'} • {selectedPickup.wasteType || 'Scrap'}
                  </h4>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    <span className="text-emerald-400 font-black text-sm">{distanceKm} km</span> away (~{estDriveMinutes} mins drive)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{selectedPickup.address || 'Address provided by citizen'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Customer Action Drawer */}
      {selectedPickup ? (
        <div className="p-4 sm:p-6 bg-slate-900/95 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                  selectedPickup.isAssigned
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {selectedPickup.isAssigned ? 'Assigned to you' : 'Available for Claim'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Slot: <strong className="text-white">{selectedPickup.preferredTimeSlot || 'Flexible'}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white">
              {selectedPickup.wasteType || 'Scrap'} {selectedPickup.subcategory ? `• ${selectedPickup.subcategory}` : ''} ({selectedPickup.quantity || 0} {selectedPickup.unit || 'kg'})
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{selectedPickup.address || 'Doorstep location'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Launch External Google Maps Navigation */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPickup.coords[0]},${selectedPickup.coords[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Google Maps GPS</span>
            </a>

            {/* Direct Phone Call if available */}
            {selectedPickup.user?.phone && (
              <a
                href={`tel:${selectedPickup.user.phone.replace(/\s+/g, '')}`}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            {/* Primary Action Button */}
            {selectedPickup.isAssigned ? (
              <button
                onClick={() => onOpenSettleModal && onOpenSettleModal(selectedPickup)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Weigh & Settle Cashout</span>
              </button>
            ) : (
              <button
                onClick={() => onAcceptPickup && onAcceptPickup(selectedPickup._id)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept This Doorstep Job</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-center text-xs text-slate-400 font-semibold">
          Click any customer pin on the map to inspect scrap items and start GPS route guidance.
        </div>
      )}
    </div>
  );
}
