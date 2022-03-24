const mongoose = require('mongoose');
const { Schema } = mongoose;

const cardSchema = new Schema({
	name : String,
	colors: [{
		type: String
	}],
	type: String,
	image: String,
	deck: {
		type: Schema.Types.ObjectId,
		ref: 'Deck'
		//requires: true
	},
	multiverseid : String,
	description: String,
	supertypes: [{
		type: String
	}],
	types: [{
		type: String
	}],
	rarity: String,
	manaCost: String
	
	
})

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;