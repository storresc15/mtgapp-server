const mongoose = require("mongoose");
const url = process.env.MONGO_DB_CONNECTION_STRING

mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

//The below exports from models represent the domains of the data
module.exports.User = require('./user');
module.exports.Deck = require('./decks');
module.exports.SideDeck = require('./sideDecks');
module.exports.Review = require('./reviews');
module.exports.Card = require('./cards');