const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;



const getAll = async (req, res) => {
    try {
        const lists = await mongodb.getDb().db().collection('foods').find().toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getById = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json('Must use a valid user id to find a user.');
        return;
    }
    try {
        const userId = new ObjectId(req.params.id);
        const user = await mongodb.getDb().db().collection('foods').findOne({ _id: userId });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFood = async (req, res) => {

    const food = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        nutrients: req.body.nutrients,
        serving_size: req.body.serving_size,
        is_vegan: req.body.is_vegan,
        is_vegetarian: req.body.is_vegetarian,
        is_gluten_free: req.body.is_gluten_free,
        common_allergens: req.body.common_allergens
    };

    try {
        const response = await mongodb.getDb().db().collection('foods').insertOne(food);
        if (response.acknowledged) {
            res.status(201).json(response);
        } else {
            res.status(500).json(response.error || 'Some error occurred while creating the food.');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFood = async (req, res) => {
  const foodId = new ObjectId(req.params.id);
  // be aware of updateOne if you only want to update specific fields
  const food = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        nutrients: req.body.nutrients,
        serving_size: req.body.serving_size,
        is_vegan: req.body.is_vegan,
        is_vegetarian: req.body.is_vegetarian,
        is_gluten_free: req.body.is_gluten_free,
        common_allergens: req.body.common_allergens
    };
    try {
      const response = await mongodb
      .getDb()
      .db()
      .collection('foods')
      .replaceOne({ _id: foodId }, food);
      console.log(response);
      if (response.modifiedCount > 0) {
        res.status(204).send();
      } else {
        res.status(500).json(response.error || 'Some error occurred while updating the food.');
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

};

const deleteFood = async (req, res) => {
  const foodId = new ObjectId(req.params.id);
  try {
    const response = await mongodb.getDb().db().collection('foods').remove({ _id: foodId }, true);console.log(response);
    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json(response.error || 'Some error occurred while deleting the food.');
    }
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getAll,
    getById,
    createFood,
    updateFood,
    deleteFood
};