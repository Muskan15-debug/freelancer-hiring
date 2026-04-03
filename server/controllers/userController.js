import User from '../models/User.js';

// GET /api/users — talent search
export const searchUsers = async (req, res, next) => {
  try {
    const { role, skills, rating, availability, search, minRate, maxRate, page = 1, limit = 12 } = req.query;

    const filter = { isBanned: false };

    if (role) filter.role = role;
    if (availability) filter.availability = availability;
    if (rating) filter['rating.average'] = { $gte: parseFloat(rating) };
    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArr };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (minRate) filter.hourlyRate = { ...filter.hourlyRate, $gte: parseFloat(minRate) };
    if (maxRate) filter.hourlyRate = { ...filter.hourlyRate, $lte: parseFloat(maxRate) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name email avatar title skills hourlyRate availability location rating role bio')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id — public profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-notifications -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me — own profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me — update profile
export const updateMe = async (req, res, next) => {
  try {
    const updates = req.validatedBody;

    // Handle avatar upload
    if (req.file) {
      updates.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me/notifications/read
export const markNotificationsRead = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
