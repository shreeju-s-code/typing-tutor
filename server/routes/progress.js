import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all progress endpoints
router.use(authMiddleware);

// @route   GET /api/progress
// @desc    Get user progress (current level & history)
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      currentLevel: user.currentLevel,
      wpmHistory: user.wpmHistory
    });
  } catch (error) {
    console.error("Fetch progress error:", error);
    res.status(500).json({ message: "Server error retrieving progress" });
  }
});

// @route   POST /api/progress
// @desc    Update current level and log a finished practice session
router.post("/", async (req, res) => {
  try {
    const { currentLevel, practiceLog } = req.body;

    if (currentLevel === undefined) {
      return res.status(400).json({ message: "currentLevel is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update level if provided
    user.currentLevel = currentLevel;

    // Log practice statistics if provided (wpm, accuracy, level, levelName)
    if (practiceLog && practiceLog.wpm !== undefined && practiceLog.accuracy !== undefined) {
      user.wpmHistory.push({
        wpm: practiceLog.wpm,
        accuracy: practiceLog.accuracy,
        level: practiceLog.level,
        levelName: practiceLog.levelName
      });
    }

    await user.save();

    res.json({
      message: "Progress updated successfully",
      currentLevel: user.currentLevel,
      wpmHistory: user.wpmHistory
    });
  } catch (error) {
    console.error("Save progress error:", error);
    res.status(500).json({ message: "Server error saving progress" });
  }
});

export default router;
