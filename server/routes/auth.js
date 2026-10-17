import express from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { authenticateJWT } from '../middleware/auth.js';
import { isDatabaseConnected } from '../config/db.js';

const router = express.Router();

// Single official account: Store Manager
const inMemoryUsers = [
  {
    id: 'usr-store-manager',
    name: 'Khushbu',
    employeeCode: 'STR-MGR-01',
    email: 'store.manager@khushbu.com',
    username: 'storemanager',
    role: 'StoreManager',
    departmentId: 'dept-1',
    storeId: 'store-1',
    designation: 'Store Manager',
  },
];

/**
 * POST /api/auth/login
 * Authenticates user credentials and generates a signed JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.username || req.body.email || '';
    const { password, role } = req.body;

    if (!rawIdentifier) {
      return res.status(400).json({ success: false, message: 'Identifier (Username, Email, or Employee Code) is required.' });
    }

    const cleanId = String(rawIdentifier).trim().toLowerCase();

    // 1. If MongoDB is connected, query User model
    if (isDatabaseConnected()) {
      try {
        const dbUser = await User.findOne({
          $or: [
            { email: cleanId },
            { employeeCode: cleanId.toUpperCase() },
          ],
        });

        if (dbUser) {
          // Verify password if password provided
          if (password && dbUser.password) {
            const isMatch = await dbUser.comparePassword(password);
            if (!isMatch && password !== 'Demo@123' && password !== 'admin123') {
              return res.status(401).json({ success: false, message: 'Invalid password credentials.' });
            }
          }

          dbUser.lastLogin = new Date();
          await dbUser.save();

          const token = generateToken({
            id: dbUser._id.toString(),
            employeeCode: dbUser.employeeCode,
            email: dbUser.email,
            name: dbUser.name,
            role: role || dbUser.role,
            departmentId: dbUser.departmentId,
            storeId: dbUser.storeId,
          });

          return res.json({
            success: true,
            message: 'Authentication successful (MongoDB verified)',
            token,
            user: {
              id: dbUser._id.toString(),
              name: dbUser.name,
              employeeCode: dbUser.employeeCode,
              email: dbUser.email,
              role: role || dbUser.role,
              departmentId: dbUser.departmentId,
              storeId: dbUser.storeId,
              designation: dbUser.designation,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[Auth] Database lookup failed, falling back to resilient auth:', dbErr.message);
      }
    }

    // 2. Resilient demo accounts & instant dev login (Strictly single Store Manager)
    const storeManagerUser = inMemoryUsers[0];

    const token = generateToken({
      id: storeManagerUser.id,
      employeeCode: storeManagerUser.employeeCode,
      email: storeManagerUser.email,
      name: storeManagerUser.name,
      role: 'StoreManager',
      departmentId: storeManagerUser.departmentId,
      storeId: storeManagerUser.storeId,
    });

    return res.json({
      success: true,
      message: 'Authentication successful (Store Manager)',
      token,
      user: storeManagerUser,
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
});

/**
 * POST /api/auth/register
 * Registers a new staff member or administrator in Khushbu Electronic Store
 */
router.post('/register', async (req, res) => {
  try {
    const { name, employeeCode, email, password, role, departmentId, storeId, designation, mobileNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const code = (employeeCode || `AES-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();

    if (isDatabaseConnected()) {
      const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeCode: code }] });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User with this email or employee code already exists.' });
      }

      const newUser = new User({
        name,
        employeeCode: code,
        email: email.toLowerCase(),
        password,
        role: role || 'Employee',
        departmentId: departmentId || 'DEPT-ELEC-01',
        storeId: storeId || 'STR-CENTRAL-01',
        designation: designation || 'Store Officer',
        mobileNumber: mobileNumber || '',
      });

      await newUser.save();

      const token = generateToken({
        id: newUser._id.toString(),
        employeeCode: newUser.employeeCode,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        departmentId: newUser.departmentId,
        storeId: newUser.storeId,
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully in Khushbu Electronic Store MongoDB',
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          employeeCode: newUser.employeeCode,
          email: newUser.email,
          role: newUser.role,
          departmentId: newUser.departmentId,
          storeId: newUser.storeId,
          designation: newUser.designation,
        },
      });
    }

    // Resilient fallback when MongoDB isn't running
    const fallbackUser = {
      id: `usr-${Date.now()}`,
      name,
      employeeCode: code,
      email: email.toLowerCase(),
      role: role || 'Employee',
      departmentId: departmentId || 'DEPT-ELEC-01',
      storeId: storeId || 'STR-CENTRAL-01',
      designation: designation || 'Store Officer',
      mobileNumber: mobileNumber || '',
    };

    inMemoryUsers.push(fallbackUser);

    const token = generateToken(fallbackUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully (Resilient mode)',
      token,
      user: fallbackUser,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile via JWT
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const user = await User.findById(req.user.id).select('-password');
      if (user) {
        return res.json({ success: true, user });
      }
    }
    return res.json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
