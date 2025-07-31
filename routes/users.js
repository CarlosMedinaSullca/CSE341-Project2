const express = require('express');
const router = express.Router();
const validate = require('../utilities/user-validation')
const users = require('../controllers/users');
const {isAuthenticated} = require('../utilities/authenticate');

router.post('/', 
    isAuthenticated,
    validate.addUserRules(),
    validate.addUservalidation,
    users.createUser);

router.get('/', users.getAll);

router.get('/:id', users.getById);

router.put('/:id', 
    isAuthenticated,
    validate.addUserRules(),
    validate.addUservalidation,
    users.updateUser);

router.delete('/:id', isAuthenticated, users.deleteUser);

module.exports = router;