const mongoose = require("mongoose");
const { Schema } = mongoose;


const reviewSchema = new Schema({
	body: String,
	likes: Number,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model("Review", reviewSchema);