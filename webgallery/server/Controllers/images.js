(function () {
	"use strict";
	const { images, comments, ID } = require('./databases');


	let Image = function (image, file) {
		this._id = ID();
		this.owner = image.owner;
		this.caption = image.caption;
		this.date = new Date();
		this.picture = file;
	};

	const ImageActions = {
		addImage: (caption, owner, files) => {

			let promises = [];
			for (let i = 0; i < files.length; i++) {
				let newImage = new Image({ owner, caption }, files[i]);
				promises.push(new Promise((resolve, reject) => {
					images.insert(newImage, (err, newDoc) => {
						if (err) return (reject(err));
						return resolve(newDoc);
					});
				}))
			}
			return Promise.all(promises)
		},
		deleteImage: (imageId) => {
			return new Promise((resolve, reject) => {
				images.remove({ _id: imageId }, function (err, numImageRemoved) {
					if (err) return reject(err);
					images.persistence.compactDatafile();
					comments.remove({ imageId: imageId }, function (error, numCommentsRemoved) {
						if (error) return reject(error);
						comments.persistence.compactDatafile();
						return resolve(numCommentsRemoved >= 0 && numImageRemoved === 1);
					});
				});
			})
		},
		getImage: (imageId) => {
			return new Promise((resolve, reject) => {
				images.findOne({ _id: imageId }, function (err, image) {
					if (err) return reject(err);
					if (image) {
						images.find({ owner: image.owner }, function (error, gallery) {
							if (error) return reject(error);
							if (gallery) {
								if (gallery.length > 1) {
									let index = gallery.findIndex((image) => {
										return image._id === imageId;
									});
									if (index === 0) {
										image.next = { _id: gallery[1]._id };
										image.previous = { _id: gallery[gallery.length - 1]._id };
									} else if (index === gallery.length - 1) {
										image.next = { _id: gallery[0]._id };
										image.previous = { _id: gallery[index - 1]._id };
									} else {
										image.next = { _id: gallery[index + 1]._id };
										image.previous = { _id: gallery[index - 1]._id };
									}
								} else {
									image.next = { _id: image._id };
									image.previous = { _id: image._id };
								}

							}

							return resolve(image);

						});
					} else {
						return reject(new Error(`No image with ${imageId} exists`));
					}
				})
			})
		},

		authenticateImageDeletion: (imageId, username) => {
			return new Promise((resolve, reject) => {
				images.findOne({ _id: imageId }, function (err, image) {
					if (err) return reject(err);
					if (image) {

						console.log(image.owner, username);
						return resolve(image && username && image.owner === username);
					}
					else return reject(new Error("Invalid imageId given"));
				});
			});
		},
		isGalleryEmpty: (username) => {
			return new Promise((resolve, reject) => {
				images.find({ owner: username }, function (err, images) {
					if (err) return reject(err);
					return resolve(images.length === 0);
				});
			});
		},
		getGallery: (gallery) => {
			return new Promise((resolve, reject) => {
				images.find({ owner: gallery }, function (err, images) {
					if (err) return reject(err);
					if (images.length === 0) {
						return resolve(null);
					} else {
						let index = 0;
						let image = { ...images[index] };
						if (images[index + 1]) {
							image.next = { _id: images[index]._id };
						}
						image.previous = { _id: images[images.length - 1]._id };
						return resolve(image);
					}
				});
			});
		}


	}
	module.exports = ImageActions;
}());