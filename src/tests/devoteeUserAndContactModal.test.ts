import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDevoteeUserId,
  hasDevoteeContactDetails,
  checkAndRegisterDevoteeUser,
  updateDevoteeContact
} from "../features/seva/devoteeUserService";
import {
  getPoojaStreak,
  recordPoojaSankalpaCompleted,
  fetchPoojaStreakFromCloud
} from "../features/seva/calendarVisitService";

describe("Devotee User Registration, Contact Check & Cloud Streak Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getDevoteeUserId", () => {
    it("generates deterministic ID based on name and DOB/TOB", () => {
      const id1 = getDevoteeUserId({ name: "Ramesh Sharma", dob: "1990-05-15", tob: "14:30" });
      expect(id1).toBe("devotee_ramesh_sharma_19900515_1430");

      const id2 = getDevoteeUserId({ name: "Ramesh Sharma", dob: "1990-05-15", tob: "14:30" });
      expect(id1).toBe(id2);
    });

    it("generates deterministic ID using token if DOB is not supplied", () => {
      const id = getDevoteeUserId({ name: "Devotee", token: "bgn_v1_randomtokenstring123456" });
      expect(id).toContain("devotee_devotee_bgn_v1_randomtokenstring123456");
    });
  });

  describe("hasDevoteeContactDetails", () => {
    it("returns false if user has neither phone nor email", () => {
      const user = {
        id: "devotee_test",
        username: "devotee_test",
        name: "Test Devotee",
        role: "devotee" as const,
        createdAt: "2026-09-01T00:00:00.000Z",
        phone: "",
        email: ""
      };
      expect(hasDevoteeContactDetails(user)).toBe(false);
    });

    it("returns true if user has a valid 10-digit phone number", () => {
      const user = {
        id: "devotee_test",
        username: "devotee_test",
        name: "Test Devotee",
        role: "devotee" as const,
        createdAt: "2026-09-01T00:00:00.000Z",
        phone: "+91 9876543210",
        email: ""
      };
      expect(hasDevoteeContactDetails(user)).toBe(true);
    });

    it("returns true if user has a valid email address", () => {
      const user = {
        id: "devotee_test",
        username: "devotee_test",
        name: "Test Devotee",
        role: "devotee" as const,
        createdAt: "2026-09-01T00:00:00.000Z",
        phone: "",
        email: "devotee@baggona.app"
      };
      expect(hasDevoteeContactDetails(user)).toBe(true);
    });
  });

  describe("checkAndRegisterDevoteeUser & updateDevoteeContact", () => {
    it("registers devotee and updates contact details successfully", async () => {
      const uniqueName = `Suresh Kumar ${Date.now()}`;
      const user = await checkAndRegisterDevoteeUser({
        name: uniqueName,
        dob: "1988-10-22",
        tob: "08:15",
        gotra: "Kashyapa",
        rashi: "Vrishabha",
        nakshatra: "Rohini"
      });

      expect(user.role).toBe("devotee");
      expect(hasDevoteeContactDetails(user)).toBe(false);

      // Now update contact details
      const updateRes = await updateDevoteeContact(user.id, {
        phone: "9988776655",
        email: "suresh@example.com"
      });

      expect(updateRes.success).toBe(true);
      expect(updateRes.updatedUser?.phone).toBe("9988776655");
      expect(updateRes.updatedUser?.email).toBe("suresh@example.com");
      expect(hasDevoteeContactDetails(updateRes.updatedUser)).toBe(true);
    });
  });

  describe("Pooja Streak Cloud Synchronization", () => {
    it("increments streak and records pooja completion for specific user", async () => {
      const devoteeId = "devotee_shree_19950101";
      const initialStreak = getPoojaStreak(devoteeId);
      expect(initialStreak.currentStreak).toBe(0);

      const completed = await recordPoojaSankalpaCompleted(devoteeId, "Shree", "Kashyapa", "Shreeram Pandit");
      expect(completed.currentStreak).toBe(1);
      expect(completed.isCompletedToday).toBe(true);

      const synced = await fetchPoojaStreakFromCloud(devoteeId);
      expect(synced.currentStreak).toBe(1);
      expect(synced.isCompletedToday).toBe(true);
    });
  });
});
