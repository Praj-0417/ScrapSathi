'use strict';

const SERVICE_HUBS = [
  { id: 'delhi-ncr', name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, maxRadiusKm: 50 },
  { id: 'mumbai', name: 'Mumbai MMR', lat: 19.0760, lon: 72.8777, maxRadiusKm: 45 },
  { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, maxRadiusKm: 40 },
  { id: 'pune', name: 'Pune', lat: 18.5204, lon: 73.8567, maxRadiusKm: 35 },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, maxRadiusKm: 40 },
  { id: 'jaipur', name: 'Jaipur', lat: 26.9124, lon: 75.7873, maxRadiusKm: 30 },
  { id: 'lucknow', name: 'Lucknow', lat: 26.8467, lon: 80.9462, maxRadiusKm: 30 },
  { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lon: 88.3639, maxRadiusKm: 35 },
  { id: 'chennai', name: 'Chennai', lat: 13.0827, lon: 80.2707, maxRadiusKm: 35 },
];

/**
 * Checks whether given latitude/longitude coordinates fall within
 * an active ScrapSaathi service hub.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {{ serviceable: boolean, hub?: string, hubId?: string, distanceKm?: number, nearestHub?: string }}
 */
function checkServiceability(lat, lon) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    return { serviceable: false, nearestHub: null };
  }

  const toRad = (x) => (x * Math.PI) / 180;
  let minDistance = Infinity;
  let closestHub = null;

  for (const hub of SERVICE_HUBS) {
    const dLat = toRad(hub.lat - lat);
    const dLon = toRad(hub.lon - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(hub.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      closestHub = hub;
    }

    if (distanceKm <= hub.maxRadiusKm) {
      return {
        serviceable: true,
        hub: hub.name,
        hubId: hub.id,
        distanceKm: parseFloat(distanceKm.toFixed(1)),
      };
    }
  }

  return {
    serviceable: false,
    nearestHub: closestHub ? closestHub.name : null,
    distanceKm: parseFloat(minDistance.toFixed(1)),
  };
}

module.exports = {
  SERVICE_HUBS,
  checkServiceability,
};
