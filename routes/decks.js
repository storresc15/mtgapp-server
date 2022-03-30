const express = require('express'),
  router = express.Router(),
  decks = require('../controllers/decks'),
  { verifyUser, isAuthor, isDeckOwner } = require('../middleware');

router.route('/').get(decks.index).post(verifyUser, decks.postDeck);

//Route to get all decks from user
router.get('/mydecks', verifyUser, decks.getByUserId);

//Route to get all the decks
router.get('/alldecks', verifyUser, decks.getAll);

//Route to get the actual deck
router
  .route('/:id')
  .get(verifyUser, decks.getById)
  .post(verifyUser, isDeckOwner, decks.updateDeck)
  .delete(verifyUser, isDeckOwner, decks.deleteDeck);

router
  .route('/:id/cards')
  .get(verifyUser, decks.getCardsFromDeck)
  .post(verifyUser, isDeckOwner, decks.postCardToDeck)
  .delete(verifyUser, isDeckOwner, decks.removeCards);

router.get('/:id/sidedecks', verifyUser, decks.getSideDecksFromDeck);

router.post('/:id/cards/remove', verifyUser, isDeckOwner, decks.removeCards);

module.exports = router;
