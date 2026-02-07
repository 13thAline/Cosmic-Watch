const mongoose = require("mongoose");
const connectToDB = require("./database/db.js");

const User = require("./models/user.js");
const Asteroid = require("./models/asteroid.js");
const Watchlist = require("./models/watchlist.js");

async function main() {
  await connectToDB();

  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      email: "watcher@email.com",
      passwordHash: "123",
    });
  }

  let asteroid = await Asteroid.findOne();
  if (!asteroid) {
    asteroid = await Asteroid.create({
      nasaId: "999999",
      name: "Test Rock",
      diameterMeters: 100,
      velocityKph: 20000,
      missDistanceKm: 50000,
      closeApproachDate: new Date(),
      isHazardous: false,
      riskScore: 20,
    });
  }

  const watch = await Watchlist.create({
    userId: user._id,
    asteroidId: asteroid._id,
    alertEnabled: true,
  });

  console.log("Watchlist entry:");
  console.log(watch);

  await mongoose.disconnect();
}

main().catch(console.error);