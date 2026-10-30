export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0';
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateOrTimeString) => {
  if (!dateOrTimeString) return '';
  if (typeof dateOrTimeString === 'string' && dateOrTimeString.includes(':') && dateOrTimeString.length <= 5) {
    return dateOrTimeString;
  }
  const d = new Date(dateOrTimeString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
