const express = require('express');
const router = express.Router();
const { Plot, Deceased, BurialEvent, Section, Cemetery } = require('../models');

router.get('/search', async (req, res) => {
  try {
    const { q, cemetery, section, graveNumber, name, dateOfDeath } = req.query;

    if (!q && !name && !graveNumber) {
      return res.json([]);
    }

    const query = {};
    if (name) {
      query.fullName = { $regex: name, $options: 'i' };
    }
    if (dateOfDeath) {
      query.dateOfDeath = new Date(dateOfDeath);
    }

    const deceased = await Deceased.find(query)
      .limit(50)
      .populate({
        path: 'burials',
        populate: {
          path: 'plotId',
          match: graveNumber ? { uniqueIdentifier: { $regex: graveNumber, $options: 'i' } } : {},
          populate: {
            path: 'sectionId',
            match: section ? { name: { $regex: section, $options: 'i' } } : {},
            populate: {
              path: 'cemeteryId',
              match: cemetery ? { name: { $regex: cemetery, $options: 'i' } } : {},
            },
          },
        },
      });

    res.json(deceased);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
