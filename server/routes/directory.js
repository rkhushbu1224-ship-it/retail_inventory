import express from 'express';
import { PortalState } from '../models/PortalState.js';
import { User } from '../models/User.js';
import { Asset } from '../models/Asset.js';
import { isDatabaseConnected } from '../config/db.js';

const router = express.Router();

// Helper to extract state data from MongoDB or fallback
async function getPortalData() {
  if (isDatabaseConnected()) {
    const doc = await PortalState.findOne({ stateId: 'portal_state_1' });
    if (doc && doc.payload) {
      return doc.payload;
    }
  }
  return {};
}

/**
 * GET /api/users
 * Returns paginated user directory with role filtering
 */
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const size = Math.max(1, Math.min(100, parseInt(req.query.per_page, 10) || 20));
    const roleFilter = req.query.role ? String(req.query.role).trim() : null;

    const data = await getPortalData();
    const allUsers = Array.isArray(data.users) ? data.users : [];
    const departments = Array.isArray(data.departments) ? data.departments : [];
    const stores = Array.isArray(data.stores) ? data.stores : [];

    // Filter by role if specified
    const filtered = allUsers.filter((u) => !roleFilter || u.role === roleFilter);
    const total = filtered.length;
    const startIndex = (page - 1) * size;
    const paged = filtered.slice(startIndex, startIndex + size);

    const rows = paged.map((u) => {
      const dept = departments.find((d) => d.id === u.departmentId);
      const store = stores.find((s) => s.id === u.storeId);
      const officer = allUsers.find((o) => o.id === u.reportingOfficerId);

      return {
        id: u.id || '',
        name: u.name || '',
        username: u.username || '',
        email: u.email || '',
        mobile: u.mobile || u.mobileNumber || '',
        designation: u.designation || '',
        role: u.role || '',
        employee_code: u.employeeCode || '',
        is_active: u.isActive ? 1 : 0,
        is_first_login: u.isFirstLogin ? 1 : 0,
        department_name: dept ? dept.name : '',
        store_name: store ? store.name : '',
        sub_department_name: u.subDepartment || '',
        reporting_officer: officer ? officer.name : '',
        joined_at: u.joinedAt || '',
      };
    });

    return res.json({
      page,
      per_page: size,
      total,
      data: rows,
    });
  } catch (err) {
    console.error('[Directory /users Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/departments
 * Returns list of departments with user counts
 */
router.get('/departments', async (req, res) => {
  try {
    const data = await getPortalData();
    const departments = Array.isArray(data.departments) ? data.departments : [];
    const users = Array.isArray(data.users) ? data.users : [];

    const result = departments.map((d) => ({
      id: d.id || '',
      name: d.name || '',
      dept_code: d.code || '',
      nodal_officer: '',
      created_at: '',
      sub_dept_count: Array.isArray(d.subDepartments) ? d.subDepartments.length : 0,
      user_count: users.filter((u) => u.departmentId === d.id).length,
    }));

    return res.json(result);
  } catch (err) {
    console.error('[Directory /departments Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/stores
 * Returns list of stores with user and asset counts
 */
router.get('/stores', async (req, res) => {
  try {
    const data = await getPortalData();
    const stores = Array.isArray(data.stores) ? data.stores : [];
    const users = Array.isArray(data.users) ? data.users : [];
    const assets = Array.isArray(data.assets) ? data.assets : [];

    const result = stores.map((s) => ({
      id: s.id || '',
      name: s.name || '',
      location: s.address || '',
      incharge_name: s.inchargeName || '',
      contact_number: '',
      created_at: '',
      user_count: users.filter((u) => u.storeId === s.id).length,
      asset_count: assets.filter((a) => a.storeId === s.id).length,
    }));

    return res.json(result);
  } catch (err) {
    console.error('[Directory /stores Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/roles
 * Returns system roles hierarchy
 */
router.get('/roles', (req, res) => {
  const roles = [
    'SuperAdmin',
    'Admin',
    'SubDepartmentAdmin',
    'StoreManager',
    'StoreUser',
    'Employee',
  ];

  const result = roles.map((role, idx) => ({
    id: idx + 1,
    role_key: role,
    label: role,
    level: idx + 1,
  }));

  return res.json(result);
});

/**
 * GET /api/stats
 * Returns snapshot count statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const data = await getPortalData();
    const stats = {};
    for (const key of ['users', 'departments', 'stores', 'assets', 'indents']) {
      stats[`${key}_count`] = Array.isArray(data[key]) ? data[key].length : 0;
    }
    stats.status = 'online (Node.js & MongoDB)';
    return res.json(stats);
  } catch (err) {
    console.error('[Directory /stats Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
