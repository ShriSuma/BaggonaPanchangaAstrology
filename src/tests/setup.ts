import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { beforeEach, vi } from "vitest";
import { db } from "../db/indexedDb";

import {
  mockFirestoreStore,
  generateAutoId,
  createDocSnapshot,
  createQuerySnapshot
} from "./mocks/mockFirestore";

// --------------------------------------------------------------------------
// ZERO-FIRESTORE-LEAK GUARD: Comprehensive In-Memory Mock for Firebase
// --------------------------------------------------------------------------
vi.mock("../services/firebase", () => ({
  app: {},
  firestore: { _isMock: true },
  firebaseAuth: {},
  firebaseConfig: {}
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{}]),
  getApp: vi.fn(() => ({}))
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({}))
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({ _isMock: true })),
  collection: vi.fn((_db: any, ...pathSegments: any[]) => {
    const fullPath = pathSegments.join("/");
    return { type: "collection", path: fullPath, id: pathSegments[pathSegments.length - 1] };
  }),
  doc: vi.fn((_db: any, ...pathSegments: any[]) => {
    let fullPath = "";
    let docId = "";
    let colPath = "";

    const first = pathSegments[0];
    if (typeof first === "object" && first?.type === "collection") {
      colPath = first.path;
      docId = pathSegments[1] || generateAutoId();
      fullPath = `${colPath}/${docId}`;
    } else {
      const parts = pathSegments.filter(Boolean);
      if (parts.length === 1) {
        fullPath = parts[0];
        const segs = fullPath.split("/");
        docId = segs.pop() || generateAutoId();
        colPath = segs.join("/");
      } else {
        docId = parts[parts.length - 1];
        colPath = parts.slice(0, -1).join("/");
        fullPath = parts.join("/");
      }
    }
    return { type: "doc", path: fullPath, id: docId, colPath };
  }),
  getDoc: vi.fn(async (docRef: any) => {
    const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
    const docId = docRef.id;
    const data = mockFirestoreStore.getDoc(colPath, docId);
    return createDocSnapshot(colPath, docId, data);
  }),
  getDocs: vi.fn(async (queryOrCol: any) => {
    const colPath = queryOrCol.colPath || queryOrCol.path || "";
    const constraints = queryOrCol.constraints || [];
    const items = mockFirestoreStore.getDocs(colPath, constraints);
    return createQuerySnapshot(colPath, items);
  }),
  setDoc: vi.fn(async (docRef: any, data: any, options?: any) => {
    const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
    const docId = docRef.id;
    mockFirestoreStore.setDoc(colPath, docId, data, options);
  }),
  updateDoc: vi.fn(async (docRef: any, data: any) => {
    const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
    const docId = docRef.id;
    mockFirestoreStore.updateDoc(colPath, docId, data);
  }),
  deleteDoc: vi.fn(async (docRef: any) => {
    const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
    const docId = docRef.id;
    mockFirestoreStore.deleteDoc(colPath, docId);
  }),
  addDoc: vi.fn(async (colRef: any, data: any) => {
    const colPath = colRef.path || colRef.id;
    const docId = generateAutoId();
    mockFirestoreStore.setDoc(colPath, docId, data);
    return { type: "doc", id: docId, path: `${colPath}/${docId}`, colPath };
  }),
  query: vi.fn((colRef: any, ...constraints: any[]) => ({
    type: "query",
    colPath: colRef.path || colRef.id,
    path: colRef.path || colRef.id,
    constraints: constraints.filter(Boolean)
  })),
  where: vi.fn((field: string, op: string, value: any) => ({
    type: "where",
    field,
    op,
    value
  })),
  orderBy: vi.fn((field: string, dir: "asc" | "desc" = "asc") => ({
    type: "orderBy",
    field,
    dir
  })),
  limit: vi.fn((count: number) => ({
    type: "limit",
    count
  })),
  onSnapshot: vi.fn((target: any, onNext: any) => {
    if (target.type === "doc" || (target.id && !target.constraints)) {
      const colPath = target.colPath || target.path.substring(0, target.path.lastIndexOf("/"));
      return mockFirestoreStore.subscribeDoc(colPath, target.id, onNext);
    } else {
      const colPath = target.colPath || target.path || "";
      return mockFirestoreStore.subscribeCol(colPath, target.constraints || [], onNext);
    }
  }),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
  writeBatch: vi.fn(() => ({
    set: vi.fn((docRef: any, data: any, opts: any) => {
      const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
      mockFirestoreStore.setDoc(colPath, docRef.id, data, opts);
    }),
    update: vi.fn((docRef: any, data: any) => {
      const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
      mockFirestoreStore.updateDoc(colPath, docRef.id, data);
    }),
    delete: vi.fn((docRef: any) => {
      const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
      mockFirestoreStore.deleteDoc(colPath, docRef.id);
    }),
    commit: vi.fn(async () => {})
  })),
  runTransaction: vi.fn(async (_db: any, updateFunction: any) => {
    const tx = {
      get: vi.fn(async (docRef: any) => {
        const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
        const data = mockFirestoreStore.getDoc(colPath, docRef.id);
        return {
          id: docRef.id,
          exists: () => !!data,
          data: () => (data ? { ...data } : undefined),
          ref: docRef
        };
      }),
      set: vi.fn((docRef: any, data: any, opts: any) => {
        const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
        mockFirestoreStore.setDoc(colPath, docRef.id, data, opts);
      }),
      update: vi.fn((docRef: any, data: any) => {
        const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
        mockFirestoreStore.updateDoc(colPath, docRef.id, data);
      }),
      delete: vi.fn((docRef: any) => {
        const colPath = docRef.colPath || docRef.path.substring(0, docRef.path.lastIndexOf("/"));
        mockFirestoreStore.deleteDoc(colPath, docRef.id);
      })
    };
    return updateFunction(tx);
  })
}));

vi.mock("../core/resolvePanchangCoords", () => ({
  resolvePanchangCoords: vi.fn(async (lat: number, lng: number) => ({ lat, lng }))
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
});

Object.defineProperty(navigator, "geolocation", {
  value: {
    getCurrentPosition: (success: (pos: GeolocationPosition) => void) =>
      success({
        coords: {
          latitude: 19.076,
          longitude: 72.8777,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition)
  },
  configurable: true
});

Object.defineProperty(global, "Notification", {
  value: class {
    static permission: NotificationPermission = "granted";
    static requestPermission = vi.fn(async () => "granted" as NotificationPermission);
    constructor(_title: string, _opts?: NotificationOptions) {}
  },
  configurable: true
});

beforeEach(async () => {
  mockFirestoreStore.clear();
  if (!db.isOpen()) {
    await db.open();
  }
});
