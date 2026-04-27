// models/Task.js
const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or unique ID
  joinedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteers: [volunteerSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
