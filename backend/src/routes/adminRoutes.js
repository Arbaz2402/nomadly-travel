import express from 'express';
import {
  getAdminOverview,
  getAdminUsers,
  toggleUserSuspension,
  updateUserRole,
  getAdminAuditLogs,
} from '../controllers/adminController.js';
import { verifyAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes with authentication and server-side admin role check
router.use(verifyAuth, requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', getAdminUsers);
router.put('/users/:id/suspend', toggleUserSuspension);
router.put('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAdminAuditLogs);

export default router;
