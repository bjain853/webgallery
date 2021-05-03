const router = require('express').Router();
const { addUser, authenticateUser } = require('../Controllers/authentication');

router.post('/signup', function (req, res) {
	const { username, password } = req.body;
	if (!username || !password) return res.status(400).json('Not enough info provided');
	addUser(username, password)
		.then((user) => {

			if (user) {
				req.session.username = user._id;
				req.session.gallery = user._id;
				return res.status(200).json(user);
			} else {
				return res.status(500).json('User cannot be added');
			}
		})
		.catch((err) => {

			if (err.message === `Username ${username} already exists`) return res.status(409).json(err.message);
			else return res.status(500).json(err.message);
		});
});

router.post('/signin', function (req, res) {

	const { username, password } = req.body;

	if (!username || !password) return res.status(400).json('Not enough Info provided');

	authenticateUser(username, password)
		.then(({same,user}) => {
			if (user && same) {

				req.session.username = user._id;
				req.session.gallery = user._id;
				return res.status(200).json({_id:user._id});
			} else {
				return res.status(403).json('Access Denied');
			}
		})
		.catch((err) => {
			if (err.message === `Username ${username} doesn't exist`) return res.status(404).json(err.message);
			else return res.status(500).json(err.message);
		});
});

router.get('/signout/', function (req, res) {
	req.session.destroy((err)=>{
		if(err) return res.status(500).json(err.message);
	});
	res.redirect('/login.html');
});

module.exports = router;
