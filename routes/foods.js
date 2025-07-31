const express = require('express');
const router = express.Router();
const validate = require('../utilities/food-validation');
const {isAuthenticated} = require('../utilities/authenticate');

const foods = require('../controllers/foods');

router.post('/',
    isAuthenticated,
    validate.addFoodRules(),
    validate.addFoodvalidation, 
    foods.createFood);

router.get('/', foods.getAll);

router.get('/:id', foods.getById);

router.put('/:id', 
    isAuthenticated,
    validate.addFoodRules(),
    validate.addFoodvalidation,
    foods.updateFood);

router.delete('/:id',
    isAuthenticated, 
    foods.deleteFood);

module.exports = router;