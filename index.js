const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.get("/validateKey/:key", async (req, res) => {
  const { key } = req.params;

  try {
    await client.connect();
    const db = client.db("keys");
    const collection = db.collection("keys");

    const found = await collection.findOne({ key });

    if (found) {
      res.json({ valid: true, data: found });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error("Error validating key:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
