/**
 * Centralized Application Constants & Travel Parameters for NOMADLY Frontend
 */

export const TAX_RATES = {
  flight: 0.18,
  hotel: 0.18,
  experience: 0.18,
  package: 0.18,
  train: 0.12,
  bus: 0.12,
  default: 0.18,
};

export const SERVICE_FEES = {
  flight: 150,
  hotel: 150,
  experience: 100,
  package: 200,
  train: 80,
  bus: 40,
  default: 100,
};

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const TRAVEL_CATEGORIES = [
  { id: 'flight', label: 'Flights' },
  { id: 'hotel', label: 'Stays' },
  { id: 'train', label: 'Trains' },
  { id: 'bus', label: 'Buses' },
  { id: 'package', label: 'Packages' },
  { id: 'experience', label: 'Experiences' },
];

export const TRIP_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};
