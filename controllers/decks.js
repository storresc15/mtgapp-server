const  db = require("../models"),
	  mtg = require("mtgsdk"),
	  expressError = require('../utils/ExpressError');

module.exports.index = (req, res) => {
	res.send("Welcome to the decks route!!");
}

module.exports.getById = async(req, res) => {
	const id = req.params.id;  
	const theDeck = await db.Deck.find({_id:id});
	res.send(theDeck);
}

module.exports.getByUserId = async(req, res) => {
	const id = req.user._id;
	const theDecks = await db.Deck.find({user:id});
	res.send(theDecks);
}
//Updatng this route to expose only public decks
module.exports.getAll = async(req, res) => {
	const allDecks = await db.Deck.find( { public: true } ); // only public decks
	res.send(allDecks);
}

module.exports.postDeck = async(req, res) => {
	console.log(req.body);
	console.log(req.body.name);
	console.log(req.body.description);
	console.log(req.body.likes);
	//console.log(req.user._id);
	if(!req.body.name) {
		res.send('Sorry no arguments made it')
	} else{
	const addedDeck = new db.Deck({
		name: req.body.name,
		description: req.body.description,
		likes: req.body.likes,
		user: req.user._id, // Check this one out
		public: req.body.public,
		cards: [],
		sideDecks: []
	});
	await addedDeck.save(function(err) {
		if(err) res.send('There was an error!')
	})
	res.send('Saved the Deck: Well done!')
	}
}

//Update deck route
module.exports.updateDeck = async(req, res) => {
	const { id } = req.params;
	const deck = await db.Deck.findByIdAndUpdate(id);

		deck.name =  req.body.name,
		deck.description = req.body.description,
		deck.likes = req.body.likes,
		deck.public = req.body.public,

	await deck.save();
	console.log(deck);
	res.send('Thedeck was updated: ' + JSON.stringify(deck));
	
}

module.exports.getCardsFromDeck = async(req, res) => {
	console.log('name: ' + req.params.id);
	const { id } = req.params;
	const deckFound = await db.Deck.findOne({_id:id});
	console.log(deckFound);
	const products = deckFound.cards;
	console.log(products);
	let cards = [];
	
	for(let i in products) {
		let item = await db.Card.findOne({_id:products[i]});
		//console.log(item.name);
		//let cardName = item.name;
		if(item) {
		cards.push({
			"name" : item.name,
			"colors" : item.colors,
			"type" : item.type,
			"imgUrl" : item.image,
			"multiverseid" : item.multiverseid
		})
	}
	}
	//res.send(JSON.stringify(products, null, 2));
	res.send(JSON.stringify(cards));
}

module.exports.postCardToDeck = async(req, res, next) => {
	//console.log('Adding the following card: ' + req.body);
	const { id } = req.params;
	const deck = await db.Deck.findOne({ _id: id}).populate('cards');
    let card = await db.Card.findOne({ multiverseid : req.body.multiverseid});
	console.log('found card?? ' + card);
	if(!card) {
		card =  new db.Card({name: req.body.name, colors: req.body.colors, type: req.body.type, image: req.body.image, multiverseid : req.body.multiverseid});
	await card.save(function(err) {
		if(err) res.send('There was an error');
	})
	//await card.save();
	console.log('SAVED THIS CARD TO CARDS TABLE: ' + card);	
	}

	//POC For Limiting the number of cards to 4 each in each deck
	let cardNumber = deck.cards.filter(x => x.name === card.name).length;
	console.log('Have found this number of the card: ' + cardNumber);
	//
	if(cardNumber >= 4) {
		console.log('Have already reached 4 cards, cannot add more')
		//Add error message here
		let err = new expressError('You have already reached 4 cards limit in deck, cannot add more', 401);
		next(err);
		//res.end();
	}else {
		deck.cards.push(card);
		await deck.save();
		res.send(JSON.stringify(deck));
	}
	
}