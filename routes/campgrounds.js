const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilities/wrapAsync");
const campgrounds = require("../controllers/campgrounds");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const { isLoggedIn, isAuthor, validateCG } = require("../middleware");

router
  .route("/")
  .get(wrapAsync(campgrounds.index))
  .post(isLoggedIn, upload.array("campground[image]"), validateCG, wrapAsync(campgrounds.createCG));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(campgrounds.showCG)
  .put(isLoggedIn, isAuthor, upload.array("campground[image]"), validateCG, wrapAsync(campgrounds.updateCG))
  .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCG));

router.get("/:id/edit", isLoggedIn, isAuthor, wrapAsync(campgrounds.renderEditForm));

module.exports = router;
