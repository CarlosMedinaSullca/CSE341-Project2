const express = require('express');
const router = express.Router();
const validate = require('../utilities/user-validation')

const users = require('../controllers/users');

router.post('/', 
    validate.addUserRules(),
    validate.addUservalidation,
    users.createUser);

router.get('/', users.getAll);

router.get('/:id', users.getById);

router.put('/:id', 
    validate.addUserRules(),
    validate.addUservalidation,
    users.updateUser);

router.delete('/id', users.deleteUser);

module.exports = router;