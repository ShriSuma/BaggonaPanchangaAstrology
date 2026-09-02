import { describe, it, expect, beforeEach } from "vitest";
import {
  syncUserProfile,
  getUserProfile,
  getOrCreatePriestWallet,
  cleanupAllTestAndMockProfiles,
  type UserProfileDoc
} from "../db/firestoreDb";
import { mockFirestoreStore } from "./mocks/mockFirestore";

describe("Database Test Isolation & Super Admin Purge Sentinel", () => {
  beforeEach(() => {
    mockFirestoreStore.clear();
  });

  it("1. Guarantees in-memory mock intercepts and isolates test profiles without live Firestore leakage", async () => {
    // Create authentic Super Admin
    const superAdmin: UserProfileDoc = {
      id: "$hriSuma",
      username: "$hriSuma",
      name: "Shri Suma",
      role: "superadmin",
      createdAt: new Date().toISOString()
    };
    await syncUserProfile(superAdmin);

    // Create authentic Priest
    const realPriest: UserProfileDoc = {
      id: "shreerampandit",
      username: "shreerampandit",
      name: "Shreeram Pandit",
      role: "priest",
      createdAt: new Date().toISOString()
    };
    await syncUserProfile(realPriest);
    await getOrCreatePriestWallet("shreerampandit", "Shreeram Pandit");

    // Create 3 synthetic test users created by test suites
    const testUser1: UserProfileDoc = {
      id: "test_priest_001",
      username: "test_priest_001",
      name: "Test Priest 1",
      role: "priest",
      createdAt: new Date().toISOString()
    };
    const testUser2: UserProfileDoc = {
      id: "mock_user_demo",
      username: "mock_user_demo",
      name: "Mock Devotee",
      role: "devotee",
      createdAt: new Date().toISOString()
    };
    await syncUserProfile(testUser1);
    await syncUserProfile(testUser2);
    await getOrCreatePriestWallet("test_priest_001", "Test Priest 1");

    // Verify all 4 exist in mock store
    expect(await getUserProfile("$hriSuma")).not.toBeNull();
    expect(await getUserProfile("shreerampandit")).not.toBeNull();
    expect(await getUserProfile("test_priest_001")).not.toBeNull();
    expect(await getUserProfile("mock_user_demo")).not.toBeNull();

    // Run Super Admin purge utility
    const purgeReport = await cleanupAllTestAndMockProfiles();
    expect(purgeReport.removedUsers).toBe(2);
    expect(purgeReport.removedWallets).toBe(1);

    // Verify test users are purged
    expect(await getUserProfile("test_priest_001")).toBeNull();
    expect(await getUserProfile("mock_user_demo")).toBeNull();

    // Verify authentic Super Admin and Priest remain untouched
    const preservedSa = await getUserProfile("$hriSuma");
    expect(preservedSa).not.toBeNull();
    expect(preservedSa?.username).toBe("$hriSuma");

    const preservedPriest = await getUserProfile("shreerampandit");
    expect(preservedPriest).not.toBeNull();
    expect(preservedPriest?.name).toBe("Shreeram Pandit");
  });
});
