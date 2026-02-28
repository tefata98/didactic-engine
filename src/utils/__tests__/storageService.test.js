import { describe, it, expect, beforeEach } from 'vitest';
import StorageService from '../storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get / set', () => {
    it('sets and gets a value', () => {
      StorageService.set('test_ns', 'key1', 'value1');
      expect(StorageService.get('test_ns', 'key1')).toBe('value1');
    });

    it('returns null for non-existent key', () => {
      expect(StorageService.get('test_ns', 'nonexistent')).toBeUndefined();
    });

    it('handles objects', () => {
      const obj = { a: 1, b: [2, 3] };
      StorageService.set('test_ns', 'obj', obj);
      expect(StorageService.get('test_ns', 'obj')).toEqual(obj);
    });
  });

  describe('getAll / setAll', () => {
    it('sets and gets all data for a namespace', () => {
      const data = { key1: 'val1', key2: 'val2' };
      StorageService.setAll('test_ns', data);
      expect(StorageService.getAll('test_ns')).toEqual(data);
    });

    it('returns empty object for empty namespace', () => {
      expect(StorageService.getAll('empty_ns')).toEqual({});
    });
  });

  describe('remove', () => {
    it('removes a key from namespace', () => {
      StorageService.set('test_ns', 'a', 1);
      StorageService.set('test_ns', 'b', 2);
      StorageService.remove('test_ns', 'a');
      expect(StorageService.get('test_ns', 'a')).toBeUndefined();
      expect(StorageService.get('test_ns', 'b')).toBe(2);
    });
  });

  describe('clear', () => {
    it('clears a namespace', () => {
      StorageService.set('test_ns', 'key', 'val');
      StorageService.clear('test_ns');
      expect(StorageService.getAll('test_ns')).toEqual({});
    });
  });

  describe('exportAll / importAll', () => {
    it('exports and imports data', () => {
      StorageService.setAll('lifeos_planner', { tasks: [1, 2, 3] });
      StorageService.setAll('lifeos_fitness', { workouts: ['a'] });

      const exported = StorageService.exportAll();
      expect(exported.lifeos_planner).toEqual({ tasks: [1, 2, 3] });
      expect(exported.lifeos_fitness).toEqual({ workouts: ['a'] });

      // Clear and reimport
      StorageService.clearAll();
      expect(StorageService.getAll('lifeos_planner')).toEqual({});

      StorageService.importAll(exported);
      expect(StorageService.getAll('lifeos_planner')).toEqual({ tasks: [1, 2, 3] });
    });
  });

  describe('clearAll', () => {
    it('clears all lifeos namespaces', () => {
      StorageService.setAll('lifeos_planner', { data: true });
      StorageService.setAll('lifeos_settings', { dark: true });
      StorageService.clearAll();
      expect(StorageService.getAll('lifeos_planner')).toEqual({});
      expect(StorageService.getAll('lifeos_settings')).toEqual({});
    });
  });
});
