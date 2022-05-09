const ExpressError = require("./utilities/ExpressError");
const { cgSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCG = (req, res, next) => {
  const { error } = cgSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const cg = await Campground.findById(req.params.id);
  if (!cg.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do this.");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  return next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  console.log(req.params);
  const { id, r_id } = req.params;
  const review = await Review.findById(r_id);
  console.log(review);
  console.log("//////////////////////////");
  console.log(review.author);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do this.");
    return res.redirect(`/campgrounds/${id}`);
  }
  return next();
};
