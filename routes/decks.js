const express = require('express'),
	  router = express.Router(),
	  decks = require('../controllers/decks'),
	  {verifyUser, isAuthor, isDeckOwner} = require('../middleware');

router.route('/')
	.get(decks.index)
	.post(verifyUser, decks.postDeck)

//Route to get all decks from user
router.get('/mydecks',verifyUser, decks.getByUserId)

//Route to get all the decks
router.get('/all',verifyUser, decks.getAll)

//Route to get the actual deck
router.route('/:id')
	.get(verifyUser, decks.getById)
	.post(verifyUser,isDeckOwner, decks.updateDeck)

router.route('/:id/cards')
	.get(verifyUser, decks.getCardsFromDeck)
	.post(verifyUser,isDeckOwner, decks.postCardToDeck)


module.exports = router;