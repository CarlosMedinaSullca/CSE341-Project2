const express = require('express');
const router = express.Router();
const validate = require('../utilities/food-validation');

const foods = require('../controllers/foods');

router.post('/',
    validate.addFoodRules(),
    validate.addFoodvalidation, 
    foods.createFood);

router.get('/', foods.getAll);

router.get('/:id', foods.getById);

router.put('/:id', 
    validate.addFoodRules(),
    validate.addFoodvalidation,
    foods.updateFood);

router.delete('/:id', foods.deleteFood);

module.exports = router;