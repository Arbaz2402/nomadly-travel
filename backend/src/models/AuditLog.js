import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    }, // e.g. "ROLE_UPDATE", "INVENTORY_SYNC", "COUPON_CREATE", "BOOKING_OVERRIDE"
    targetEntity: {
      type: String,
      required: true,
    }, // e.g. "User", "Booking", "Coupon", "Hotel"
    targetId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
