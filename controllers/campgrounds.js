const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
  const cg = await Campground.find({});
  res.render("campgrounds/index", { cg });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCG = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const cg = new Campground(req.body.campground);
  cg.geometry = geoData.body.features[0].geometry; //adds mapbox geometry data to new cg object
  cg.author = req.user._id;
  cg.image = req.files.map((a) => ({ url: a.path, filename: a.filename }));
  await cg.save();
  req.flash("success", "Sucessfully added campground!");
  res.redirect(`/campgrounds/${cg._id}`);
};

module.exports.showCG = async (req, res) => {
  const cg = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!cg) {
    req.flash("error", "Campground unable to be located");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { cg, messages: req.flash("success") });
};

module.exports.renderEditForm = async (req, res) => {
  const cg = await Campground.findById(req.params.id);
  if (!cg) {
    req.flash("error", "Cannot find that campground");
    res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { cg });
};

module.exports.updateCG = async (req, res) => {
  const { id } = req.params;
  const cg = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((a) => ({ url: a.path, filename: a.filename }));
  cg.image.push(...imgs);
  await cg.save();
  if (req.body.deleteImages) {
    for (let file of req.body.deleteImages) {
      await cloudinary.uploader.destroy(file);
    }
    await cg.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
  }
  req.flash("success", "Successfully updated the campground!");
  res.redirect(`/campgrounds/${cg._id}`);
};

module.exports.deleteCG = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the campground!");
  res.redirect("/campgrounds");
};
