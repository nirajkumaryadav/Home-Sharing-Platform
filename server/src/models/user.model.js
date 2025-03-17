const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        // Add password hashing logic here
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;