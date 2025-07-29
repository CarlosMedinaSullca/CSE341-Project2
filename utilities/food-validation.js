const {body, validationResult} = require('express-validator');

const validate = {};

validate.addFoodRules = () => {
    return [
        body("name")
          .trim()
          .escape()
          .notEmpty().withMessage("Name cannot be empty"),
        body("description")
          .trim()
          .escape()
          .notEmpty().withMessage("Description cannot be empty"),
        body("category")
          .trim()
          .escape()
          .notEmpty().withMessage("Category cannot be empty"),
        body("nutrients")
          .isObject()
          .withMessage("Nutrients must beinserted as a json object")
          .notEmpty().withMessage("Nutrients must not be empty"),
        body("serving_size")
          .trim()
          .escape()
          .notEmpty().withMessage("Serving_size cannot be empty"),
        body("is_vegan")
          .isBoolean().withMessage("is_vegan must be boolean")
          .notEmpty().withMessage("is_vegan cannot be empty"),
        body("is_vegetarian")
          .isBoolean().withMessage("is_vegetarian must be boolean")
          .notEmpty().withMessage("is_vegetarian cannot be empty"),
        body("is_gluten_free")
          .isBoolean().withMessage("is_gluten_free must be boolean")
          .notEmpty().withMessage("is_gluten_free cannot be empty"),
        body("common_allergens")
          .isArray()
          .withMessage("common_allergens must be an array")
          .custom(arr => Array.isArray(arr) && (arr.length === 0 || arr.every(item => typeof item === 'string')))
          .withMessage('common_allergens must be an array of strings or empty'),
    ]
}


validate.addFoodvalidation = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({[err.param]: err.msg}));
    return res.status(422).json({
        errors : extractedErrors,
    })
}

module.exports = validate;