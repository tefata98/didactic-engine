import '@testing-library/jest-dom';

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(key => delete store[key]); },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Notification API
class MockNotification {
  static permission = 'default';
  static requestPermission = vi.fn(() => Promise.resolve('granted'));
  constructor(title, options) {
    this.title = title;
    this.options = options;
  }
}
Object.defineProperty(window, 'Notification', { value: MockNotification });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      active: { postMessage: vi.fn() },
      showNotification: vi.fn(),
    }),
    register: vi.fn(() => Promise.resolve({})),
  },
  writable: true,
});
