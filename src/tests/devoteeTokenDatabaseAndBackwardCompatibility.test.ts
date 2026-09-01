import { describe, it, expect, beforeEach } from "vitest";
import {
  createDatabaseDevoteeToken,
  resolveDevoteeToken,
  cleanupExpiredTokensAfter90Days,
  generateShortCode,
  hashLegacyToken
} from "../features/seva/devoteeTokenDbService";
import { encodeDevoteeToken, decodeDevoteeToken, type DevoteeTokenPayload } from "../utils/tokenCipher";
import {
  saveDevoteeTokenToDb,
  getDevoteeTokenFromDb,
  type DevoteeTokenDoc
} from "../db/firestoreDb";

describe("Devotee Token Database, 90-Day Tracking & Backward Compatibility Engine", () => {
  const sampleProfile: DevoteeTokenPayload = {
    name: "Devotee Ananya Sharma",
    nakshatra: 12, // Hasta
    rashi: 5, // Kanya
    gotra: "Kashyapa",
    pandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    date: "2026-08-21",
    lang: "kn",
    time: "08:00",
    dob: "1995-09-15",
    tob: "07:30",
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187,
    locationName: "Gokarna",
    phone: "9876543210",
    overrideCalendarPhone: true
  };

  describe("1. Short Database Token Creation & Compact QR URL Generation", () => {
    it("generates an 8-char base62 shortCode and short token ID with exact 90-day expiration", async () => {
      const result = await createDatabaseDevoteeToken(sampleProfile, 90, "https://baggona.app");

      expect(result.tokenId).toMatch(/^bgn_tk_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/);
      expect(result.shortCode.length).toBe(8);
      expect(result.sanctumUrl).toBe(`https://baggona.app/daily?token=${result.tokenId}`);
      expect(result.shortSanctumUrl).toBe(`https://baggona.app/daily?token=${result.shortCode}`);

      // URL length is ultra-compact for QR (< 50 chars)
      expect(result.shortSanctumUrl.length).toBeLessThan(50);

      // Verify stored document
      const stored = await getDevoteeTokenFromDb(result.tokenId);
      expect(stored).toBeDefined();
      expect(stored?.devoteeName).toBe("Devotee Ananya Sharma");
      expect(stored?.nakshatra).toBe(12);
      expect(stored?.rashi).toBe(5);
      expect(stored?.dob).toBe("1995-09-15");
      expect(stored?.tob).toBe("07:30");
      expect(stored?.priestName).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");

      // Verify expiration is exactly 90 days in the future
      const createdTime = new Date(stored!.createdAt).getTime();
      const expTime = new Date(stored!.expiresAt).getTime();
      const diffDays = Math.round((expTime - createdTime) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90);
    });

    it("allows retrieval by 8-char shortCode as well as full token ID", async () => {
      const result = await createDatabaseDevoteeToken(sampleProfile, 90);

      const docById = await getDevoteeTokenFromDb(result.tokenId);
      const docByCode = await getDevoteeTokenFromDb(result.shortCode);

      expect(docById).toBeDefined();
      expect(docByCode).toBeDefined();
      expect(docById?.id).toBe(docByCode?.id);
      expect(docByCode?.devoteeName).toBe(sampleProfile.name);
    });
  });

  describe("2. Access Tracking & 90-Day Analytics", () => {
    it("tracks accessCount and updates lastAccessedAt on resolution", async () => {
      const created = await createDatabaseDevoteeToken(sampleProfile, 90);

      // First resolution
      const res1 = await resolveDevoteeToken(created.tokenId);
      expect(res1).toBeDefined();
      expect(res1?.isLegacy).toBe(false);
      expect(res1?.accessCount).toBe(1);
      expect(res1?.daysRemaining).toBe(90);
      expect(res1?.isExpired).toBe(false);
      expect(res1?.payload.name).toBe(sampleProfile.name);

      // Second resolution increments count
      const res2 = await resolveDevoteeToken(created.shortCode);
      expect(res2?.accessCount).toBe(2);
      expect(res2?.payload.dob).toBe("1995-09-15");
      expect(res2?.payload.tob).toBe("07:30");
    });
  });

  describe("3. 100% Backward Compatibility & Auto-Migration Mapping Table", () => {
    it("seamlessly resolves legacy bgn_v1_ Base64URL tokens and auto-migrates them into database mapping table", async () => {
      const legacyToken = encodeDevoteeToken(sampleProfile);
      expect(legacyToken.startsWith("bgn_v1_")).toBe(true);

      // First resolution of legacy token: auto-migrates
      const resolved = await resolveDevoteeToken(legacyToken);
      expect(resolved).toBeDefined();
      expect(resolved?.isLegacy).toBe(true);
      expect(resolved?.daysRemaining).toBe(90);
      expect(resolved?.isExpired).toBe(false);
      expect(resolved?.payload.name).toBe(sampleProfile.name);
      expect(resolved?.payload.nakshatra).toBe(12);
      expect(resolved?.payload.rashi).toBe(5);
      expect(resolved?.payload.pandit).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");

      // Verify that an entry was created in the database and mapping table
      const stored = await getDevoteeTokenFromDb(resolved!.tokenId);
      expect(stored).toBeDefined();
      expect(stored?.devoteeName).toBe(sampleProfile.name);
      expect(stored?.legacyToken).toBe(legacyToken);

      // Second resolution uses mapping table and tracks access
      const resolvedAgain = await resolveDevoteeToken(legacyToken);
      expect(resolvedAgain?.accessCount).toBeGreaterThanOrEqual(1);
      expect(resolvedAgain?.tokenId).toBe(resolved?.tokenId);
    });
  });

  describe("4. 90-Day Expiration & Automatic Cleanup", () => {
    it("flags expired tokens when 90 days have passed and cleans them up from database", async () => {
      const pastDate = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();
      const expiredAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      const expiredTokenDoc: DevoteeTokenDoc = {
        id: "bgn_tk_expired_test_01",
        shortCode: "EXP12345",
        devoteeName: "Expired Devotee",
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        startDate: "2026-01-01",
        totalDays: 90,
        lang: "kn",
        notificationTime: "08:00",
        fullPayload: { name: "Expired Devotee" },
        createdAt: pastDate,
        expiresAt: expiredAt,
        accessCount: 5,
        status: "active",
        updatedAt: pastDate
      };

      await saveDevoteeTokenToDb(expiredTokenDoc);

      // Resolve before cleanup
      const res = await resolveDevoteeToken("bgn_tk_expired_test_01");
      expect(res?.isExpired).toBe(true);
      expect(res?.daysRemaining).toBe(0);

      // Run 90-day automatic maintenance cleanup
      const cleanupStats = await cleanupExpiredTokensAfter90Days();
      expect(cleanupStats.tokensRemoved).toBeGreaterThanOrEqual(1);

      // Verify token is deleted after cleanup
      const afterCleanup = await getDevoteeTokenFromDb("bgn_tk_expired_test_01");
      expect(afterCleanup).toBeNull();
    });
  });

  describe("5. Short Code Generator & Hash Helper", () => {
    it("generates unique 8-char base62 short codes", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const code = generateShortCode(8);
        expect(code.length).toBe(8);
        expect(codes.has(code)).toBe(false);
        codes.add(code);
      }
    });

    it("creates deterministic mapping hashes for legacy tokens", () => {
      const legacyToken = encodeDevoteeToken(sampleProfile);
      const hash1 = hashLegacyToken(legacyToken);
      const hash2 = hashLegacyToken(legacyToken);
      expect(hash1).toBe(hash2);
      expect(hash1.startsWith("map_")).toBe(true);
    });
  });
});
