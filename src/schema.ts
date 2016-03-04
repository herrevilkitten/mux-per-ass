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

var urlSchema = new Schema({
    url: String,
    player: Number
});

export var schema = {
    player: playerSchema,
    url: urlSchema
};
