const db = require('../models'),
  mtg = require('mtgsdk'),
  expressError = require('../utils/ExpressError');

module.exports.index = (req, res) => {
  res.send('Welcome to the decks route!!');
};

//Get Deck by ID
module.exports.getById = async (req, res) => {
  const id = req.params.id;
  const theDeck = await db.Deck.find({ _id: id });
  res.send(theDeck);
};

//Get decks by User Id
module.exports.getByUserId = async (req, res) => {
  const id = req.user._id;
  const theDecks = await db.Deck.find({ user: id }).populate('user');
  res.send(theDecks);
};
//Updatng this route to expose only public decks
module.exports.getAll = async (req, res) => {
  const allDecks = await db.Deck.find({ public: true }).populate('user'); // only public decks
  res.send(allDecks);
};

module.exports.postDeck = async (req, res) => {
  console.log(req.body);
  console.log(req.body.name);
  console.log(req.body.description);
  console.log(req.body.likes);
  //console.log(req.user._id);
  const id = req.user._id;
  if (!req.body.name) {
    res.send('Sorry no arguments made it');
  } else {
    const addedDeck = new db.Deck({
      name: req.body.name,
      description: req.body.description,
      likes: req.body.likes,
      user: id, // Check this one out
      public: req.body.public,
      cards: [],
      sideDecks: [],
      createdDate: Date.now()
    });
    await addedDeck.save(function (err) {
      if (err) res.send('There was an error!'); //Update with error
    });
    const theDecks = await db.Deck.find({ user: id }).populate('user');
    res.send(theDecks); //updated with the new values to populate FE
  }
};

//Update deck route
module.exports.updateDeck = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const deck = await db.Deck.findByIdAndUpdate(id);

  (deck.name = req.body.name),
    (deck.description = req.body.description),
    (deck.likes = req.body.likes),
    (deck.public = req.body.public),
    await deck.save();
  console.log(deck);

  const theDecks = await db.Deck.find({ user: userId });
  res.send(theDecks); //updated with the new values to populate FE
};

module.exports.getCardsFromDeck = async (req, res) => {
  //console.log('name: ' + req.params.id);
  const { id } = req.params;
  const deckFound = await db.Deck.findOne({ _id: id }).populate('cards');
  //console.log(deckFound);
  const products = deckFound.cards;
  let cards = filterDeck(products);

  res.send(JSON.stringify(cards));
};

module.exports.getSideDecksFromDeck = async (req, res) => {
  //console.log('name: ' + req.params.id);
  const { id } = req.params;
  const deckFound = await db.Deck.findOne({ _id: id }).populate('sideDecks');
  //console.log(deckFound);
  const products = deckFound.sideDecks;

  res.send(JSON.stringify(products));
};

module.exports.postCardToDeck = async (req, res, next) => {
  //console.log('Adding the following card: ' + req.body);
  const { id } = req.params;
  const deck = await db.Deck.findOne({ _id: id }).populate('cards');
  let card = await db.Card.findOne({ multiverseid: req.body.multiverseid });
  console.log('found card?? ' + card);
  if (!card) {
    card = new db.Card({
      name: req.body.name,
      colors: req.body.colors,
      type: req.body.type,
      image: req.body.image,
      multiverseid: req.body.multiverseid,
      description: req.body.description,
      supertypes: req.body.supertypes,
      types: req.body.types,
      rarity: req.body.rarity,
      manaCost: req.body.manaCost
    });
    await card.save(function (err) {
      if (err) res.send('There was an error');
    });
    //await card.save();
    console.log('SAVED THIS CARD TO CARDS TABLE: ' + card);
  }
  //POC for 60 card limit
  let limit = deck.cards.length;
  console.log('The Length of the cards array: ' + limit);
  if (limit >= 60) {
    console.log('Have already reached 60 cards, cannot add more');
    //Add error message here
    let err = new expressError(
      'You have already reached the deck card limit (60). Cannot add more cards!',
      401
    );
    next(err);
    //res.end();
  }

  //POC For Limiting the number of cards to 4 each in each deck
  let cardNumber = deck.cards.filter(
    (x) =>
      x.name === card.name &&
      !x.supertypes.includes('Basic') &&
      !x.types.includes('Land')
  ).length;
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
    deck.cards.push(card);
    await deck.save();
    let cards = filterDeck(deck.cards);
    res.send(JSON.stringify(cards));
  }
};

module.exports.updateCards = async (req, res, next) => {
  const id = req.params.id;
  const deck = await db.Deck.findOne({ _id: id }).populate('cards');

  const cards = req.cards;
  deck.cards = cards;
  await deck.save();

  res.send(JSON.stringify(deck));
};

module.exports.removeCards = async (req, res, next) => {
  const id = req.params.id;
  const deck = await db.Deck.findOne({ _id: id }).populate('cards');

  const cards = deck.cards;

  console.log('-----------------------------------------');
  console.log('Is there an actual body: ' + req.body);
  console.log('The name of the card to be removed: ' + req.body.name);
  console.log('The Count to be removed: ' + req.body.count);

  console.log('-----------------------------------------');

  const removed = removeCardsFromDeck(cards, req.body.name, req.body.count);

  deck.cards = removed;
  await deck.save();

  const updatedcards = filterDeck(removed);
  res.send(JSON.stringify(updatedcards));
};

module.exports.deleteDeck = async (req, res, next) => {
  const { id } = req.params;
  await db.Deck.findByIdAndDelete(id);

  const theDecks = await db.Deck.find({ user: id });
  res.send(theDecks); //updated with the new values to populate FE
};

const filterDeck = (products) => {
  let cards = [];

  products.forEach(function (arrayItem) {
    let cardFound = cards.filter((x) => x.name === arrayItem.name).length > 0;

    if (!cardFound) {
      cards.push({
        name: arrayItem.name,
        colors: arrayItem.colors,
        type: arrayItem.type,
        image: arrayItem.image,
        multiverseid: arrayItem.multiverseid,
        description: arrayItem.description,
        supertypes: arrayItem.supertypes,
        types: arrayItem.types,
        rarity: arrayItem.rarity,
        manaCost: arrayItem.manaCost,
        count: 1
      });
    } else {
      let count =
        cards[cards.findIndex((el) => el.name === arrayItem.name)].count + 1;

      let updatedCard = {
        name: arrayItem.name,
        colors: arrayItem.colors,
        type: arrayItem.type,
        image: arrayItem.image,
        multiverseid: arrayItem.multiverseid,
        description: arrayItem.description,
        supertypes: arrayItem.supertypes,
        types: arrayItem.types,
        rarity: arrayItem.rarity,
        manaCost: arrayItem.manaCost,
        count: count
      };

      cards[cards.findIndex((el) => el.name === updatedCard.name)] =
        updatedCard;
    }
  });
  return cards;
};

const removeCardsFromDeck = (cards, name, count) => {
  if (count <= 0 || count > 4) return cards;

  let removed = cards;

  while (count > 0) {
    let idx = removed.findIndex((p) => p.name == name);
    console.log('Removing: ' + name);
    removed.splice(idx, 1);
    count--;
  }

  console.log('Cars: ' + removed);

  return removed;
};
