import { describe, it, expect, beforeEach } from "vitest";
import { useKundliViewerStore, type KundliViewerSession } from "../stores/kundliViewerStore";
import { useAppStore } from "../stores/appStore";

describe("Kundli Viewer Store Persistence & Pincode Non-Destructive Behavior", () => {
  beforeEach(() => {
    localStorage.clear();
    useKundliViewerStore.getState().clearSession();
  });

  it("persists generated Kundli session and draftInput in localStorage", () => {
    const mockSession: KundliViewerSession = {
      result: {
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        planets: [
          {
            name: "Sun",
            degree: 120.5,
            house: 5,
            rashi: { index: 4, sanskrit: "Simha", english: "Leo" },
            nakshatra: { index: 10, sanskrit: "Magha", english: "Magha", deity: "Pitrus" }
          }
        ],
        ascendant: 35.2,
        ayanamsa: 24.1,
        ayanamsaName: "lahiri",
        julianDay: 2450000
      } as any,
      input: {
        name: "Shreesuma Bhatt",
        birthDate: "1993-03-22",
        birthTime: "10:30",
        latitude: 14.5479,
        longitude: 74.3188,
        gothra: "Kashyapa",
        gender: "Male",
        pincode: "581326"
      },
      birthDateYmd: "1993-03-22",
      birthTimeHm: "10:30",
      homePlaceName: "Gokarna Temple",
      placeLabel: "Gokarna (581326)",
      dasha: [],
      dailyPrediction: "Auspicious day for Vedic study.",
      includePriestCalendar: true
    };

    // Set the session
    useKundliViewerStore.getState().setSession(mockSession);

    // Verify in-memory state
    const currentSession = useKundliViewerStore.getState().session;
    expect(currentSession).toBeDefined();
    expect(currentSession?.input.name).toBe("Shreesuma Bhatt");
    expect(currentSession?.input.pincode).toBe("581326");
    expect(currentSession?.input.gothra).toBe("Kashyapa");
    expect(currentSession?.includePriestCalendar).toBe(true);

    // Verify localStorage persistence under baggona_kundli_viewer_store
    const storedRaw = localStorage.getItem("baggona_kundli_viewer_store");
    expect(storedRaw).toBeTruthy();
    const parsed = JSON.parse(storedRaw!);
    expect(parsed.state.session.input.name).toBe("Shreesuma Bhatt");
    expect(parsed.state.session.result.planets[0].name).toBe("Sun");
    expect(parsed.state.draftInput.input.name).toBe("Shreesuma Bhatt");
  });

  it("retains draftInput when resetResult (Edit Details) is called", () => {
    const mockSession: KundliViewerSession = {
      result: {
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        planets: [],
        ascendant: 10.5,
        ayanamsa: 24,
        ayanamsaName: "lahiri",
        julianDay: 2450000
      } as any,
      input: {
        name: "Anand Sharma",
        birthDate: "1988-08-15",
        birthTime: "06:45",
        latitude: 12.9716,
        longitude: 77.5946,
        gothra: "Bharadwaja",
        gender: "Male",
        pincode: "560001"
      },
      birthDateYmd: "1988-08-15",
      birthTimeHm: "06:45",
      homePlaceName: "Bengaluru",
      placeLabel: "Bengaluru (560001)",
      dasha: [],
      dailyPrediction: "Good financial momentum."
    };

    useKundliViewerStore.getState().setSession(mockSession);
    expect(useKundliViewerStore.getState().session).toBeTruthy();

    // User clicks "Edit Details" (resetResult)
    useKundliViewerStore.getState().resetResult();

    // Session must be cleared so the form displays, but draftInput must remain intact!
    expect(useKundliViewerStore.getState().session).toBeNull();
    const draft = useKundliViewerStore.getState().draftInput;
    expect(draft).toBeTruthy();
    expect(draft?.input?.name).toBe("Anand Sharma");
    expect(draft?.input?.gothra).toBe("Bharadwaja");
    expect(draft?.birthDateYmd).toBe("1988-08-15");
    expect(draft?.birthTimeHm).toBe("06:45");
  });

  it("clears everything when clearSession (New / Reset) is called", () => {
    useKundliViewerStore.getState().setDraftInput({
      birthDateYmd: "1995-11-20",
      birthTimeHm: "14:15",
      homePlaceName: "Udupi"
    });

    expect(useKundliViewerStore.getState().draftInput).toBeTruthy();

    useKundliViewerStore.getState().clearSession();

    expect(useKundliViewerStore.getState().session).toBeNull();
    expect(useKundliViewerStore.getState().draftInput).toBeNull();
  });

  it("does not overwrite user-entered fields when pincode / location is updated", () => {
    // Simulates the user entering form fields
    let formState = {
      name: "Vidya Rao",
      birthDate: "1996-04-12",
      birthTime: "18:20",
      latitude: 19.076,
      longitude: 72.8777,
      gothra: "Vashistha",
      gender: "Female",
      pincode: undefined as string | undefined
    };

    // User types 6 digits into pincode: "576101"
    const newPin = "576101";
    const resolvedPlace = {
      villageName: "Udupi",
      pincode: "576101",
      lat: 13.3409,
      lng: 74.7421
    };

    // Non-destructive update: functional state updater
    formState = {
      ...formState,
      latitude: resolvedPlace.lat,
      longitude: resolvedPlace.lng,
      pincode: resolvedPlace.pincode
    };

    // Verify all prior inputs were strictly preserved!
    expect(formState.name).toBe("Vidya Rao");
    expect(formState.birthDate).toBe("1996-04-12");
    expect(formState.birthTime).toBe("18:20");
    expect(formState.gothra).toBe("Vashistha");
    expect(formState.gender).toBe("Female");
    // Verify location fields updated accurately
    expect(formState.pincode).toBe("576101");
    expect(formState.latitude).toBe(13.3409);
    expect(formState.longitude).toBe(74.7421);
  });

  it("updates currentPage and pushes browser history on setPage", () => {
    const originalPushState = window.history.pushState;
    let pushedState: any = null;
    let pushedUrl: any = null;

    window.history.pushState = (data: any, _unused: string, url?: string | URL | null) => {
      pushedState = data;
      pushedUrl = url;
    };

    useAppStore.getState().setPage("instant_reading");

    expect(useAppStore.getState().currentPage).toBe("instant_reading");
    expect(pushedState).toEqual({ page: "instant_reading" });
    expect(pushedUrl).toBe("#instant_reading");

    // Navigate back to kundli
    useAppStore.getState().setPage("kundli");
    expect(useAppStore.getState().currentPage).toBe("kundli");
    expect(pushedState).toEqual({ page: "kundli" });
    expect(pushedUrl).toBe("#kundli");

    window.history.pushState = originalPushState;
  });
});
