import Shortlist from '../models/Shortlist.js';

// POST /api/shortlists — toggle shortlist (add/remove)
export const toggleShortlist = async (req, res) => {
  try {
    const { targetId, targetType = 'User' } = req.body;

    if (!targetId) {
      return res.status(400).json({ message: 'targetId is required' });
    }

    const existing = await Shortlist.findOne({ recruiterId: req.user._id, targetId });

    if (existing) {
      await Shortlist.deleteOne({ _id: existing._id });
      return res.json({ shortlisted: false, message: 'Removed from shortlist' });
    }

    await Shortlist.create({ recruiterId: req.user._id, targetId, targetType });
    return res.status(201).json({ shortlisted: true, message: 'Added to shortlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/shortlists — get all shortlisted talent for this recruiter
export const getShortlist = async (req, res) => {
  try {
    const shortlists = await Shortlist.find({ recruiterId: req.user._id })
      .populate({
        path: 'targetId',
        select: 'name avatar role title skills hourlyRate availability location rating bio',
      })
      .sort({ createdAt: -1 });

    res.json({ shortlists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
