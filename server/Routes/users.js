const router = require('express').Router();
const { getUsers, getUser } = require('../Controllers/authentication');
const { getGallery } = require('../Controllers/images');
const validator = require('express-validator');

router.get('/user/', function (req, res) {
	return res.status(200).json({ user: req.username });
});

router.get('/users/', function (req, res) {
	getUsers().then(users => {
		return res.status(200).json(users);
	}).catch(err => {
		res.status(500).json(err.message);
	});
});

router.put('/gallery/switch/', function (req, res) {
	const gallery = req.body.gallery;
	getUsers().then(users => {
		const validGallery = users.findIndex((user) => {
			return user.username = gallery;
		}) !== -1;
		if (users && validGallery) {
			req.session.gallery = gallery;
			return res.status(200).json("Switch successfull");
		}
	})
});

router.get('/gallery/default', function (req, res) {
	getGallery(req.gallery).then(image => res.status(200).json(image)).catch(err => res.status(500).json(err.message));
})

module.exports = router;