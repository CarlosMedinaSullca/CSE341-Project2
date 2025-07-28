const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;


const getAll = async (req, res) => {
    try {
        const lists = await mongodb.getDb().db().collection('users').find().toArray();
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
        const user = await mongodb.getDb().db().collection('users').findOne({ _id: userId });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async(req, res) => {
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        health_goals: req.body.health_goals,
        allergies: req.body.allergies,
        dislikes: req.body.dislikes
    };

    const response = await mongodb.getDb().db().collection('users').insertOne(user);
    if (response.acknowledged) {
        res.status(201).json(response);
    } else {
        res.status(500).json(response.error || 'Some error occurred while creating the contact.');
    }
}

const updateUser = async (req, res) => {
  const userId = new ObjectId(req.params.id);
  // be aware of updateOne if you only want to update specific fields
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        health_goals: req.body.health_goals,
        allergies: req.body.allergies,
        dislikes: req.body.dislikes
    };
  const response = await mongodb
    .getDb()
    .db()
    .collection('users')
    .replaceOne({ _id: userId }, user);
  console.log(response);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the user.');
  }
};

const deleteUser = async (req, res) => {
  const userId = new ObjectId(req.params.id);
  const response = await mongodb.getDb().db().collection('users').remove({ _id: userId }, true);
  console.log(response);
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while deleting the user.');
  }
};


module.exports = {
    getAll,
    getById,
    createUser,
    updateUser,
    deleteUser
};