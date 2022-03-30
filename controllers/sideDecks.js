const db = require('../models'),
  mtg = require('mtgsdk'),
  expressError = require('../utils/ExpressError');

module.exports.getById = async (req, res) => {
  const id = req.params.id;
  const sideDeck = await db.SideDeck.find({ _id: id }).populate('cards');
  res.send(sideDeck);
};

module.exports.createSideDeck = async (req, res) => {
  const id = req.user._id;
  if (!req.body.name) {
    let err = new expressError('Sorry No arguments made it', 401);
    next(err);
  } else {
    const addedDeck = new db.SideDeck({
      name: req.body.name,
      deck: req.body.deckId, // Check this one out
      cards: [],
      createdDate: Date.now()
    });
    await addedDeck.save(function (err) {
      if (err) res.send('There was an error!'); //Update with error
    });
    const deck = await db.Deck.findOne({ _id: req.body.deckId });
    deck.sideDecks.push(card);
    await deck.save();

    res.send(JSON.stringify(deck.sideDecks));
  }
};

module.exports.updateCards = async (req, res) => {
  const id = req.params.id;
  const sideDeck = await db.SideDeck.findOne({ _id: id }).populate('cards');

  const cards = req.cards;
  sideDeck.cards = cards;
  await sideDeck.save();

  res.send(JSON.stringify(sideDeck));
};

module.exports.postCardToDeck = async (req, res, next) => {
  const { id } = req.params;
  const sideDeck = await db.SideDeck.findOne({ _id: id }).populate('cards');
  let card = await db.Card.findOne({ multiverseid: req.body.multiverseid });
  console.log('found card?? ' + card);
  if (!card) {
    card = new db.Card({
      name: req.body.name,
      colors: req.body.colors,
      type: req.body.type,
      image: req.body.image,
      multiverseid: req.body.multiverseid
    });
    await card.save(function (err) {
      if (err) res.send('There was an error');
    });
    console.log('SAVED THIS CARD TO CARDS TABLE: ' + card);
  }

  //POC For Limiting the number of cards to 4 each in each deck
  let cardNumber = deck.cards.filter((x) => x.name === card.name).length;
  console.log('Have found this number of the card: ' + cardNumber);
  //
  if (cardNumber >= 4) {
    console.log('Have already reached 4 cards, cannot add more');
    //Add error message here
    let err = new expressError(
      'You have already reached the same cards limit in deck(4), cannot add more of the same card',
      401
    );
    next(err);
    //res.end();
  } else {
    sideDeck.cards.push(card);
    await sideDeck.save();
    res.send(JSON.stringify(sideDeck.cards));
  }
};

module.exports.deleteSideDeck = async (req, res) => {};
