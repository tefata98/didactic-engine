import { describe, it, expect } from 'vitest';
import {
  formatDate, formatDateShort, getDayName, getDayOfWeek,
  getWeekDates, isSameDay, formatTime, formatDuration,
  getDateKey, addDays, getMonthKey,
} from '../dateHelpers';

describe('dateHelpers', () => {
  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const result = formatDate(new Date(2024, 0, 15)); // Jan 15, 2024
      expect(result).toBe('January 15, 2024');
    });

    it('uses current date as default', () => {
      const result = formatDate();
      expect(result).toMatch(/\w+ \d+, \d{4}/);
    });
  });

  describe('formatDateShort', () => {
    it('formats short date', () => {
      const result = formatDateShort(new Date(2024, 2, 5)); // Mar 5
      expect(result).toBe('5 Mar');
    });
  });

  describe('getDayName', () => {
    it('returns full day name', () => {
      // 2024-01-15 is a Monday
      const result = getDayName(new Date(2024, 0, 15));
      expect(result).toBe('Monday');
    });

    it('returns short day name', () => {
      const result = getDayName(new Date(2024, 0, 15), true);
      expect(result).toBe('Mon');
    });
  });

  describe('getDayOfWeek', () => {
    it('returns Monday as 0', () => {
      expect(getDayOfWeek(new Date(2024, 0, 15))).toBe(0); // Monday
    });

    it('returns Sunday as 6', () => {
      expect(getDayOfWeek(new Date(2024, 0, 14))).toBe(6); // Sunday
    });
  });

  describe('getWeekDates', () => {
    it('returns 7 dates starting from Monday', () => {
      const dates = getWeekDates(new Date(2024, 0, 17)); // Wednesday
      expect(dates).toHaveLength(7);
      expect(dates[0].getDay()).toBe(1); // Monday
      expect(dates[6].getDay()).toBe(0); // Sunday
    });
  });

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      expect(isSameDay(new Date(2024, 0, 15, 10), new Date(2024, 0, 15, 22))).toBe(true);
    });

    it('returns false for different days', () => {
      expect(isSameDay(new Date(2024, 0, 15), new Date(2024, 0, 16))).toBe(false);
    });
  });

  describe('formatTime', () => {
    it('pads single digits', () => {
      expect(formatTime(7, 5)).toBe('07:05');
    });

    it('handles double digits', () => {
      expect(formatTime(14, 30)).toBe('14:30');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds as mm:ss', () => {
      expect(formatDuration(90)).toBe('01:30');
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(3661)).toBe('61:01');
    });
  });

  describe('getDateKey', () => {
    it('returns YYYY-MM-DD format', () => {
      expect(getDateKey(new Date(2024, 0, 5))).toBe('2024-01-05');
      expect(getDateKey(new Date(2024, 11, 25))).toBe('2024-12-25');
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const result = addDays(new Date(2024, 0, 15), 5);
      expect(result.getDate()).toBe(20);
    });

    it('subtracts with negative days', () => {
      const result = addDays(new Date(2024, 0, 15), -10);
      expect(result.getDate()).toBe(5);
    });
  });

  describe('getMonthKey', () => {
    it('returns YYYY-MM format', () => {
      expect(getMonthKey(new Date(2024, 0, 15))).toBe('2024-01');
      expect(getMonthKey(new Date(2024, 11, 1))).toBe('2024-12');
    });
  });
});
