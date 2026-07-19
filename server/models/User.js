import mongoose from "mongoose";

const wpmHistorySchema = new mongoose.Schema({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  level: { type: Number, required: true },
  levelName: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  currentLevel: {
    type: Number,
    default: 0
  },
  wpmHistory: [wpmHistorySchema]
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
