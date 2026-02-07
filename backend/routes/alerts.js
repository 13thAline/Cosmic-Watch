router.get("/", async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 }).limit(10);
  res.json(alerts);
});
