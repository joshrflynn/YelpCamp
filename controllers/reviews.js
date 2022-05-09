const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const cg = await Campground.findById(req.params.id);
  const review = new Review(req.body.reviews);
  review.author = req.user._id;
  console.log(review);
  cg.reviews.push(review);
  await review.save();
  await cg.save();
  req.flash("success", "Successfully posted your review!");
  res.redirect(`/campgrounds/${cg._id}`);
};

module.exports.deleteReview = async (req, res) => {
  await Campground.findByIdAndUpdate(req.params.id, {
    $pull: {
      reviews: req.params.r_id,
    },
  });

  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/campgrounds/${req.params.id}`);
};
