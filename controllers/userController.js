import { ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Notebook from "../models/Notebook.js";

// Redirect to Google OAuth
export const googleAuth = (req, res) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    state: "signup", // You can use this to track the flow
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
  });

  res.redirect(authUrl);
};

// Handle Google OAuth callback
export const googleCallback = async (req, res) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { code, error, state } = req.query;

    if (error) {
      console.log("Google returned error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?error=google_error`
      );
    }

    if (!code) {
      console.log("No authorization code received from Google");
      return res.redirect(`${process.env.FRONTEND_URL}/signup?error=no_code`);
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code: code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        avatar: picture,
      });
      await user.save();
      console.log("New user created:", user._id);
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Redirect to frontend with token
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/callback?token=${jwtToken}&user=${encodeURIComponent(
        JSON.stringify({
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        })
      )}`
    );
  } catch (error) {
    console.error(
      "Google callback error:",
      error.response?.data || error.message
    );
    res.redirect(`${process.env.FRONTEND_URL}/signup?error=callback_error`);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const notebooks = await Notebook.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ ...user.toObject(), notebooks });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const changeSettings = async (req, res) => {
  console.log("settings changing");
  try {
    const { name, avatar, role } = req.body;
    const userId = req.user.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, avatar, role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Settings updated", user: updatedUser });
  } catch {
    res.json({ message: "Server error", error: error.message });
  }
};

// Create a new notebook
export const createNotebook = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId;

    // Create new notebook
    const newNotebook = new Notebook({
      userId,
      title
    });
    
    await newNotebook.save();
    console.log("New notebook created:", newNotebook);
    
    console.log("=== CREATE NOTEBOOK SUCCESS ===");
    res.json(newNotebook);
    
  } catch (error) {
    console.log("=== CREATE NOTEBOOK ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Couldn't create notebook", error: error.message });
  }
};
