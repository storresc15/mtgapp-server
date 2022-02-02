const express = require('express'),
	  router = express.Router(),
	  cards = require('../controllers/cards');

router.route('/')
	.get(cards.index)

router.route('/all')
	.get(cards.getAllCards)


router.route('/add/:name')
	.get(cards.addCardToDB)

router.route('/search/:name')
	.get(cards.searchByName)

router.route('/:id')
	.get(cards.getByMUID)

module.exports = router;
