import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  formatDate,
  formatTime,
} from '../utils/formatters';

describe('Formatters Utility Suite', () => {
  describe('formatCurrency', () => {
    it('formats default INR amounts cleanly', () => {
      const res = formatCurrency(5000);
      expect(res).toContain('5,000');
    });

    it('handles undefined or null amounts with ₹0 fallback', () => {
      expect(formatCurrency(null)).toBe('₹0');
      expect(formatCurrency(undefined)).toBe('₹0');
    });

    it('formats non-INR currencies like USD', () => {
      const res = formatCurrency(150, 'USD');
      expect(res).toContain('150');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes into hours and minutes', () => {
      expect(formatDuration(135)).toBe('2h 15m');
    });

    it('formats whole hours', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('formats sub-hour minutes', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('handles zero or falsy values', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(null)).toBe('0m');
    });
  });

  describe('formatDate', () => {
    it('returns empty string on falsy input', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });

    it('formats valid ISO date string', () => {
      const formatted = formatDate('2026-12-25T00:00:00.000Z');
      expect(formatted).toMatch(/Dec/);
      expect(formatted).toMatch(/25/);
    });
  });

  describe('formatTime', () => {
    it('returns simple time strings as-is', () => {
      expect(formatTime('14:30')).toBe('14:30');
    });

    it('handles falsy input', () => {
      expect(formatTime('')).toBe('');
    });
  });
});
