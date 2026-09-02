/**
 * Complete In-Memory Mock for Firebase Firestore
 * Guarantees 100% test isolation, sub-millisecond execution, and ZERO network calls
 * or writes to production Cloud Firestore during test runs.
 */

export interface MockDocSnapshot {
  id: string;
  exists: () => boolean;
  data: () => Record<string, any> | undefined;
  ref: { id: string; path: string; colPath: string };
}

export interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
  size: number;
  empty: boolean;
  forEach: (callback: (doc: MockDocSnapshot) => void) => void;
  docChanges: () => any[];
}

export function createDocSnapshot(colPath: string, docId: string, data?: Record<string, any>): MockDocSnapshot {
  return {
    id: docId,
    exists: () => data !== undefined && data !== null,
    data: () => (data ? { ...data } : undefined),
    ref: { id: docId, path: `${colPath}/${docId}`, colPath }
  };
}

export function createQuerySnapshot(colPath: string, items: Array<{ id: string; data: Record<string, any> }>): MockQuerySnapshot {
  const docs = items.map(item => createDocSnapshot(colPath, item.id, item.data));
  return {
    docs,
    size: docs.length,
    empty: docs.length === 0,
    forEach: (callback: (doc: MockDocSnapshot) => void) => docs.forEach(callback),
    docChanges: () => []
  };
}

export class MockFirestoreStore {
  public collections = new Map<string, Map<string, Record<string, any>>>();
  public docListeners = new Map<string, Set<(snap: MockDocSnapshot) => void>>();
  public colListeners = new Map<string, Set<(snap: MockQuerySnapshot) => void>>();

  clear() {
    this.collections.clear();
    this.docListeners.clear();
    this.colListeners.clear();
  }

  private getCollection(colPath: string): Map<string, Record<string, any>> {
    if (!this.collections.has(colPath)) {
      this.collections.set(colPath, new Map());
    }
    return this.collections.get(colPath)!;
  }

  getDoc(colPath: string, docId: string): Record<string, any> | undefined {
    return this.getCollection(colPath).get(docId);
  }

  setDoc(colPath: string, docId: string, data: Record<string, any>, options?: { merge?: boolean }) {
    const col = this.getCollection(colPath);
    if (options?.merge && col.has(docId)) {
      col.set(docId, { ...col.get(docId), ...data });
    } else {
      col.set(docId, { ...data });
    }
    this.notifyDoc(colPath, docId);
    this.notifyCol(colPath);
  }

  updateDoc(colPath: string, docId: string, data: Record<string, any>) {
    const col = this.getCollection(colPath);
    const existing = col.get(docId) || {};
    col.set(docId, { ...existing, ...data });
    this.notifyDoc(colPath, docId);
    this.notifyCol(colPath);
  }

  deleteDoc(colPath: string, docId: string) {
    const col = this.getCollection(colPath);
    col.delete(docId);
    this.notifyDoc(colPath, docId);
    this.notifyCol(colPath);
  }

  getDocs(colPath: string, constraints: any[] = []): Array<{ id: string; data: Record<string, any> }> {
    const col = this.getCollection(colPath);
    let items = Array.from(col.entries()).map(([id, data]) => ({ id, data: { ...data } }));

    for (const c of constraints) {
      if (!c) continue;
      if (c.type === "where") {
        items = items.filter(item => {
          const val = item.data[c.field];
          if (c.op === "==") return val === c.value;
          if (c.op === "!=") return val !== c.value;
          if (c.op === ">") return val > c.value;
          if (c.op === ">=") return val >= c.value;
          if (c.op === "<") return val < c.value;
          if (c.op === "<=") return val <= c.value;
          if (c.op === "array-contains") return Array.isArray(val) && val.includes(c.value);
          if (c.op === "in") return Array.isArray(c.value) && c.value.includes(val);
          return true;
        });
      } else if (c.type === "orderBy") {
        items.sort((a, b) => {
          const valA = a.data[c.field];
          const valB = b.data[c.field];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          const diff = valA > valB ? 1 : -1;
          return c.dir === "desc" ? -diff : diff;
        });
      } else if (c.type === "limit") {
        items = items.slice(0, c.count);
      }
    }

    return items;
  }

  subscribeDoc(colPath: string, docId: string, cb: (snap: MockDocSnapshot) => void): () => void {
    const key = `${colPath}/${docId}`;
    if (!this.docListeners.has(key)) {
      this.docListeners.set(key, new Set());
    }
    this.docListeners.get(key)!.add(cb);

    // Initial snapshot trigger
    const data = this.getDoc(colPath, docId);
    cb(createDocSnapshot(colPath, docId, data));

    return () => {
      this.docListeners.get(key)?.delete(cb);
    };
  }

  subscribeCol(colPath: string, constraints: any[], cb: (snap: MockQuerySnapshot) => void): () => void {
    if (!this.colListeners.has(colPath)) {
      this.colListeners.set(colPath, new Set());
    }
    const handler = () => {
      const items = this.getDocs(colPath, constraints);
      cb(createQuerySnapshot(colPath, items));
    };

    this.colListeners.get(colPath)!.add(handler);
    handler(); // Initial trigger

    return () => {
      this.colListeners.get(colPath)?.delete(handler);
    };
  }

  private notifyDoc(colPath: string, docId: string) {
    const key = `${colPath}/${docId}`;
    const subs = this.docListeners.get(key);
    if (subs) {
      const data = this.getDoc(colPath, docId);
      const snap = createDocSnapshot(colPath, docId, data);
      subs.forEach(fn => fn(snap));
    }
  }

  private notifyCol(colPath: string) {
    const subs = this.colListeners.get(colPath);
    if (subs) {
      const items = this.getDocs(colPath);
      const snap = createQuerySnapshot(colPath, items);
      subs.forEach(fn => fn(snap));
    }
  }
}

export const mockFirestoreStore = new MockFirestoreStore();

let autoIdCounter = 1;
export function generateAutoId(): string {
  return `mock_doc_${Date.now()}_${autoIdCounter++}`;
}
