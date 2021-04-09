const express = require('express');
const router = express.Router();

// @route     GET api/profile

router.get('/', (req, res) =>res.send('PROFILE ROUTE is here!'));

module.exports = router;