import { InventoryHold } from '../../models/InventoryHold.js';
import { Bus } from '../../models/Bus.js';

export class InventoryHoldService {
  /**
   * Acquire a temporary hold on specific bus seats or inventory
   */
  static async holdBusSeats({ busId, seatNumbers, userId, sessionId, durationMinutes = 10 }) {
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    // 1. Check if any seat is already booked or currently held by another active session/user
    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new Error('Bus route not found');
    }

    const holdConflictQuery = {
      category: 'bus',
      inventoryId: busId,
      seatNumbers: { $in: seatNumbers },
      status: 'active',
      expiresAt: { $gt: new Date() },
    };

    if (sessionId && userId) {
      holdConflictQuery.$and = [
        { sessionId: { $ne: sessionId } },
        { userId: { $ne: userId } },
      ];
    } else if (sessionId) {
      holdConflictQuery.sessionId = { $ne: sessionId };
    }

    const conflictingHold = await InventoryHold.findOne(holdConflictQuery);

    if (conflictingHold) {
      throw new Error(`One or more selected seats (${conflictingHold.seatNumbers.join(', ')}) are currently being booked by another customer. Please select different seats.`);
    }

    // Check if seats are permanently booked
    for (const sNum of seatNumbers) {
      const seat = bus.seats.find((s) => s.seatNumber === sNum);
      if (seat && (seat.isBooked || !seat.isAvailable)) {
        throw new Error(`Seat ${sNum} is already booked.`);
      }
    }

    // 2. Release previous active hold for this session or user if changing selection
    const releaseFilter = { status: 'active' };
    if (userId) {
      releaseFilter.$or = [{ sessionId }, { userId }];
    } else {
      releaseFilter.sessionId = sessionId;
    }
    await InventoryHold.updateMany(releaseFilter, { $set: { status: 'released' } });

    // 3. Create fresh hold
    const hold = await InventoryHold.create({
      category: 'bus',
      inventoryId: busId,
      seatNumbers,
      userId,
      sessionId,
      expiresAt,
      status: 'active',
    });

    return hold;
  }

  /**
   * Release hold upon cancellation or checkout expiration
   */
  static async releaseHold(sessionId) {
    return InventoryHold.updateMany(
      { sessionId, status: 'active' },
      { $set: { status: 'released' } }
    );
  }

  /**
   * Confirm hold upon successful payment
   */
  static async confirmHold(sessionId) {
    return InventoryHold.updateMany(
      { sessionId, status: 'active' },
      { $set: { status: 'confirmed' } }
    );
  }
}
