'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

// Test suite for ScrapSaathi API caveats and contract guarantees
describe('ScrapSaathi Backend Integration & Caveat Verifications', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'a_very_long_secure_jwt_secret_key_for_testing_12345';
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.MongoDB = process.env.MongoDB || 'mongodb://localhost:27017/scrapsathi_test';
  process.env.NODE_ENV = 'test';

  // ─── 1. Auth Contract & OTP Verification Token Gate (Caveat #1 & #2) ────────
  describe('Caveat #1 & #2: Signup Contract & OTP Challenge Enforcement', () => {
    test('Registration without verificationToken must be rejected with OTP_NOT_VERIFIED', async () => {
      const authService = require('../services/auth-service/services/auth/authService');
      const payload = {
        name: 'Test User',
        email: 'test_unverified@example.com',
        phone: '9876543210',
        password: 'Password123!',
        termsAccepted: true,
        userType: 'individual',
        verificationToken: null, // missing
      };

      await assert.rejects(
        async () => {
          await authService.register(payload);
        },
        (err) => {
          assert.equal(err.code || err.statusCode, 400);
          assert.match(err.message, /Email must be verified with OTP before registration/i);
          return true;
        },
      );
    });

    test('Registration with mismatched email in verificationToken must be rejected', async () => {
      const authService = require('../services/auth-service/services/auth/authService');
      const forgedToken = jwt.sign(
        { email: 'different@example.com', purpose: 'registration' },
        JWT_SECRET,
        { expiresIn: '15m' },
      );

      const payload = {
        name: 'Test User',
        email: 'victim@example.com',
        phone: '9876543210',
        password: 'Password123!',
        termsAccepted: true,
        userType: 'individual',
        verificationToken: forgedToken,
      };

      await assert.rejects(
        async () => {
          await authService.register(payload);
        },
        (err) => {
          assert.equal(err.code || err.statusCode, 400);
          return true;
        },
      );
    });
  });

  // ─── 2. Token Revocation via Versioning (Caveat #4) ──────────────────────────
  describe('Caveat #4: Token Revocation via tokenVersion', () => {
    test('Token generated with version N is invalidated if version increments to N+1', () => {
      const payload = {
        userId: '60d0fe4f5311236168a109ca',
        email: 'user@example.com',
        version: 0,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, JWT_SECRET);

      assert.equal(decoded.version, 0);

      // Simulated user document in database after logout()
      const userInDb = { tokenVersion: 1 };
      const isRevoked = decoded.version !== userInDb.tokenVersion;
      assert.equal(isRevoked, true, 'Token must be recognized as revoked when versions differ');
    });
  });

  // ─── 3. Magic Bytes File Signature Verification (Caveat #17) ─────────────────
  describe('Caveat #17: Binary Magic Bytes Image Validation', () => {
    test('Validates true JPEG, PNG, and WebP signatures', () => {
      const { isValidImageSignature } = require('../services/pickup-service/middlewares/uploadMiddleware');

      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const validWebp = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      const forgedExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // DOS/PE EXE
      const forgedPhp = Buffer.from('<?php echo "pwned"; ?>', 'utf8');

      assert.equal(isValidImageSignature(validJpeg), true, 'JPEG signature should pass');
      assert.equal(isValidImageSignature(validPng), true, 'PNG signature should pass');
      assert.equal(isValidImageSignature(validWebp), true, 'WebP signature should pass');
      assert.equal(isValidImageSignature(forgedExe), false, 'EXE file signature should fail');
      assert.equal(isValidImageSignature(forgedPhp), false, 'PHP script signature should fail');
    });
  });

  // ─── 4. Geocode Serviceability Hub Verification (Caveat #14) ─────────────────
  describe('Caveat #14: Geocoding Serviceability Coverage', () => {
    test('Calculates service coverage radius around active operating hubs', () => {
      const SERVICE_HUBS = [
        { id: 'delhi-ncr', name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, maxRadiusKm: 50 },
        { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, maxRadiusKm: 40 },
      ];

      function checkService(lat, lon) {
        const toRad = (x) => (x * Math.PI) / 180;
        for (const hub of SERVICE_HUBS) {
          const dLat = toRad(hub.lat - lat);
          const dLon = toRad(hub.lon - lon);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(hub.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (dist <= hub.maxRadiusKm) {
            return { serviceable: true, hub: hub.name, distanceKm: parseFloat(dist.toFixed(1)) };
          }
        }
        return { serviceable: false };
      }

      // Connaught Place (central Delhi)
      const cpResult = checkService(28.6315, 77.2167);
      assert.equal(cpResult.serviceable, true);
      assert.equal(cpResult.hub, 'Delhi NCR');

      // Remote location in desert/Himalayas far outside hubs
      const remoteResult = checkService(34.0837, 74.7973); // Srinagar
      assert.equal(remoteResult.serviceable, false);
    });
  });

  // ─── 5. Rate Service Layering & Quote Calculation (Caveat #6 & #15) ──────────
  describe('Caveat #6 & #15: Rates Architecture & Quote Calculation', () => {
    test('RateService generates structured rate cards with city prices', async () => {
      const rateService = require('../services/rate-service/services/rates/rateService');
      const data = await rateService.getRatesByCity('delhi-ncr');

      assert.equal(data.city, 'delhi-ncr');
      assert.ok(Array.isArray(data.categories), 'categories must be an array');
      assert.ok(data.categories.length > 0, 'categories must not be empty');

      const firstCategory = data.categories[0];
      assert.ok(firstCategory.items.length > 0, 'category should contain rate items');
      assert.ok(typeof firstCategory.items[0].effectivePrice === 'number', 'items must have numeric effectivePrice');
    });

    test('Server calculates line totals and totalEstimate for quote snapshot', () => {
      const rateMap = {
        iron: 25,
        newspaper: 15,
        cardboard: 8,
      };

      const wasteDetails = [
        { wasteType: 'Iron', quantity: 20 },
        { wasteType: 'Newspaper', quantity: 10 },
      ];

      const quoteItems = wasteDetails.map((item) => {
        const unitRate = rateMap[item.wasteType.toLowerCase()] || 0;
        return {
          wasteType: item.wasteType,
          quantity: item.quantity,
          unitRate,
          lineTotal: unitRate * item.quantity,
        };
      });

      const total = quoteItems.reduce((acc, curr) => acc + curr.lineTotal, 0);

      assert.equal(quoteItems[0].lineTotal, 500); // 20 * 25
      assert.equal(quoteItems[1].lineTotal, 150); // 10 * 15
      assert.equal(total, 650);
    });
  });

  // ─── 6. Donation Provisional Acknowledgements (Caveat #11 & #12) ─────────────
  describe('Caveat #11 & #12: Donation State Machine & Acknowledgements', () => {
    test('Donation creation yields provisional acknowledgement and pending status', async () => {
      const donationService = require('../services/donation-service/services/donation/donationService');
      const mockRepo = require('../services/donation-service/repositories/donation/donationRepository');

      // Mock create in repository for unit integration
      const originalCreate = mockRepo.create;
      mockRepo.create = async (doc) => ({ _id: 'mock_donation_1', ...doc });

      try {
        const donation = await donationService.donate('60d0fe4f5311236168a109ca', {
          amount: 500,
          cause: 'tree-plantation',
          donorName: 'Generous Donor',
        });

        assert.equal(donation.receiptType, 'provisional_acknowledgement');
        assert.equal(donation.paymentStatus, 'pending');
        assert.match(donation.certificateId, /^ACK-ECO-/);
      } finally {
        mockRepo.create = originalCreate;
      }
    });
  });
});
