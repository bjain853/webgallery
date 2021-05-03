(function () {
	const bcrypt = require('bcrypt');
	const { users } = require('./databases');
	('use strict');

	const AuthActions = {
		getUser: function (username) {
			return new Promise((resolve, reject) => {
				users.findOne({ _id: username }, function (err, user) {
					if (err) return reject(err);
					return resolve(user);
				});
			});
		},
		addUser: function (username, password) {
			return new Promise((resolve, reject) => {
				AuthActions
					.getUser(username)
					.then((user) => {
						if (!user)
							bcrypt
								.hash(password, 10)
								.then((saltedPass) => {
									users.update(
										{ _id: username },
										{ _id: username, password: saltedPass },
										{ upsert: true },
										function (error) {
											if (error) return reject(new Error('Cannot insert user into the database'));
											return resolve({ _id: username });
										}
									);
								})
								.catch((err) => {
									return reject(err);
								});
						else throw new Error(`Username ${username} already exists`);
					})
					.catch((err) => reject(err));
			});
		},

		updateUser: function (username, updatedField, updatedValue) {
			return new Promise((resolve, reject) => {
				if (updatedField !== 'username' && updatedField !== 'password')
					return reject(new Error('Invalid field specified'));
				AuthActions.getUser(username).then((user) => {
					if (!user) return reject(new Error('User not found'));
					let update;
					if (updatedField === 'password') {
						updatedValue = bcrypt.hashSync(updatedValue, 10);
						update = { _id: user._id, password: updatedValue };
					} else update = { _id: updatedValue, password: user.password };

					users.update(user, update, {}, function (err, numUpdated) {
						if (err) return reject(err);
						return resolve(numUpdated === 1);
					});
				});
			});
		},
		deleteUser: function (username) {
			return new Promise((resolve, reject) => {
				AuthActions.getUser(username).then((user) => {
					users.remove(user, function (err, numRemoved) {
						if (err) return reject(err);
						return resolve(numRemoved === 1);
					});
				});
			});
		},
		authenticateUser: function (username, password) {
			return new Promise((resolve, reject) => {
				AuthActions
					.getUser(username)
					.then((user) => {
						if (user) {
							const same = bcrypt.compareSync(password, user.password);
							return resolve({ same, user });
						} else return reject(new Error(`Username ${username} doesn't exist`));
					})
					.catch((err) => reject(err));
			});
		},
		getUsers: function () {
			return new Promise((resolve, reject) => {
				users.find({}, function (err, users) {
					if (err) return reject(err);
					users.forEach((user, idx) => {
						users[idx] = { username: user._id };
					});
					return resolve(users);
				});
			});
		}
	};


	module.exports = AuthActions;
}());
