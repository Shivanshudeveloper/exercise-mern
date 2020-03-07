const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create a Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

});

module.exports = User = mongoose.model("user_register", UserSchema);