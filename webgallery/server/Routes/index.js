const router = require('express').Router();
const images = require('./images');
const authentication = require('./authentication');
const comments = require('./comments');
const users = require('./users');

const isAuthenticated = (function (req, res, next) {
	if (!req.username) {
		return res.status(403).json('Access Denied');
	}
	next();
});



router.use('/authentication',authentication);
router.use(users);
router.use(isAuthenticated, images);
router.use(isAuthenticated, comments);

module.exports = router;
