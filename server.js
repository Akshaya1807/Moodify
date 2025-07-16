const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔐 Get Spotify access token
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

// 🔍 Search Spotify playlists by mood
async function searchSpotifyPlaylists(query) {
  const token = await getSpotifyAccessToken();

  const response = await axios.get("https://api.spotify.com/v1/search", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: "playlist",
      limit: 10,
    },
  });

  return response.data.playlists.items;
}

// 🎵 Main recommendation route
app.post("/recommend", async (req, res) => {
  const { moodText } = req.body;
  console.log("🧠 Mood text received:", moodText);

  try {
    // 🔍 Simple keyword-based mood detection
    let detectedMood = "happy"; // default
    const moodMap = {
      sad: ["sad", "depressed", "cry", "low"],
      happy: ["happy", "joy", "good", "fun"],
      angry: ["angry", "mad", "furious"],
      relaxed: ["relaxed", "calm", "peaceful"],
      excited: ["excited", "energetic", "pumped"],
    };

    for (const mood in moodMap) {
      if (moodMap[mood].some(keyword => moodText.toLowerCase().includes(keyword))) {
        detectedMood = mood;
        break;
      }
    }

    console.log("🎯 Detected mood:", detectedMood);

    // 🔎 Search Spotify for playlists
    const query = `${detectedMood} playlist`;
    const playlists = await searchSpotifyPlaylists(query);

    console.log("🔎 Playlists found:", playlists.length);

    // ✅ Filter out invalid/broken playlists
    const filtered = playlists.filter(p =>
      p &&
      p.name &&
      p.external_urls?.spotify &&
      p.images?.length > 0 &&
      p.images[0].url
    );

    // ⚠️ If none are valid, return fallback
    if (!filtered || filtered.length === 0) {
      console.warn("⚠️ No valid playlists found. Using fallback.");
      return res.json({
        name: "Chill Vibes (Fallback)",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWV7EzJMK2FUI",
        image: "https://i.scdn.co/image/ab67706f00000002756b2e75595c1448cc4c91c0",
        detectedMood,
      });
    }

    // 🎯 Pick a random valid playlist
    const random = filtered[Math.floor(Math.random() * filtered.length)];

    console.log("✅ Sending playlist:", {
      name: random.name,
      url: random.external_urls.spotify,
      image: random.images[0].url,
    });

    res.json({
      name: random.name,
      url: random.external_urls.spotify,
      image: random.images[0].url,
      detectedMood,
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🚀 Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
