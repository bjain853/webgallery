const api = (function () {
	'use strict';
	let module = {};
	let imageListeners = [];
	let commentListeners = [];
	let userListeners = [];
	let errorListeners = [];
	let galleryListeners = [];
	let currentPage = 1;

	function sendFiles(method, url, data, callback) {
		let formdata = new FormData();
		Object.keys(data).forEach(function (key) {
			let value = data[key];
			if (key === "pictures") {
				for (let i = 0; i < data["pictures"].length; i++)	formdata.append("pictures", data["pictures"][i]);
			}
			else formdata.append(key, value);
		});

		let xhr = new XMLHttpRequest();
		xhr.onload = function () {
			if (xhr.status !== 200) callback('[' + xhr.status + ']' + xhr.responseText, null);
			else callback(null, JSON.parse(xhr.responseText));
		};
		xhr.open(method, url, true);
		xhr.send(formdata);
	}

	function send(method, url, data, callback) {
		let xhr = new XMLHttpRequest();
		xhr.onload = function () {
			if (xhr.status === 204) callback(null, null);
			if (xhr.status !== 200) callback(xhr.responseText, null);
			else callback(null, JSON.parse(xhr.responseText));
		};
		xhr.open(method, url, true);
		if (!data) xhr.send();
		else {
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
		}
	}

	/*  ******* Data types *******
		image objects must have at least the following attributes:
			- (String) _id
			- (String) title
			- (String) author
			- (Date) date
    
		comment objects must have the following attributes
			- (String) _id
			- (String) imageId
			- (String) author
			- (String) content
			- (Date) date
    
	****************************** */

	function notifyUserListeners(username) {
		userListeners.forEach(function (listener) {
			listener(username);
		});
	}

	module.signup = function (username, password) {
		send('POST', '/api/authentication/signup/', { username: username, password: password }, function (err, res) {
			if (err) return notifyErrorListeners(err);
			getUsername(notifyUserListeners);
		});
	};

	module.signin = function (username, password) {
		send('POST', '/api/authentication/signin/', { username: username, password: password }, function (err, res) {
			if (err) return notifyErrorListeners(err);
			getUsername(notifyUserListeners);
		});
	};

	module.onUserUpdate = function (listener) {
		userListeners.push(listener);
		getUsername(listener);
	};

	const getUsername = function (callback) {
		send('GET', '/api/user/', null, function (err, res) {
			if (err) notifyErrorListeners(err);
			return callback(res.user);
		});
	};

	/*Gallery functions*/


	module.getUsers = function (callback) {
		send('GET', '/api/users/', null, function (err, users) {
			if (err) {
				notifyErrorListeners(err);
			} else {
				callback(users);
			}
		});
	};

	module.onGalleryUpdate = function (listener) {
		galleryListeners.push(listener);
		getGalleryImage(listener);
	}

	module.changeGallery = function (user) {
		send("PUT", '/api/gallery/switch/', { gallery: user }, function (err) {
			if (err) return notifyErrorListeners(err);
			else getGalleryImage(user);
		});

	};

	const notifyGalleryListeners = function (image) {
		galleryListeners.forEach(function (listener) { //listeners are renderImage
			listener(image);
		});
	};

	const getGalleryImage = function (gallery) {
		send("GET", '/api/gallery/default', { gallery }, function (err, image) {
			if (err) return notifyErrorListeners(err);
			else notifyGalleryListeners(image);
		})
	};


	/**
	 * Image functions
	 */
	// Adds an image
	module.addImage = function (title, files) {
		let UploadingFiles = [];
		for (let i = 0; i < files.length; i++) {
			UploadingFiles.push(files[i]);
		};
		sendFiles('POST', '/api/images/', { title: title, pictures: UploadingFiles }, function (err, res) {
			if (err) return notifyErrorListeners(err);
			notifyImageListeners(res);
		});


	};

	const getImage = function (imageId, callback) {
		send('GET', `/api/image/${imageId}/info/`, null, callback);
	};

	module.changeImage = function (imageId) {
		getImage(imageId, function (err, res) {
			if (err) {
				notifyImageListeners(null);
				//notifyErrorListeners(err);
			}
			else {
				notifyImageListeners(res);
				//notifyCommentListeners(res._id);
			}
		});
	};

	module.isImagesEmpty = function (caller) {
		send('GET', '/api/imagesIsEmpty/', null, function (err, res) {
			if (err) return notifyErrorListeners(err);
			caller(res.empty);
		});
	};

	// delete an image from the gallery given its imageId
	module.deleteImage = function (imageId, listener) {
		send('DELETE', `/api/image/${imageId}/`, null, function (err, res) {
			console.log(res,err);
			if (err) return notifyErrorListeners(err);
			if (res) return listener(res);
		});
	};

	module.getDefaultImage = function (listener) {
		send('GET', `/api/image/-1/info/`, null, function (err, res) {
			if (err) return notifyErrorListeners(err);
			else {
				listener(res);
			}
		});
	};

	const notifyImageListeners = function (image) {
		imageListeners.forEach(function (listener) {
			listener(image);
		});
	};

	// call handler when an image is added or deleted from the gallery
	module.onImageUpdate = function (handler) {
		imageListeners.push(handler);
	};

	/***
		 * 	
		 * Comments
		 * 
		 */

	// add a comment to an image

	module.addComment = function (imageId, content) {
		send('POST', `/api/comments/`, { content: content, imageId: imageId }, function (err) {
			if (err) return notifyErrorListeners(err);
			notifyCommentListeners(imageId);
		});
	};

	// delete a comment to an image
	module.deleteComment = function (commentId) {
		send('DELETE', `/api/comments/${commentId}/`, null, function (err, res) {
			if (err) return notifyErrorListeners(err);
			notifyCommentListeners(res.imageId);
		});
	};

	const getComments = function (imageId, page, listener, size = 5) {
		currentPage = page;
		send('GET', `/api/image/${imageId}/comments/${page}/${size}/`, null, listener);
	};

	function notifyCommentListeners(imageId, page = 1) {
		getComments(imageId, page, function (err, comments) {
			if (err) return notifyErrorListeners(err);
			commentListeners.forEach(function (listener) {
				listener(comments, currentPage);
			});
		});
	}

	module.changePage = function (imageId, page) {
		notifyCommentListeners(imageId, page);
	};

	module.onCommentUpdate = function (imageId, listener) {
		commentListeners.push(listener);
		if (!imageId) {
			listener({ comments: [] });
		} else {
			getComments(imageId, currentPage, function (err, comments) {
				if (err) return notifyErrorListeners(err);
				else return listener(comments, currentPage);
			});
		}
	};
	/**
	 * 
	 * Errors
	 */

	function notifyErrorListeners(err) {
		errorListeners.forEach(function (listener) {
			listener(err);
		});
	}

	module.onError = function (listener) {
		errorListeners.push(listener);
	};

	/*
		Refresh comments after 5 seconds
	 */

	return module;
})();
