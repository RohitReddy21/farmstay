const mongoose = require('mongoose');

const openDateSchema = new mongoose.Schema({
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cottages: [{ type: String }],
    reason: { type: String, default: 'Opened by admin' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

openDateSchema.index({ farm: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('OpenDate', openDateSchema);
