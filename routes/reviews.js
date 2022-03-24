const express = require('express'),
	  router = express.Router(),
	  reviews = require('../controllers/reviews');
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser,isAuthor } = require("../middleware");

router.route('/:id')
	.post(verifyUser, reviews.createReview)

router.route('/:id/:reviewId')
	.post(verifyUser,/* isAuthor,*/ reviews.editReview)
	.delete(verifyUser,/* isAuthor,*/ reviews.deleteReview)



module.exports = router;