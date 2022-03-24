const db = require("../models");

module.exports.getDeckReviews = async(req, res) => {
	const deck = await db.Deck.findById(req.params.id).populate('reviews');
	const reviews = deck.reviews;
	
	res.send(JSON.stringify(reviews));
}

module.exports.createReview = async (req, res) => {
    const deck = await db.Deck.findById(req.params.id);
    const review = new db.Review();
	console.log('The review body' + req.body.body)
	review.body = req.body.body;
    review.user = req.user._id;
    deck.reviews.push(review);
    await review.save();
    await deck.save();
	
	res.send(JSON.stringify(deck.reviews));
}

module.exports.editReview = async (req, res) => {
	
    const { id, reviewId } = req.params;
    //await db.FamilyBlog.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const review = await db.Review.findByIdAndUpdate(reviewId);
	review.body = req.body.body;
    await review.save();
	res.send(`This Review was succesfully updated: ${review._id}`)
	
}

module.exports.deleteReview = async (req, res) => {
	
    const { id, reviewId } = req.params;
    await db.Deck.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await db.Review.findByIdAndDelete(reviewId);
	res.send(`This Review was succesfully deleted`)
}