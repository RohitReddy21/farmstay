const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only favorite a farm once
favoriteSchema.index({ user: 1, farm: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
