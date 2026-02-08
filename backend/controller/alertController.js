const Alert = require("../models/Alert");

function daysBefore(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

exports.trackAsteroid = async (req, res) => {
  try {
    const {
      asteroidId,
      name,
      closeApproachDate,
      missDistanceKm,
    } = req.body;

    if (!asteroidId || !closeApproachDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid asteroid data",
      });
    }

    const schedules = [
      {
        days: 10,
        severity: "early",
        message: `Early heads-up: ${name} approaches Earth in 10 days.`,
      },
      {
        days: 5,
        severity: "monitor",
        message: `Monitoring phase: ${name} approaches Earth in 5 days.`,
      },
      {
        days: 1,
        severity: "critical",
        message: `Immediate attention: ${name} approaches Earth tomorrow.`,
      },
    ];

    const createdAlerts = [];

    for (const s of schedules) {
      const triggerAt = daysBefore(closeApproachDate, s.days);


      if (triggerAt < new Date()) continue;

      const exists = await Alert.findOne({
        asteroidId,
        severity: s.severity,
      });

      if (exists) continue;

      const alert = await Alert.create({
        asteroidId,
        asteroidName: name,
        missDistanceKm,
        triggerAt,
        severity: s.severity,
        message: s.message,
      });

      createdAlerts.push(alert);
    }

    return res.json({
      success: true,
      created: createdAlerts.length,
      alerts: createdAlerts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create alerts",
    });
  }
};


exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ triggerAt: 1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch alerts",
    });
  }
};


exports.markAsRead = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update alert",
    });
  }
};
