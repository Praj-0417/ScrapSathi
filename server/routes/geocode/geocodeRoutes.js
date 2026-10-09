'use strict';

const express = require('express');
const https = require('https');
const { success, error: apiErrorResponse } = require('../../utils/apiResponse');

const router = express.Router();

// ─── Comprehensive Indian Cities & Localities Index ──────────────────────────
const INDIAN_LOCALITIES = [
  // Delhi NCR
  { name: 'Connaught Place, Central Delhi', city: 'Delhi', state: 'Delhi', lat: 28.6315, lon: 77.2167, keywords: ['connaught', 'cp', 'delhi', 'central delhi'] },
  { name: 'Hauz Khas, South Delhi', city: 'Delhi', state: 'Delhi', lat: 28.5494, lon: 77.2001, keywords: ['hauz khas', 'south delhi', 'iit delhi'] },
  { name: 'Dwarka Sector 10, South West Delhi', city: 'Delhi', state: 'Delhi', lat: 28.5823, lon: 77.0500, keywords: ['dwarka', 'south west delhi', 'sector 10'] },
  { name: 'Lajpat Nagar Central Market', city: 'Delhi', state: 'Delhi', lat: 28.5677, lon: 77.2433, keywords: ['lajpat', 'lajpat nagar', 'south delhi'] },
  { name: 'Karol Bagh Market', city: 'Delhi', state: 'Delhi', lat: 28.6517, lon: 77.1906, keywords: ['karol bagh', 'west delhi'] },
  { name: 'Rohini Sector 7, North West Delhi', city: 'Delhi', state: 'Delhi', lat: 28.7166, lon: 77.1126, keywords: ['rohini', 'north west delhi'] },
  { name: 'Saket District Centre, South Delhi', city: 'Delhi', state: 'Delhi', lat: 28.5244, lon: 77.2185, keywords: ['saket', 'select citywalk', 'south delhi'] },
  { name: 'Sector 62, Noida', city: 'Noida', state: 'Uttar Pradesh', lat: 28.6270, lon: 77.3725, keywords: ['noida 62', 'sector 62', 'noida', 'electronic city'] },
  { name: 'Sector 18, Noida Atta Market', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5708, lon: 77.3260, keywords: ['sector 18', 'atta market', 'noida', 'dlf mall'] },
  { name: 'DLF Cyber City, Phase 2, Gurugram', city: 'Gurugram', state: 'Haryana', lat: 28.4950, lon: 77.0895, keywords: ['cyber city', 'gurgaon', 'gurugram', 'dlf'] },
  { name: 'Golf Course Road, Sector 54, Gurugram', city: 'Gurugram', state: 'Haryana', lat: 28.4357, lon: 77.1054, keywords: ['golf course road', 'sector 54', 'gurgaon'] },
  { name: 'Indirapuram, Ghaziabad', city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6415, lon: 77.3714, keywords: ['indirapuram', 'ghaziabad', 'vaishali'] },
  { name: 'Greater Noida West (Noida Extension)', city: 'Greater Noida', state: 'Uttar Pradesh', lat: 28.6090, lon: 77.4363, keywords: ['greater noida', 'noida extension', 'gaur city'] },

  // Mumbai & MMR
  { name: 'Bandra West, Hill Road, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lon: 72.8295, keywords: ['bandra', 'bandra west', 'mumbai', 'linking road'] },
  { name: 'Andheri East, MIDC & Chakala, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1136, lon: 72.8697, keywords: ['andheri', 'andheri east', 'chakala', 'midc'] },
  { name: 'Andheri West, Lokhandwala Complex, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1363, lon: 72.8277, keywords: ['andheri west', 'lokhandwala', 'mumbai'] },
  { name: 'Powai, Hiranandani Gardens, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1197, lon: 72.9051, keywords: ['powai', 'hiranandani', 'iit bombay', 'mumbai'] },
  { name: 'Juhu Tara Road & Beach, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0988, lon: 72.8264, keywords: ['juhu', 'juhu beach', 'mumbai'] },
  { name: 'Dadar West, Shivaji Park, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0269, lon: 72.8374, keywords: ['dadar', 'shivaji park', 'mumbai'] },
  { name: 'Colaba Causeway & Fort, South Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 18.9067, lon: 72.8147, keywords: ['colaba', 'fort', 'gateway of india', 'south mumbai'] },
  { name: 'Borivali West, IC Colony, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.2307, lon: 72.8567, keywords: ['borivali', 'borivali west', 'ic colony'] },
  { name: 'Thane West, Ghodbunder Road', city: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781, keywords: ['thane', 'ghodbunder road', 'thane west'] },
  { name: 'Vashi Sector 17, Navi Mumbai', city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0771, lon: 72.9986, keywords: ['vashi', 'navi mumbai', 'sector 17'] },

  // Bengaluru
  { name: 'Indiranagar 100 Feet Road, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9784, lon: 77.6408, keywords: ['indiranagar', '100 feet road', 'bengaluru', 'bangalore'] },
  { name: 'Koramangala 5th Block, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9352, lon: 77.6245, keywords: ['koramangala', '5th block', 'bengaluru', 'sony world'] },
  { name: 'HSR Layout Sector 2, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9121, lon: 77.6446, keywords: ['hsr', 'hsr layout', 'bengaluru'] },
  { name: 'Whitefield, ITPL Main Road, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9698, lon: 77.7500, keywords: ['whitefield', 'itpl', 'bengaluru', 'hope farm'] },
  { name: 'Electronic City Phase 1, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.8452, lon: 77.6602, keywords: ['electronic city', 'ecity', 'bengaluru', 'infosys'] },
  { name: 'Jayanagar 4th Block, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9250, lon: 77.5938, keywords: ['jayanagar', '4th block', 'bengaluru'] },
  { name: 'Malleshwaram, Sampige Road, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 13.0031, lon: 77.5701, keywords: ['malleshwaram', 'sampige road', 'bengaluru'] },
  { name: 'Marathahalli Bridge, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9591, lon: 77.6974, keywords: ['marathahalli', 'outer ring road', 'bengaluru'] },

  // Pune
  { name: 'Kothrud, Paud Road, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5074, lon: 73.8077, keywords: ['kothrud', 'pune', 'paud road'] },
  { name: 'Hinjewadi Phase 1, Rajiv Gandhi Infotech Park, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5913, lon: 73.7389, keywords: ['hinjewadi', 'hinjawadi', 'it park', 'pune'] },
  { name: 'Viman Nagar, Phoenix Marketcity, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5679, lon: 73.9143, keywords: ['viman nagar', 'phoenix mall', 'pune'] },
  { name: 'Koregaon Park, North Main Road, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5362, lon: 73.8940, keywords: ['koregaon park', 'kp', 'north main road', 'pune'] },
  { name: 'Wakdewadi & Shivajinagar, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5314, lon: 73.8446, keywords: ['shivajinagar', 'wakdewadi', 'pune'] },
  { name: 'Baner Balewadi High Street, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5590, lon: 73.7868, keywords: ['baner', 'balewadi', 'high street', 'pune'] },

  // Hyderabad
  { name: 'Gachibowli, Financial District, Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4401, lon: 78.3489, keywords: ['gachibowli', 'financial district', 'hyderabad'] },
  { name: 'Hitech City, Madhapur, Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4504, lon: 78.3808, keywords: ['hitech city', 'madhapur', 'cyber towers', 'hyderabad'] },
  { name: 'Banjara Hills Road No 12, Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4156, lon: 78.4347, keywords: ['banjara hills', 'jubilee hills', 'hyderabad'] },
  { name: 'Kukatpally Housing Board (KPHB), Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4933, lon: 78.3986, keywords: ['kukatpally', 'kphb', 'hyderabad'] },
  { name: 'Secunderabad Railway Station Area', city: 'Secunderabad', state: 'Telangana', lat: 17.4399, lon: 78.4983, keywords: ['secunderabad', 'clock tower', 'hyderabad'] },

  // Jaipur
  { name: 'Malviya Nagar, Gaurav Tower (GT), Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.8524, lon: 75.8054, keywords: ['malviya nagar', 'gt', 'gaurav tower', 'jaipur'] },
  { name: 'Vaishali Nagar, Amrapali Circle, Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.9075, lon: 75.7432, keywords: ['vaishali nagar', 'amrapali circle', 'jaipur'] },
  { name: 'C-Scheme, Ashok Nagar, Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.9090, lon: 75.8033, keywords: ['c-scheme', 'ashok nagar', 'mi road', 'jaipur'] },
  { name: 'Mansarovar, VT Road, Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.8661, lon: 75.7663, keywords: ['mansarovar', 'vt road', 'jaipur'] },
  { name: 'Raja Park, Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.8988, lon: 75.8284, keywords: ['raja park', 'jaipur'] },

  // Lucknow
  { name: 'Hazratganj Main Market, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8504, lon: 80.9497, keywords: ['hazratganj', 'lucknow', 'central lucknow'] },
  { name: 'Gomti Nagar, Patrakarpuram & Manoj Pandey Chowk', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8530, lon: 81.0003, keywords: ['gomti nagar', 'patrakarpuram', 'lucknow'] },
  { name: 'Aliganj, Kapoorthala, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8837, lon: 80.9416, keywords: ['aliganj', 'kapoorthala', 'lucknow'] },
  { name: 'Indira Nagar, Bhootnath Market, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8770, lon: 80.9892, keywords: ['indira nagar', 'bhootnath', 'lucknow'] },

  // Kolkata
  { name: 'Salt Lake Sector 5, Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5804, lon: 88.4378, keywords: ['salt lake', 'sector 5', 'kolkata', 'bidhannagar'] },
  { name: 'Park Street, Chowringhee, Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5517, lon: 88.3526, keywords: ['park street', 'chowringhee', 'kolkata'] },
  { name: 'New Town, Rajarhat, Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5867, lon: 88.4754, keywords: ['new town', 'rajarhat', 'action area', 'kolkata'] },
  { name: 'Ballygunge & Gariahat, South Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5204, lon: 88.3653, keywords: ['ballygunge', 'gariahat', 'south kolkata'] },

  // Chennai
  { name: 'T. Nagar, Usman Road, Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0418, lon: 80.2341, keywords: ['t nagar', 'usman road', 'chennai', 'panagal park'] },
  { name: 'Anna Nagar Roundtana, Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0850, lon: 80.2101, keywords: ['anna nagar', 'chennai'] },
  { name: 'OMR (Old Mahabalipuram Road), Thoraipakkam, Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9416, lon: 80.2362, keywords: ['omr', 'thoraipakkam', 'it corridor', 'chennai'] },
  { name: 'Adyar, Besant Nagar Beach, Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0033, lon: 80.2550, keywords: ['adyar', 'besant nagar', 'elliots beach', 'chennai'] },

  // Ahmedabad & Chandigarh
  { name: 'SG Highway, Bodakdev, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0373, lon: 72.5118, keywords: ['sg highway', 'bodakdev', 'ahmedabad', 'satellite'] },
  { name: 'Sector 17 Plaza, Chandigarh', city: 'Chandigarh', state: 'Chandigarh', lat: 30.7398, lon: 76.7827, keywords: ['sector 17', 'chandigarh'] },
];

// Cache for external Nominatim calls to respect 1 req/sec policy & avoid quota exhaustion (Caveat #14)
const nominatimCache = new Map();
const NOMINATIM_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to query Nominatim with proper headers and cache
function fetchFromNominatim(url) {
  const cached = nominatimCache.get(url);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.data);
  }

  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'ScrapSaathi-Geocoding/1.0 (contact@scrapsaathi.com)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
      timeout: 3500, // 3.5s timeout
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            nominatimCache.set(url, { data: parsed, expiresAt: Date.now() + NOMINATIM_CACHE_TTL_MS });
            resolve(parsed);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

// ─── Search Endpoint ─────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 10);

  if (!query) {
    return success(res, { data: [] });
  }

  const queryLower = query.toLowerCase();

  // Check local high-precision index first
  const localMatches = INDIAN_LOCALITIES.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(queryLower) ||
      loc.city.toLowerCase().includes(queryLower) ||
      loc.keywords.some((k) => queryLower.includes(k) || k.includes(queryLower))
    );
  }).map((loc) => ({
    display_name: `${loc.name}, ${loc.city}, ${loc.state}, India`,
    lat: loc.lat.toString(),
    lon: loc.lon.toString(),
    city: loc.city,
    state: loc.state,
    country: 'India',
    source: 'verified_directory',
  }));

  // Attempt Nominatim fetch for open-ended searches
  let externalResults = [];
  try {
    const encodedQuery = encodeURIComponent(query + (query.toLowerCase().includes('india') ? '' : ', India'));
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1`;
    const apiData = await fetchFromNominatim(nominatimUrl);

    if (Array.isArray(apiData) && apiData.length > 0) {
      externalResults = apiData.map((item) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        city: item.address?.city || item.address?.state_district || item.address?.town || '',
        state: item.address?.state || '',
        postcode: item.address?.postcode || '',
        source: 'osm_nominatim',
      }));
    }
  } catch {
    // Non-blocking fallback to localMatches
  }

  // Deduplicate and combine (Local high-confidence matches prioritized)
  const combined = [...localMatches, ...externalResults];
  const unique = [];
  const seenCoords = new Set();

  for (const item of combined) {
    const coordKey = `${parseFloat(item.lat).toFixed(3)},${parseFloat(item.lon).toFixed(3)}`;
    if (!seenCoords.has(coordKey)) {
      seenCoords.add(coordKey);
      unique.push(item);
    }
    if (unique.length >= limit) break;
  }

  return success(res, {
    message: 'Geocoding results retrieved',
    data: unique,
  });
});

// ─── Reverse Geocoding Endpoint ──────────────────────────────────────────────
router.get('/reverse', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon || req.query.lng);

  if (isNaN(lat) || isNaN(lon)) {
    return apiErrorResponse(res, {
      statusCode: 400,
      message: 'Valid lat and lon query parameters are required',
    });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const data = await fetchFromNominatim(nominatimUrl);

    if (data && data.display_name) {
      return success(res, {
        data: {
          display_name: data.display_name,
          formattedAddress: data.display_name,
          lat,
          lng: lon,
          road: data.address?.road || data.address?.suburb || '',
          city: data.address?.city || data.address?.state_district || data.address?.state || '',
          postcode: data.address?.postcode || '',
        },
      });
    }
  } catch {
    // Fallback to closest known locality or lat/lng
  }

  // Find closest local match within ~5km
  let closest = null;
  let minDistance = Infinity;

  for (const loc of INDIAN_LOCALITIES) {
    const dLat = loc.lat - lat;
    const dLon = loc.lon - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  const fallbackAddress = closest && minDistance < 0.15
    ? `Near ${closest.name}, ${closest.city}, ${closest.state}`
    : `Pickup Location (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`;

  return success(res, {
    data: {
      display_name: fallbackAddress,
      formattedAddress: fallbackAddress,
      lat,
      lng: lon,
      city: closest?.city || '',
      state: closest?.state || '',
    },
  });
});

const { SERVICE_HUBS, checkServiceability } = require('../../utils/serviceability');

// ─── Serviceability Check Endpoint (Caveat #14) ──────────────────────────────
router.get('/serviceable', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon || req.query.lng);

  if (isNaN(lat) || isNaN(lon)) {
    return apiErrorResponse(res, { statusCode: 400, message: 'Valid lat and lon query parameters are required' });
  }

  const result = checkServiceability(lat, lon);
  return success(res, {
    message: result.serviceable ? 'Location is within active service coverage' : 'Location currently outside active service coverage',
    data: result,
  });
});

module.exports = router;
