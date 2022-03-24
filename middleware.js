const passport = require("passport")
const jwt = require("jsonwebtoken")
const dev = process.env.NODE_ENV !== "production"
const  db = require("./models");
const ExpressError = require('./utils/ExpressError');

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: !dev,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: "none",
}

exports.getToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  })
}

exports.getRefreshToken = user => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  })
  return refreshToken
}

exports.verifyUser = passport.authenticate("jwt", { session: false })


exports.isAuthor = async (req, res, next) => {
    const { id } = req.params.reviewId;
    const review = await db.Review.findById(id);
    if (!blog.user.equals(req.user._id)) {
        //req.flash('error', 'You do not have permission to do that!');
        //return res.redirect(`/campgrounds/${id}`);
		throw new ExpressError('You do not have the required permission to do this', 400);
    }
    next(); 
}

exports.isDeckOwner = async (req, res, next) => {
	const id  = req.params.id;
	console.log('The id: ' + id)
	const deck = await db.Deck.findById({_id:id});
	const deckUser = deck.user;
	console.log('The deck: ' + deck);
	console.log('The user in deck: ' + deckUser)
	console.log('The user in request: ' + req.user._id)
	if(!deck.user.equals(req.user._id)) {
		//throw new ExpressError('You do not have the required permission to do this', 400);
		//Check the error handling, for now we are only sending this: 
		res.status(400).send('You do not have access!!');

	}
	next();
}