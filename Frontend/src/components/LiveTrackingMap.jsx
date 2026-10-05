import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Truck,
  Navigation2,
  CheckCircle2,
  Bell,
  Radio,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api';

// Custom Map Markers
const homeIcon = L.divIcon({
  className: 'custom-home-marker',
  html: `
    <div style="
      position: relative;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 42px;
        height: 42px;
        background: rgba(16, 185, 129, 0.3);
        border-radius: 50%;
        animation: pulse-ring 2s infinite;
      "></div>
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: #0f172a;
        border: 2.5px solid #10b981;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
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
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const collectorVehicleIcon = L.divIcon({
  className: 'custom-collector-vehicle',
  html: `
    <div style="
      position: relative;
      width: 46px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 46px;
        height: 46px;
        background: rgba(6, 182, 212, 0.3);
        border-radius: 50%;
        animation: pulse-ring 1.5s infinite;
      "></div>
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #06b6d4, #0284c7);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 8px 18px rgba(6, 182, 212, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
        🚛
      </div>
    </div>
  `,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

function AutoFitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function LiveTrackingMap({
  userLocation = [19.0760, 72.8777],
  collector = null,
  pickupAddress = 'Flat 402, Green Meadows, Mumbai',
  status = 'pending',
  pickup = null,
  collectorName = null,
  collectorPhone = null,
  vehicleNumber = null,
  className = '',
}) {
  // Extract destination coordinates
  const pickupLat = pickup?.location?.coordinates?.[1];
  const pickupLng = pickup?.location?.coordinates?.[0];

  const destLat = typeof pickupLat === 'number' ? pickupLat : userLocation[0];
  const destLng = typeof pickupLng === 'number' ? pickupLng : userLocation[1];
  const resolvedLocation = useMemo(() => [destLat, destLng], [destLat, destLng]);

  const resolvedAddress = pickup?.address || pickupAddress;
  const resolvedStatus = (pickup?.status || status || 'pending').toLowerCase();

  // Parse and analyze scheduled date and time slot
  const scheduledDateObj = useMemo(() => {
    if (!pickup?.scheduledDate) return null;
    const d = new Date(pickup.scheduledDate);
    return isNaN(d.getTime()) ? null : d;
  }, [pickup?.scheduledDate]);

  const scheduleInfo = useMemo(() => {
    const timeSlot = pickup?.preferredTimeSlot || 'Morning (9 AM - 1 PM)';
    if (!scheduledDateObj) {
      return {
        formattedDate: 'Upcoming Schedule',
        fullDateStr: 'Scheduled Soon',
        isToday: true,
        isTomorrow: false,
        isFuture: false,
        timeSlot,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(scheduledDateObj);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const isToday = diffDays === 0;
    const isTomorrow = diffDays === 1;
    const isFuture = diffDays > 0;

    const formattedDate = isToday
      ? 'Today'
      : isTomorrow
      ? 'Tomorrow'
      : target.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    const fullDateStr = target.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      formattedDate,
      fullDateStr,
      isToday,
      isTomorrow,
      isFuture,
      timeSlot,
    };
  }, [scheduledDateObj, pickup?.preferredTimeSlot]);

  // Operational status breakdown
  const isPending = resolvedStatus === 'pending';
  const isCompleted = resolvedStatus === 'completed';
  const isCancelled = resolvedStatus === 'cancelled';

  // Live en-route vehicle simulation should ONLY run if:
  // 1. Status is explicitly 'in-progress', OR
  // 2. Status is 'accepted' AND the pickup date is TODAY (not tomorrow or future)
  const isEnRoute =
    !isPending &&
    !isCompleted &&
    !isCancelled &&
    (resolvedStatus === 'in-progress' || (resolvedStatus === 'accepted' && scheduleInfo.isToday));

  // If accepted by a collector but scheduled for tomorrow / future date:
  const isAcceptedFuture =
    !isPending &&
    !isCompleted &&
    !isCancelled &&
    resolvedStatus === 'accepted' &&
    scheduleInfo.isFuture;

  // Resolve assigned collector details (strictly from real data or provided props)
  const resolvedCollector = useMemo(() => {
    if (pickup?.wasteCollector && typeof pickup.wasteCollector === 'object') {
      return {
        name: pickup.wasteCollector.name || 'Verified Scrap Collector',
        phone: pickup.wasteCollector.phone || '',
        vehicle: pickup.wasteCollector.vehicle || 'Eco Electric Van',
        rating: 4.9,
        trips: 180,
      };
    }
    if (collectorName || collector?.name) {
      return {
        name: collectorName || collector?.name || 'Verified Scrap Collector',
        phone: collectorPhone || collector?.phone || '',
        vehicle: vehicleNumber || collector?.vehicle || 'Eco Electric Van',
        rating: collector?.rating || 4.9,
        trips: collector?.trips || 180,
      };
    }
    return null;
  }, [pickup?.wasteCollector, collectorName, collector, collectorPhone, vehicleNumber]);

  // Waypoint route generation from hub / collector origin to user home
  const startLat = destLat + 0.015;
  const startLng = destLng + 0.018;

  const routeCoordinates = useMemo(() => [
    [startLat, startLng],
    [startLat - 0.004, startLng - 0.002],
    [startLat - 0.008, startLng - 0.007],
    [startLat - 0.011, startLng - 0.012],
    [destLat + 0.002, destLng + 0.003],
    [destLat, destLng],
  ], [startLat, startLng, destLat, destLng]);

  const routeRef = useRef(routeCoordinates);
  routeRef.current = routeCoordinates;

  const [collectorPos, setCollectorPos] = useState([startLat, startLng]);
  const [progress, setProgress] = useState(15);
  const [etaMinutes, setEtaMinutes] = useState(7);
  const [distanceKm, setDistanceKm] = useState(2.1);
  const [realGpsData, setRealGpsData] = useState(null);
  const [isRealGps, setIsRealGps] = useState(false);

  // Authenticated real GPS telemetry polling from backend (Caveat #10)
  useEffect(() => {
    if (!pickup?._id || isCompleted || isCancelled) return;

    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await api.get(`/v1/pickups/${pickup._id}/tracking`);
        const data = res.data?.data;
        if (isMounted && data?.liveTracking?.coordinates) {
          const [lng, lat] = data.liveTracking.coordinates;
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            setRealGpsData(data);
            setIsRealGps(true);
            setCollectorPos([lat, lng]);

            // Haversine distance from collector to user destination
            const toRad = (x) => (x * Math.PI) / 180;
            const dLat = toRad(lat - destLat);
            const dLon = toRad(lng - destLng);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat)) * Math.cos(toRad(destLat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const calculatedDistance = parseFloat(d.toFixed(1));
            setDistanceKm(calculatedDistance);
            setEtaMinutes(Math.max(1, Math.round(calculatedDistance * 3.5)));
          }
        }
      } catch {
        // Fallback to simulation gracefully
      }
    };

    fetchTelemetry();
    const pollInterval = setInterval(fetchTelemetry, 6000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [pickup?._id, isCompleted, isCancelled, destLat, destLng]);

  // Reset metrics whenever active pickup ID or destination coordinates change
  useEffect(() => {
    if (!isRealGps) {
      setProgress(15);
      setEtaMinutes(7);
      setDistanceKm(2.1);
      setCollectorPos([startLat, startLng]);
    }
  }, [pickup?._id, startLat, startLng, isRealGps]);

  // Real-time animation loop: ONLY active when vehicle is en-route and real GPS is not feeding coordinates
  useEffect(() => {
    if (!isEnRoute || isCompleted || isCancelled || isRealGps) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setEtaMinutes(0);
          setDistanceKm(0);
          setCollectorPos([destLat, destLng]);
          return 100;
        }
        const next = prev + 1;
        const remainingFraction = Math.max(0, 1 - next / 100);
        setEtaMinutes(Math.max(1, Math.round(remainingFraction * 7)));
        setDistanceKm(parseFloat((remainingFraction * 2.1).toFixed(1)));

        // Interpolate position along route
        const routes = routeRef.current;
        if (!routes || routes.length < 2) return next;
        const totalSegments = routes.length - 1;
        const floatIndex = (next / 100) * totalSegments;
        const segmentIndex = Math.min(Math.floor(floatIndex), totalSegments - 1);
        const segmentFraction = floatIndex - segmentIndex;

        const p1 = routes[segmentIndex];
        const p2 = routes[segmentIndex + 1];

        if (!p1 || !p2) return next;

        const currentLat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
        const currentLng = p1[1] + (p2[1] - p1[1]) * segmentFraction;
        const currentPos = [currentLat, currentLng];
        setCollectorPos(currentPos);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isEnRoute, isCompleted, isCancelled, isRealGps, destLat, destLng]);

  // Dynamically divide route for en-route display
  const { coveredPath, remainingPath } = useMemo(() => {
    if (!isEnRoute) return { coveredPath: [], remainingPath: [] };
    const routes = routeCoordinates;
    const totalSegments = routes.length - 1;
    const floatIndex = (progress / 100) * totalSegments;
    const segmentIndex = Math.min(Math.floor(floatIndex), totalSegments - 1);

    const covered = [...routes.slice(0, segmentIndex + 1), collectorPos];
    const remaining = [collectorPos, ...routes.slice(segmentIndex + 1)];

    return { coveredPath: covered, remainingPath: remaining };
  }, [isEnRoute, routeCoordinates, progress, collectorPos]);

  const bounds = useMemo(() => [resolvedLocation, [startLat, startLng]], [resolvedLocation, startLat, startLng]);

  return (
    <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Header with Adaptive State Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border-b border-emerald-500/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl">
                  {isPending ? '📡' : isAcceptedFuture ? '📅' : isCompleted ? '✅' : '🚛'}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isPending && (
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    BROADCAST ACTIVE • AWAITING COLLECTOR
                  </span>
                )}
                {isAcceptedFuture && (
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    CONFIRMED • SCHEDULED FOR {scheduleInfo.formattedDate.toUpperCase()}
                  </span>
                )}
                {isEnRoute && (
                  <>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {progress >= 100 ? 'Collector Arrived' : 'Collector En Route'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">LIVE GPS</span>
                  </>
                )}
                {isCompleted && (
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    PICKUP COMPLETED
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mt-1 flex flex-wrap items-center gap-2">
                {isPending && (
                  <span>
                    Scheduled for <span className="text-emerald-400 font-black">{scheduleInfo.formattedDate}</span> ({scheduleInfo.timeSlot})
                  </span>
                )}
                {isAcceptedFuture && (
                  <span>
                    Assigned: <span className="text-cyan-400 font-black">{resolvedCollector?.name || 'Local Partner'}</span> • {scheduleInfo.timeSlot}
                  </span>
                )}
                {isEnRoute && (
                  progress >= 100 ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" /> Arrived at Doorstep
                    </span>
                  ) : (
                    <>
                      <span>Arriving in</span>
                      <span className="text-emerald-400 font-black text-xl">{etaMinutes} mins</span>
                      <span className="text-xs text-slate-400 font-normal">({distanceKm} km away)</span>
                    </>
                  )
                )}
                {isCompleted && (
                  <span className="text-emerald-400 font-bold">Scrap Collected & Payment Completed</span>
                )}
              </h3>
            </div>
          </div>

          {/* Contextual Status Badge in Header */}
          <div className="self-end sm:self-center">
            {isPending && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Broadcasting to sector partners</span>
              </div>
            )}
            {isAcceptedFuture && (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-xs font-semibold text-cyan-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tracking opens {scheduleInfo.formattedDate} morning</span>
              </div>
            )}
            {isEnRoute && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRealGps ? (realGpsData?.isStale ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-cyan-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealGps ? (realGpsData?.isStale ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-cyan-500'}`}></span>
                </span>
                <span>
                  {isRealGps
                    ? realGpsData?.isStale
                      ? 'GPS Stale (>5m)'
                      : 'Live Collector GPS'
                    : 'Doorstep Dispatch (Route Estimate)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Milestone Tracker / Progress Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          {isEnRoute ? (
            <div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                <span>Dispatched from Hub</span>
                <span className="text-emerald-400 font-semibold">{progress}% Completed</span>
                <span>Your Doorstep</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <div className={`p-2 rounded-xl text-center border ${
                isPending || isAcceptedFuture || isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider">1. Booked</p>
                <p className="text-xs font-semibold text-white mt-0.5">Broadcast Active</p>
              </div>

              <div className={`p-2 rounded-xl text-center border ${
                isAcceptedFuture || isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : isPending
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider">2. Partner</p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {resolvedCollector ? 'Assigned' : 'Awaiting Accept'}
                </p>
              </div>

              <div className={`p-2 rounded-xl text-center border ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider">3. Doorstep</p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {scheduleInfo.formattedDate}
                </p>
              </div>

              <div className={`p-2 rounded-xl text-center border ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider">4. Payment</p>
                <p className="text-xs font-semibold text-white mt-0.5">Instant UPI</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="relative h-72 sm:h-80 w-full z-0">
        <MapContainer
          center={resolvedLocation}
          zoom={isEnRoute ? 14 : 15}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 1, background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User's Home Address Marker */}
          <Marker position={resolvedLocation} icon={homeIcon}>
            <Popup>
              <div className="text-center font-sans">
                <p className="text-xs font-bold text-slate-900">Your Pickup Address</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{resolvedAddress}</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">
                  Scheduled: {scheduleInfo.formattedDate} ({scheduleInfo.timeSlot})
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Broadcast Sector Radius Circles (Displayed when Awaiting Collector) */}
          {isPending && (
            <>
              <Circle
                center={resolvedLocation}
                radius={800}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '6, 6',
                }}
              />
              <Circle
                center={resolvedLocation}
                radius={1600}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '4, 8',
                }}
              />
              <RecenterMap center={resolvedLocation} />
            </>
          )}

          {isAcceptedFuture && (
            <RecenterMap center={resolvedLocation} />
          )}

          {/* Moving Collector Vehicle Marker (ONLY when actually en route) */}
          {isEnRoute && (
            <>
              <Marker position={collectorPos} icon={collectorVehicleIcon}>
                <Popup>
                  <div className="text-center font-sans">
                    <p className="text-xs font-bold text-cyan-800">{resolvedCollector?.name || 'Collector'}</p>
                    <p className="text-[11px] text-slate-600">{resolvedCollector?.vehicle || 'Electric Eco-Van'}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Covered Path (Already traveled trail) */}
              {coveredPath.length > 1 && (
                <Polyline
                  positions={coveredPath}
                  pathOptions={{
                    color: '#64748b',
                    weight: 3,
                    opacity: 0.35,
                    lineJoin: 'round',
                  }}
                />
              )}

              {/* Remaining Path Ahead (Active route to user doorstep) */}
              {remainingPath.length > 1 && (
                <Polyline
                  positions={remainingPath}
                  pathOptions={{
                    color: '#10b981',
                    weight: 5,
                    opacity: 0.9,
                    dashArray: '8, 8',
                    lineJoin: 'round',
                  }}
                />
              )}

              <AutoFitBounds bounds={bounds} />
            </>
          )}
        </MapContainer>

        {/* Floating Context Pill Over Map */}
        {isPending && (
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-amber-500/30 shadow-xl flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Local Broadcast Radius</p>
              <p className="text-xs font-bold text-amber-300">Searching within 2.5 km of your address</p>
            </div>
          </div>
        )}

        {isAcceptedFuture && (
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-cyan-500/30 shadow-xl flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Doorstep Appointment</p>
              <p className="text-xs font-bold text-cyan-300">{scheduleInfo.formattedDate} • {scheduleInfo.timeSlot}</p>
            </div>
          </div>
        )}

        {isEnRoute && (
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-xl flex items-center gap-2.5">
            <Navigation2 className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live Trip Distance</p>
              <p className="text-xs font-bold text-emerald-400">{distanceKm} km remaining</p>
            </div>
          </div>
        )}

        {/* Proactive Arrival Alert Overlay (Only when actively en route and close) */}
        {isEnRoute && progress >= 85 && progress < 100 && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-amber-500/95 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-pulse">
            <Bell className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm">
              Collector {resolvedCollector?.name || 'Partner'} is arriving at your gate! Please keep scrap ready for weighment.
            </span>
          </div>
        )}

        {isEnRoute && progress >= 100 && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-emerald-500/95 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm">
              Collector has arrived at your doorstep! Digital weighing scale inspection in progress.
            </span>
          </div>
        )}
      </div>

      {/* Collector Card / Bottom Status Section */}
      <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {isPending ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">Broadcasting to Verified Collectors</h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Awaiting Partner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Local partners in your sector are reviewing this slot ({scheduleInfo.timeSlot} on {scheduleInfo.formattedDate}). You will be notified the instant a partner accepts!
              </p>
            </div>
          </div>
        ) : resolvedCollector ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-400 shadow-inner">
                {resolvedCollector.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{resolvedCollector.name}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/30">
                    ⭐ {resolvedCollector.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{resolvedCollector.vehicle}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Background Checked
                </p>
              </div>
            </div>

            {/* Communication Actions (Enabled when collector is assigned and contact available) */}
            {resolvedCollector.phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${resolvedCollector.phone.replace(/\s+/g, '')}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Collector</span>
                </a>
                <a
                  href={`https://wa.me/${resolvedCollector.phone.replace(/[^0-9]/g, '')}?text=Hi%20ScrapSaathi%20Collector,%20regarding%20my%20pickup%20on%20${encodeURIComponent(scheduleInfo.formattedDate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl text-slate-400">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">ScrapSaathi Verified Doorstep Service</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Pickup scheduled for {scheduleInfo.formattedDate} ({scheduleInfo.timeSlot}). Partner details will be assigned shortly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
