const {body, validationResult} = require('express-validator');

const validate = {};

validate.addUserRules = () => {
    return [
        body("username")
          .trim()
          .escape()
          .notEmpty().withMessage("Name cannot be empty"),
        body("email")
          .trim()
          .escape()
          .isEmail()
          .withMessage("Email is not valid, try again"),
        body("password")
          .trim()
          .escape()
          .notEmpty()
          .isStrongPassword({
            minlength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
          })
          .withMessage("Password does not meet requirements. It must be 12 characters long, at least, 1 uppercase, 1 lowercase and 1 symbol"),
        body("health_goals")
            .isArray()
            .withMessage("health_goals must be an array")
            .custom(arr => Array.isArray(arr) && (arr.length === 0 || arr.every(item => typeof item === 'string')))
            .withMessage('health_goals must be an array of strings or empty'),
        body("allergies")
            .isArray()
            .withMessage("allergies must be an array")
            .custom(arr => Array.isArray(arr) && (arr.length === 0 || arr.every(item => typeof item === 'string')))
            .withMessage('allergies must be an array of strings or empty'),
        body("dislikes")
            .isArray()
            .withMessage("dislikes must be an array")
            .custom(arr => Array.isArray(arr) && (arr.length === 0 || arr.every(item => typeof item === 'string')))
            .withMessage('dislikes must be an array of strings or empty'),
    ]
}


validate.addUservalidation = (req, res, next) => {
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