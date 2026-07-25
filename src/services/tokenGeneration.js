import express from "express";
import cors from "cors";
import { StreamChat } from "stream-chat";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 1. Load environment variables
dotenv.config();

// 2. Create Express app
const app = express();

// 3. Enable CORS (allow your frontend to connect)
app.use(
  cors({
    origin: process.env.VITE_CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// 4. Get environment variables
// NOTE: the secrets below are intentionally NOT VITE_-prefixed. Vite inlines
// every VITE_* var into the client bundle, so a secret with that prefix can
// leak to the browser (e.g. via a stray `console.log(import.meta.env)`) even
// though this file itself only ever runs server-side under Node.
const streamKey = process.env.VITE_STREAM_API_KEY;
const streamSecret = process.env.STREAM_API_SECRET;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 5. Check if we have all required keys
if (!streamKey || !streamSecret || !supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables!");
  console.log("Please check your .env file has:");
  console.log("- VITE_STREAM_API_KEY");
  console.log("- STREAM_API_SECRET");
  console.log("- VITE_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// 6. Create clients
const supabase = createClient(supabaseUrl, supabaseKey);
const streamClient = new StreamChat(streamKey, streamSecret);

// 7. Token endpoint
app.post("/get-stream-token", async (req, res) => {
  console.log("🔑 Token request received");

  try {
    const { supabaseToken } = req.body;

    if (!supabaseToken) {
      console.log("⚠️ No token provided");
      return res.status(400).json({ error: "supabaseToken is required" });
    }

    // Verify the Supabase token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      console.log("❌ Invalid Supabase token:", error?.message, supabaseToken);
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error || !user) {
      console.log("❌ Invalid Supabase token:", error?.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log(`✅ Generating token for user: ${user.id}`);

    // Create token that expires in 24 hours
    const token = streamClient.createToken(user.id);

    res.json({
      token,
      user_id: user.id,
    });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// 8. Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Token server running on port ${PORT}`);
});
