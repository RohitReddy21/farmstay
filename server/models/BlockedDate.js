const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: 'Blocked by admin' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

blockedDateSchema.index({ farm: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
