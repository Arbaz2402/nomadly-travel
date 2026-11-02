/**
 * Non-intrusive scheduling & conflict warning engine
 */

export const analyzeItineraryWarnings = (trip, items = []) => {
  const warnings = [];

  if (!trip || !items || items.length === 0) {
    return warnings;
  }

  const tripStart = new Date(trip.startDate);
  tripStart.setHours(0, 0, 0, 0);

  const tripEnd = new Date(trip.endDate);
  tripEnd.setHours(23, 59, 59, 999);

  // 1. Group items by day
  const dayGroups = {};

  items.forEach((item) => {
    const itemDate = new Date(item.date);

    // Check Out-of-bounds warning
    if (itemDate < tripStart || itemDate > tripEnd) {
      warnings.push({
        type: 'OUT_OF_BOUNDS',
        severity: 'warning',
        itemId: item._id,
        itemTitle: item.title,
        message: `Activity "${item.title}" is scheduled on ${itemDate.toISOString().split('T')[0]}, which falls outside the trip dates (${tripStart.toISOString().split('T')[0]} to ${tripEnd.toISOString().split('T')[0]}).`,
      });
    }

    const dateKey = itemDate.toISOString().split('T')[0];
    if (!dayGroups[dateKey]) dayGroups[dateKey] = [];
    dayGroups[dateKey].push(item);
  });

  // 2. Check for daily overlaps and tight connections
  Object.keys(dayGroups).forEach((dateKey) => {
    const dayItems = dayGroups[dateKey];
    // Sort items by start time
    dayItems.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

    for (let i = 0; i < dayItems.length - 1; i++) {
      const current = dayItems[i];
      const next = dayItems[i + 1];

      if (current.endTime && next.startTime) {
        // Direct overlap: current ends after next starts
        if (current.endTime > next.startTime) {
          warnings.push({
            type: 'TIME_OVERLAP',
            severity: 'error',
            itemIds: [current._id, next._id],
            message: `Scheduling overlap detected on ${dateKey}: "${current.title}" (${current.startTime} - ${current.endTime}) overlaps with "${next.title}" (${next.startTime} - ${next.endTime}).`,
          });
        }
      }
    }
  });

  // 3. Check for accommodation gaps on multi-day trips
  const totalDays = Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24));
  if (totalDays > 1) {
    const hotelItems = items.filter((i) => i.category === 'hotel');
    if (hotelItems.length === 0) {
      warnings.push({
        type: 'MISSING_ACCOMMODATION',
        severity: 'info',
        message: `This is a ${totalDays}-day journey with no hotel or accommodation reservations recorded yet.`,
      });
    }
  }

  return warnings;
};

