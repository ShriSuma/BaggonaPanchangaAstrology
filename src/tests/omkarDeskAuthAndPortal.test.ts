import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../features/auth/authStore";

describe("Omkar Hotel Reception Desk Operator Auth & Portal Guard", () => {
  beforeEach(async () => {
    const store = useAuthStore.getState();
    await store.logout();
  });

  it("authenticates operator 'omkar' with default password 'Omkar@Baggona2026' without MFA OTP and without force reset", async () => {
    const store = useAuthStore.getState();
    
    // Login as omkar
    const result = await store.login("omkar", "Omkar@Baggona2026");

    expect(result.success).toBe(true);
    expect(result.requiresMfa).toBeFalsy();
    expect(result.requiresPasswordChange).toBeFalsy();

    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.currentUser?.toLowerCase()).toBe("omkar");
    expect(updated.role).toBe("priest");
    expect(updated.step).toBe("credentials");
  });

  it("authenticates operator 'omkar' case-insensitively with 'omkar123' or 'omkar@123'", async () => {
    const store = useAuthStore.getState();

    // Test with omkar123
    const res1 = await store.login("Omkar", "omkar123");
    expect(res1.success).toBe(true);
    expect(res1.requiresMfa).toBeFalsy();

    await store.logout();

    // Test with omkar@123
    const res2 = await store.login("OMKAR", "omkar@123");
    expect(res2.success).toBe(true);
    expect(res2.requiresMfa).toBeFalsy();
  });

  it("rejects invalid password for 'omkar'", async () => {
    const store = useAuthStore.getState();
    const result = await store.login("omkar", "WrongPassword123");

    expect(result.success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
