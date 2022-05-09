const baseJoi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = baseJoi.extend(extension);

module.exports.cgSchema = joi.object({
  campground: joi
    .object({
      title: joi.string().required().escapeHTML(),
      price: joi.number().required().min(0),
      description: joi.string().required().escapeHTML(),
      location: joi.string().required().escapeHTML(),
    })
    .required(),
  deleteImages: joi.array(),
});

module.exports.reviewSchema = joi.object({
  reviews: joi
    .object({
      rating: joi.number().min(1).max(5).required(),
      body: joi.string().required().escapeHTML(),
    })
    .required(),
});
