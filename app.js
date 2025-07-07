import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); // Recommended for Google OAuth popups
  next();
});

// Routes
app.use("/api/auth", userRoutes);


// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
