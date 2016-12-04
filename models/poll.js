var mongoose = require("mongoose");


var pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  options: [{
    val : String,
    num : Number
  }],

  creator: {type:mongoose.Schema.Types.ObjectId, ref:'User'}

});

var Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;
