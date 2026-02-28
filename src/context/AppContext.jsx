import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import StorageService from '../utils/storageService';
import { NAMESPACES, DEFAULT_SETTINGS, USER_PROFILE } from '../utils/constants';

const AppContext = createContext(null);

const defaultAuth = {
  isAuthenticated: false,
  userId: null,
  email: null,
  username: null,
};

const defaultState = {
  user: USER_PROFILE,
  settings: DEFAULT_SETTINGS,
  notifications: [],
  auth: defaultAuth,
};

function loadInitialState() {
  const identity = StorageService.getAll(NAMESPACES.identity);
  const settings = StorageService.getAll(NAMESPACES.settings);
  const auth = identity.auth || defaultAuth;
  return {
    user: identity.user || defaultState.user,
    settings: { ...defaultState.settings, ...settings },
    notifications: identity.notifications || defaultState.notifications,
    auth,
  };
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        settings: {
          ...state.settings,
          reminders: { ...state.settings.reminders, ...action.payload },
        },
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_AUTH':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'LOGOUT':
      return { ...state, auth: defaultAuth };
    case 'HYDRATE':
      return { ...loadInitialState() };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadInitialState);
  const debounceRef = useRef(null);

  // Persist state to localStorage
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      StorageService.setAll(NAMESPACES.identity, {
        user: state.user,
        notifications: state.notifications,
        auth: state.auth,
      });
      StorageService.setAll(NAMESPACES.settings, state.settings);
    }, 300);
  }, [state]);

  // Auto sync when data changes (if authenticated and autoSync enabled)
  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.userId && state.settings.autoSync) {
      import('../utils/syncService').then(({ default: SyncService }) => {
        SyncService.debouncedPush();
      });
    }
  }, [state.auth.isAuthenticated, state.auth.userId, state.settings.autoSync, state.settings, state.user, state.notifications]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
