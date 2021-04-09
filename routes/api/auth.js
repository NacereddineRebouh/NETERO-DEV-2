const express = require('express');
const router = express.Router();

// @route     GET api/auth

router.get('/', (req, res) =>res.send('AUTH ROUTE is here!'));

module.exports = router;