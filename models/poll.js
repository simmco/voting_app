var mongoose = require("mongoose");


var pollSchema = mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  options: [{
    val : String,
    num : Number
     }]
});

var Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;
