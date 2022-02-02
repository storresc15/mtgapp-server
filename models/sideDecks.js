const mongoose = require('mongoose');
const { Schema } = mongoose;

const sideDeckSchema = new Schema({
	deck: {
		type: Schema.Types.ObjectId,
		ref: 'Deck',
		requires: true
	},
	cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }]
})

const SideDeck = mongoose.model('SideDeck', sideDeckSchema);
module.exports = SideDeck;