const express = require("express");
const ExpressError = require("../utilities/ExpressError");
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../schemas");
const Campground = require("../models/campground");
const reviews = require("../controllers/reviews");

const wrapAsync = require("../utilities/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post("/", validateReview, isLoggedIn, wrapAsync(reviews.createReview));

router.delete("/:r_id", isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;
