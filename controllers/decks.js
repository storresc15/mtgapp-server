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
  const id = req.user._id;
  if (!req.body.name) {
    res.send('Sorry no arguments made it');
  } else {
    const addedDeck = new db.Deck({
      name: req.body.name,
      description: req.body.description,
      likes: req.body.likes,
      user: id,
      public: req.body.public,
      format: req.body.format,
      cards: [],
      sideDecks: [],
      createdDate: Date.now()
    });
    await addedDeck.save(function (err) {
      if (err) res.send('There was an error in the deck creation!');
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
    //(deck.format = req.body.format), // Check if deck could be updated later to a different format
    (deck.likes = req.body.likes),
    (deck.public = req.body.public),
    await deck.save();

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

//Get reviews from Deck
module.exports.getReviewsFromDeck = async (req, res) => {
  const deck = await db.Deck.findById(req.params.id);//.populate('reviews');
  const reviews = await db.Review.find( { _id : { $in : deck.reviews } } ).populate('user');//deck.reviews;

  res.send(JSON.stringify(reviews));
}

module.exports.postCardToDeck = async (req, res, next) => {
  const { id } = req.params;
  const deck = res.locals.deck; //await db.Deck.findOne({ _id: id }).populate('cards');
  let card = res.locals.card; //await db.Card.findOne({ multiverseid: req.body.multiverseid });

  deck.cards.push(card);
  await deck.save();
  let cards = filterDeck(deck.cards);
  res.send(JSON.stringify(cards));
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
    removed.splice(idx, 1);
    count--;
  }

  return removed;
};
