const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var playerSchema = new Schema({
    id: Number,
    names: [String],
    lastName: String,
    lastSeen: Date,
    lastAction: String,
    connected: Boolean
});

export var schema: {} = {
    player: playerSchema
};
