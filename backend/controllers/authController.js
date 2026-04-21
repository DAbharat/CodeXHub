import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, semester, department, rollNo } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'student') {
      const rollNumberExists = await User.findOne({ rollNo });
      if (rollNumberExists) {
        return res.status(400).json({ message: 'Roll number is already in use' });
      }
    }

    // Validate role
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student or teacher' });
    }

    // Validate student-specific fields
    if (role === 'student') {
      if (!semester || semester < 1 || semester > 8) {
        return res.status(400).json({ message: 'Semester must be between 1 and 8' });
      }
      if (!department) {
        return res.status(400).json({ message: 'Department is required for students' });
      }
      if (!rollNo) {
        return res.status(400).json({ message: 'Roll number is required for students' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      semester: role === 'student' ? semester : undefined,
      department: role === 'student' ? department : undefined,
      rollNo: role === 'student' ? rollNo : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        department: user.department,
        rollNo: user.rollNo,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    const comparePassword = await bcrypt.compare(password, user.password);
    console.log("Compare password result:", comparePassword);

    if (user && comparePassword) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        department: user.department,
        rollNo: user.rollNo,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('projects');

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user's profile
// @route   PATCH /api/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, semester, department, password, rollNo } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password;

    if (user.role === 'student') {
      if (rollNo !== undefined) {
        if (!rollNo) {
          return res.status(400).json({ message: 'Roll number is required for students' });
        }
        const existingRollNo = await User.findOne({ rollNo });
        if (existingRollNo && existingRollNo._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'Roll number is already in use' });
        }
        user.rollNo = rollNo;
      }
      if (semester !== undefined) {
        const parsedSemester = parseInt(semester, 10);
        if (Number.isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
          return res.status(400).json({ message: 'Semester must be between 1 and 8' });
        }
        user.semester = parsedSemester;
      }
      if (department !== undefined) {
        user.department = department;
      }
    } else {
      if (department !== undefined) {
        user.department = department;
      }
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      semester: user.semester,
      department: user.department,
      rollNo: user.rollNo,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all teachers
// @route   GET /api/auth/teachers
// @access  Private
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
