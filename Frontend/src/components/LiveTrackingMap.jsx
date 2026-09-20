import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Phone, MessageSquare, Clock, ShieldCheck, Truck, Navigation2, CheckCircle2, Play, Pause, RotateCcw, Bell } from 'lucide-react';

// Custom Icons
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

export default function LiveTrackingMap({
  userLocation = [19.0760, 72.8777],
  collector = {
    name: 'Ramesh Kumar (Verified Partner)',
    phone: '+91 98765 43210',
    vehicle: 'DL 3S AB 4492 (Electric Eco-Van)',
    rating: 4.9,
    trips: 420,
  },
  pickupAddress = 'Flat 402, Green Meadows, Mumbai',
  status = 'accepted',
  pickup = null,
  collectorName = null,
  collectorPhone = null,
  vehicleNumber = null,
  className = '',
}) {
  // Extract primitive coordinates
  const pickupLat = pickup?.location?.coordinates?.[1];
  const pickupLng = pickup?.location?.coordinates?.[0];

  const destLat = typeof pickupLat === 'number' ? pickupLat : userLocation[0];
  const destLng = typeof pickupLng === 'number' ? pickupLng : userLocation[1];
  const resolvedLocation = useMemo(() => [destLat, destLng], [destLat, destLng]);

  const resolvedAddress = pickup?.address || pickupAddress;
  const resolvedStatus = pickup?.status || status;
  const resolvedCollector = useMemo(() => ({
    name: collectorName || collector?.name || 'Ramesh Kumar (Verified Partner)',
    phone: collectorPhone || collector?.phone || '+91 98765 43210',
    vehicle: vehicleNumber || collector?.vehicle || 'DL 3S AB 4492 (Electric Eco-Van)',
    rating: collector?.rating || 4.9,
    trips: collector?.trips || 420,
  }), [collector, collectorName, collectorPhone, vehicleNumber]);

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
  const [isSimulating, setIsSimulating] = useState(true);

  // Reset simulation whenever active pickup ID or destination coordinates change
  useEffect(() => {
    setProgress(15);
    setEtaMinutes(7);
    setDistanceKm(2.1);
    setCollectorPos([startLat, startLng]);
    setIsSimulating(true);
  }, [pickup?._id, startLat, startLng]);

  // Simulation loop
  useEffect(() => {
    if (!isSimulating || resolvedStatus === 'completed') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsSimulating(false);
          setEtaMinutes(0);
          setDistanceKm(0);
          setCollectorPos([destLat, destLng]);
          return 100;
        }
        const next = prev + 2;
        const remainingFraction = Math.max(0, 1 - next / 100);
        setEtaMinutes(Math.max(1, Math.round(remainingFraction * 7)));
        setDistanceKm(parseFloat((remainingFraction * 2.1).toFixed(1)));

        // Interpolate position along route
        const routes = routeRef.current;
        const totalSegments = routes.length - 1;
        const floatIndex = (next / 100) * totalSegments;
        const segmentIndex = Math.min(Math.floor(floatIndex), totalSegments - 1);
        const segmentFraction = floatIndex - segmentIndex;

        const p1 = routes[segmentIndex];
        const p2 = routes[segmentIndex + 1];

        const currentLat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
        const currentPos = [currentLat, currentLng];
        setCollectorPos(currentPos);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, resolvedStatus, destLat, destLng]);

  // Dynamically divide the full route into:
  // 1. Covered path (start -> current van position)
  // 2. Remaining path (current van position -> destination)
  const { coveredPath, remainingPath } = useMemo(() => {
    const routes = routeCoordinates;
    const totalSegments = routes.length - 1;
    const floatIndex = (progress / 100) * totalSegments;
    const segmentIndex = Math.min(Math.floor(floatIndex), totalSegments - 1);

    // Points from start up to current segment index + current van position
    const covered = [...routes.slice(0, segmentIndex + 1), collectorPos];
    // Points from current van position up to destination
    const remaining = [collectorPos, ...routes.slice(segmentIndex + 1)];

    return { coveredPath: covered, remainingPath: remaining };
  }, [routeCoordinates, progress, collectorPos]);

  const resetSimulation = () => {
    setProgress(5);
    setEtaMinutes(7);
    setDistanceKm(2.1);
    setCollectorPos([startLat, startLng]);
    setIsSimulating(true);
  };

  const bounds = useMemo(() => [resolvedLocation, [startLat, startLng]], [resolvedLocation, startLat, startLng]);

  return (
    <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Live Tracking Header with Real-Time Route Animation */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-500/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl">
                  🚛
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {progress >= 100 ? 'Collector Arrived' : 'Collector En Route'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">LIVE GPS</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                {progress >= 100 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> Arrived at Doorstep
                  </span>
                ) : (
                  <>
                    <span>Arriving in</span>
                    <span className="text-emerald-400 font-black text-xl">{etaMinutes} mins</span>
                    <span className="text-xs text-slate-400 font-normal">({distanceKm} km away)</span>
                  </>
                )}
              </h3>
            </div>
          </div>

          {/* Simulation Toggle Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title={isSimulating ? 'Pause Movement' : 'Resume Movement'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              {isSimulating ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={resetSimulation}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Restart Route"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-4">
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
      </div>

      {/* Interactive Map View */}
      <div className="relative h-72 sm:h-80 w-full z-0">
        <MapContainer
          center={resolvedLocation}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 1, background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* User's Home Marker */}
          <Marker position={resolvedLocation} icon={homeIcon}>
            <Popup>
              <div className="text-center font-sans">
                <p className="text-xs font-bold text-slate-900">Your Home Address</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{resolvedAddress}</p>
              </div>
            </Popup>
          </Marker>

          {/* Moving Collector Vehicle Marker */}
          <Marker position={collectorPos} icon={collectorVehicleIcon}>
            <Popup>
              <div className="text-center font-sans">
                <p className="text-xs font-bold text-cyan-800">{resolvedCollector.name}</p>
                <p className="text-[11px] text-slate-600">{resolvedCollector.vehicle}</p>
              </div>
            </Popup>
          </Marker>

          {/* Covered Path (Already traveled trail - subtle thin muted line) */}
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

          {/* Remaining Path Ahead (Active route to user doorstep - bright dashed green line) */}
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
        </MapContainer>

        {/* Floating ETA Pill */}
        <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-xl flex items-center gap-2.5">
          <Navigation2 className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live Trip Distance</p>
            <p className="text-xs font-bold text-emerald-400">{distanceKm} km remaining</p>
          </div>
        </div>

        {/* Proactive Arrival Alert Overlay */}
        {progress >= 85 && progress < 100 && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-amber-500/95 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-pulse">
            <Bell className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm">
              Collector {resolvedCollector.name} is arriving at your gate! Please keep scrap ready for weighment.
            </span>
          </div>
        )}

        {progress >= 100 && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-emerald-500/95 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm">
              Collector has arrived at your doorstep! Digital weighing scale inspection in progress.
            </span>
          </div>
        )}
      </div>

      {/* Collector Details Card & Action Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
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

        {/* Call & Chat Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${resolvedCollector.phone.replace(/\s+/g, '')}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Call Collector</span>
          </a>
          <a
            href={`https://wa.me/${resolvedCollector.phone.replace(/[^0-9]/g, '')}?text=Hi%20ScrapSaathi%20Collector,%20regarding%20my%20pickup`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
