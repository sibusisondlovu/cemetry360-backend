const { Plot, Section, Cemetery, BurialEvent, Ownership, Owner } = require('../models');

const getAllPlots = async (req, res) => {
  try {
    const { cemeteryId, sectionId, status, graveType } = req.query;
    const query = {};

    if (sectionId) {
      query.sectionId = sectionId;
    } else if (cemeteryId) {
      const sections = await Section.find({ cemeteryId });
      query.sectionId = { $in: sections.map(s => s._id) };
    }
    if (status) query.status = status;
    if (graveType) query.graveType = graveType;

    const plots = await Plot.find(query)
      .populate('sectionId', 'name code')
      .sort({ uniqueIdentifier: 1 });
    
    // Add cemetery info to plots
    const plotsWithCemetery = await Promise.all(plots.map(async (plot) => {
      const plotObj = plot.toObject();
      if (plot.sectionId) {
        const section = await Section.findById(plot.sectionId);
        if (section) {
          const cemetery = await Cemetery.findById(section.cemeteryId);
          if (cemetery) {
            plotObj.cemetery = cemetery;
            plotObj.section = section;
          }
        }
      }
      return plotObj;
    }));

    res.json(plotsWithCemetery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlotById = async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id);
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    const section = await Section.findById(plot.sectionId);
    const cemetery = section ? await Cemetery.findById(section.cemeteryId) : null;
    const burials = await BurialEvent.find({ plotId: plot._id }).populate('deceasedId');
    const ownerships = await Ownership.find({ plotId: plot._id }).populate('ownerId');

    const plotObj = plot.toObject();
    plotObj.section = section;
    plotObj.cemetery = cemetery;
    plotObj.burials = burials;
    plotObj.ownerships = ownerships;

    res.json(plotObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPlot = async (req, res) => {
  try {
    const section = await Section.findById(req.body.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const cemetery = await Cemetery.findById(section.cemeteryId);
    const uniqueIdentifier = `${cemetery.code}-${section.code}-${req.body.row || 'R'}-${req.body.plotNumber}`;

    const plotData = {
      ...req.body,
      uniqueIdentifier,
    };

    if (req.body.gpsLatitude && req.body.gpsLongitude) {
      plotData.location = {
        type: 'Point',
        coordinates: [req.body.gpsLongitude, req.body.gpsLatitude],
      };
    }

    const plot = await Plot.create(plotData);
    res.status(201).json(plot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePlot = async (req, res) => {
  try {
    if (req.body.gpsLatitude && req.body.gpsLongitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.gpsLongitude, req.body.gpsLatitude],
      };
    }

    const plot = await Plot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    res.json(plot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvailablePlots = async (req, res) => {
  try {
    const { cemeteryId, sectionId, graveType } = req.query;
    const query = { status: 'Available' };

    if (sectionId) {
      query.sectionId = sectionId;
    } else if (cemeteryId) {
      const sections = await Section.find({ cemeteryId });
      query.sectionId = { $in: sections.map(s => s._id) };
    }
    if (graveType) query.graveType = graveType;

    const plots = await Plot.find(query)
      .populate('sectionId')
      .sort({ uniqueIdentifier: 1 });
    
    // Add cemetery info to plots
    const plotsWithCemetery = await Promise.all(plots.map(async (plot) => {
      const plotObj = plot.toObject();
      if (plot.sectionId) {
        const section = await Section.findById(plot.sectionId);
        if (section) {
          const cemetery = await Cemetery.findById(section.cemeteryId);
          if (cemetery) {
            plotObj.cemetery = cemetery;
            plotObj.section = section;
          }
        }
      }
      return plotObj;
    }));

    res.json(plotsWithCemetery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const evaluatePlotReuse = async (req, res) => {
  try {
    const { plotId, yearsSinceLastBurial } = req.body;
    const plot = await Plot.findById(plotId).populate('sectionId');
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    // Find the last burial date for this plot
    const lastBurial = await BurialEvent.findOne({ plotId })
      .sort({ burialDate: -1 })
      .limit(1);

    if (!lastBurial) {
      return res.status(400).json({ error: 'No burial found for this plot' });
    }

    const yearsSince = yearsSinceLastBurial || 20; // Default 20 years
    const lastBurialDate = new Date(lastBurial.burialDate);
    const yearsElapsed = (new Date() - lastBurialDate) / (1000 * 60 * 60 * 24 * 365);

    const eligible = yearsElapsed >= yearsSince;
    const requiresInspection = eligible && plot.status === 'Occupied';

    res.json({
      plotId: plot._id,
      plotIdentifier: plot.uniqueIdentifier,
      lastBurialDate: lastBurial.burialDate,
      yearsElapsed: Math.floor(yearsElapsed * 10) / 10,
      eligible,
      requiresInspection,
      currentStatus: plot.status,
      recommendation: eligible ? 'Plot is eligible for re-use after inspection' : `Plot requires ${Math.ceil(yearsSince - yearsElapsed)} more years before re-use eligibility`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approvePlotReuse = async (req, res) => {
  try {
    const { plotId, inspectionNotes } = req.body;
    const plot = await Plot.findById(plotId);
    
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    if (plot.status !== 'Occupied' && plot.status !== 'Re-usable') {
      return res.status(400).json({ error: 'Plot is not in a state that allows re-use approval' });
    }

    // Update plot to Re-usable status
    const updatedPlot = await Plot.findByIdAndUpdate(
      plotId,
      {
        status: 'Re-usable',
        currentBurials: 0,
        notes: inspectionNotes ? `${plot.notes || ''}\n[Re-use Approved ${new Date().toISOString()}] ${inspectionNotes}`.trim() : plot.notes
      },
      { new: true }
    );

    res.json({
      message: 'Plot approved for re-use',
      plot: updatedPlot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlotsNearLocation = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 1000 } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const plots = await Plot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate('sectionId')
      .limit(50);

    res.json(plots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPlots,
  getPlotById,
  createPlot,
  updatePlot,
  getAvailablePlots,
  getPlotsNearLocation,
  evaluatePlotReuse,
  approvePlotReuse,
};
