const mongoose = require('mongoose');
const { Schema } = mongoose;



const decksSchema = new Schema({
	name: String,
	description: String,
	likes: Number,
	public: Boolean,
	cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
	sideDecks: [{ type: Schema.Types.ObjectId, ref: 'SideDeck' }],
	user: { type: Schema.Types.ObjectId, ref: 'User' }
	
})

const Deck = mongoose.model('Deck', decksSchema);
module.exports = Deck;