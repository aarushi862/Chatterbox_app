const User = require('../models/User');

// @route  POST /api/contacts/sync
// @access Private — sync contacts from phone/device
const syncContacts = async (req, res) => {
  try {
    const { emails = [], phones = [] } = req.body;

    if ((!emails || emails.length === 0) && (!phones || phones.length === 0)) {
      return res.status(400).json({ message: 'Provide emails or phone numbers' });
    }

    // Normalize inputs
    const normalizedEmails = emails
      .map(e => e?.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 100); // Limit to 100 contacts

    const normalizedPhones = phones
      .map(p => p?.toString().replace(/\D/g, '')) // Remove non-digits
      .filter(p => p && p.length >= 10) // Valid phone numbers
      .slice(0, 100);

    // Find matching users (exclude current user)
    const matchedUsers = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { email: { $in: normalizedEmails } },
        { phone: { $in: normalizedPhones } }
      ]
    }).select('name email phone avatar');

    // Separate registered and unregistered
    const matchedEmails = matchedUsers.map(u => u.email);
    const matchedPhones = matchedUsers.map(u => u.phone).filter(Boolean);

    const registered = matchedUsers.map(user => ({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      },
      matchedBy: user.email || user.phone
    }));

    const unregistered = [];

    // Add unregistered emails
    normalizedEmails.forEach(email => {
      if (!matchedEmails.includes(email)) {
        unregistered.push({
          email,
          phone: null,
          name: email.split('@')[0] // Use email prefix as name
        });
      }
    });

    // Add unregistered phones
    normalizedPhones.forEach(phone => {
      if (!matchedPhones.includes(phone)) {
        // Check if we already added this contact via email
        const existingIndex = unregistered.findIndex(u => u.phone === phone);
        if (existingIndex === -1) {
          unregistered.push({
            email: null,
            phone,
            name: phone // Use phone as name
          });
        }
      }
    });

    res.json({
      registered,
      unregistered,
      stats: {
        total: normalizedEmails.length + normalizedPhones.length,
        found: registered.length,
        notFound: unregistered.length
      }
    });
  } catch (error) {
    console.error('Sync contacts error:', error.message);
    res.status(500).json({ message: 'Failed to sync contacts' });
  }
};

module.exports = { syncContacts };
