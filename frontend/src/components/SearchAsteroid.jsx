exports.searchAsteroid = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Asteroid name required" });
    }

    let page = 0;
    let found = null;

    while (page < 10 && !found) { // search first 10 pages
      const response = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/neo/browse?page=${page}&api_key=${process.env.NASA_API_KEY}`
      );

      found = response.data.near_earth_objects.find(a =>
        a.name.toLowerCase().includes(name.toLowerCase())
      );

      page++;
    }

    if (!found) {
      return res.status(404).json({ message: "Asteroid not found in NASA dataset" });
    }

    const approach = found.close_approach_data[0];

    res.json({
      name: found.name,
      hazardous: found.is_potentially_hazardous_asteroid,
      diameterKm:
        found.estimated_diameter.kilometers.estimated_diameter_max,
      closeApproachDate: approach.close_approach_date,
      distanceKm: approach.miss_distance.kilometers,
      velocityKph: approach.relative_velocity.kilometers_per_hour,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "NASA API error" });
  }
};
