if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express"),
	  cors = require('cors'),
	  bodyParser = require("body-parser"),
	  cookieParser = require("cookie-parser"),
	  passport = require("passport"),
	  methodOverride = require("method-override"),
	  morgan = require('morgan'),
	  mtg = require('mtgsdk'),
	  path = require('path'),
	  db = require("./models"),
	  errorHandler = require('./utils/error'), // Updated for error POC
	  expressError = require('./utils/ExpressError'),
	  PORT = process.env.PORT || 3001;

	  

require("./strategies/JwtStrategy")
require("./strategies/LocalStrategy")
require("./middleware")

const userRoutes = require('./routes/users'),
	  cardRoutes = require('./routes/cards'),
	  setRoutes = require('./routes/sets'),
	  deckRoutes = require('./routes/decks');
const app = express();
app.use(morgan('tiny'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser(process.env.COOKIE_SECRET));

/*const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : []

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },

  credentials: true,
}
//Quick comment to test git and github
*/
//App config
//app.use(cors(corsOptions));
app.use(cors());
app.use(passport.initialize());

//RESTFULL ROUTES
app.use('/users', userRoutes);
app.use('/cards', cardRoutes);
app.use('/decks', deckRoutes);
app.use('/sets', setRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Hello from server!" });
});
app.use(function(req, res, next) {
	let err = new expressError('Not Found!', 404);
	next(err);
})

//Error Handling route
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})