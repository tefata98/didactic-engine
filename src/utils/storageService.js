const StorageService = {
  get(namespace, key) {
    try {
      const data = JSON.parse(localStorage.getItem(namespace) || '{}');
      return key ? data[key] : data;
    } catch {
      return key ? null : {};
    }
  },

  set(namespace, key, value) {
    try {
      const data = JSON.parse(localStorage.getItem(namespace) || '{}');
      data[key] = value;
      localStorage.setItem(namespace, JSON.stringify(data));
    } catch (e) {
      console.error('StorageService.set error:', e);
    }
  },

  getAll(namespace) {
    try {
      return JSON.parse(localStorage.getItem(namespace) || '{}');
    } catch {
      return {};
    }
  },

  setAll(namespace, data) {
    try {
      localStorage.setItem(namespace, JSON.stringify(data));
    } catch (e) {
      console.error('StorageService.setAll error:', e);
    }
  },

  remove(namespace, key) {
    try {
      const data = JSON.parse(localStorage.getItem(namespace) || '{}');
      delete data[key];
      localStorage.setItem(namespace, JSON.stringify(data));
    } catch (e) {
      console.error('StorageService.remove error:', e);
    }
  },

  clear(namespace) {
    localStorage.removeItem(namespace);
  },

  clearAll() {
    const namespaces = [
      'lifeos_planner', 'lifeos_fitness', 'lifeos_vocals',
      'lifeos_finance', 'lifeos_reading', 'lifeos_sleep',
      'lifeos_settings', 'lifeos_identity', 'lifeos_news'
    ];
    namespaces.forEach(ns => localStorage.removeItem(ns));
  },

  exportAll() {
    const data = {};
    const namespaces = [
      'lifeos_planner', 'lifeos_fitness', 'lifeos_vocals',
      'lifeos_finance', 'lifeos_reading', 'lifeos_sleep',
      'lifeos_settings', 'lifeos_identity', 'lifeos_news'
    ];
    namespaces.forEach(ns => {
      const val = localStorage.getItem(ns);
      if (val) data[ns] = JSON.parse(val);
    });
    return data;
  },

  importAll(data) {
    Object.entries(data).forEach(([ns, val]) => {
      localStorage.setItem(ns, JSON.stringify(val));
    });
  },
};

export default StorageService;
