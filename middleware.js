const passport = require('passport');
const jwt = require('jsonwebtoken');
const dev = process.env.NODE_ENV !== 'production';
const db = require('./models');
const expressError = require('./utils/ExpressError');
const config = require('./config/config');

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: !dev,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: 'none'
};

exports.getToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY)
  });
};

exports.getRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY)
  });
  return refreshToken;
};

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.isAuthor = async (req, res, next) => {
  const { id } = req.params.reviewId;
  const review = await db.Review.findById(id);
  if (!blog.user.equals(req.user._id)) {
    //req.flash('error', 'You do not have permission to do that!');
    //return res.redirect(`/campgrounds/${id}`);
    throw new expressError(
      'You do not have the required permission to do this',
      400
    );
  }
  next();
};

exports.isDeckOwner = async (req, res, next) => {
  const id = req.params.id;
  console.log('The id: ' + id);
  const deck = await db.Deck.findById({ _id: id });
  const deckUser = deck.user;
  console.log('The deck: ' + deck);
  console.log('The user in deck: ' + deckUser);
  console.log('The user in request: ' + req.user._id);
  if (!deck.user.equals(req.user._id)) {
    //throw new ExpressError('You do not have the required permission to do this', 400);
    //Check the error handling, for now we are only sending this:
    res.status(400).send('You do not have access!!');
  }
  next();
};

//Next function is used to run validation on adding cards to deck
//To be updated based on the format selected in deck
exports.verifyDeckRules = async (req, res, next) => {
  const id = req.params.id;
  const deck = await db.Deck.findOne({ _id: id }).populate('cards');
  //Use of res.locals
  res.locals.deck = deck;

  let card = await db.Card.findOne({ multiverseid: req.body.multiverseid });
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
  }
  res.locals.card = card;
  //Limits
  const limit = deck.cards.length;
  const cardNumber = deck.cards.filter(
    (x) =>
      x.name === card.name &&
      !x.supertypes.includes('Basic') &&
      !x.types.includes('Land')
  ).length;
  //Setting rules
  let cardLimit = 0;
  let singleCardLimit = 0;

  switch (deck.format) {
    case 'standard':
      cardLimit = config.deckRules.totalCardLimit.standard;
      singleCardLimit = config.deckRules.singleCardLimit.standard;
      break;
    case 'modern':
      cardLimit = config.deckRules.totalCardLimit.modern;
      singleCardLimit = config.deckRules.singleCardLimit.modern;
      break;
    case 'commander':
      cardLimit = config.deckRules.totalCardLimit.commander;
      singleCardLimit = config.deckRules.singleCardLimit.commander;
      break;
    default:
      cardLimit = config.deckRules.totalCardLimit.standard;
      singleCardLimit = config.deckRules.singleCardLimit.standard;
  }
  //Card limit
  if (limit >= cardLimit) {
    //Add error message here
    const err = new expressError(
      `You have already reached the deck card limit of ${cardLimit} cards. Cannot add more cards!`,
      401
    );
    next(err);
    //res.end();
  } else if (cardNumber >= singleCardLimit) {
    //Limiting the number of cards to 4 each in each deck
    //Add error message here
    const err = new expressError(
      `You have already reached the same cards limit of ${singleCardLimit} cards, cannot add more of the same card`,
      401
    );
    next(err);
    //res.end();
  } else {
    next();
  }
};
