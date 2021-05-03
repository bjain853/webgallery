(function () {
	"use strict";

	const { comments, images, ID } = require('./databases');


	let Comment = function (comment) {
		this._id = ID();
		this.imageId = comment.imageId;
		this.content = comment.content;
		this.author = comment.author;
		this.date = new Date();
	};

	module.exports = {
		getComments: (page, page_size, imageId) => {
			return new Promise((resolve, reject) => {
				if (!imageId) return reject(new Error('Bad request'));
				let start = (page - 1) * page_size;
				let end = start + page_size;
				images.count({ _id: imageId }, function (err, count) {
					if (err) return reject(err);
					if (count === 0) {
						return reject(new Error('Bad imageId provided'));
					}
					else {
						comments.find({ imageId: imageId }).sort({ createdAt: -1 }).exec(function (error, comments) {
							if (error) return reject(error);
							if (comments.length === 0) return resolve({ comments: comments, previous: 1, next: 1 });

							let result = {};
							if (start > 0) {
								result.previous = page - 1;
							}
							if (end < comments.length) {
								result.next = page + 1;
							}
							result.comments = comments.slice(start, end).reverse();
							return resolve(result);
						});
					}
				});

			});
		},
		deleteComment: (commentId) => {
			return new Promise((resolve, reject) => {
				comments.findOne({ _id: commentId }, function (error, comment) {
					if (error) return reject(err);
					if (comment) {
						comments.remove(comment, function (err, numRemoved) {
							if (err) return reject(err);
							return resolve({ deleted: numRemoved === 1, imageId: comment.imageId });
						});
					}
				})

			});
		},
		updateComment: (commentId, updatedContent) => {
			return new Promise((resolve, reject) => {
				if (!commentId) return reject(new Error('Bad request'));
				comments.update({ _id: commentId }, { content: updatedContent }, { upsert: true }, function (
					err,
					numUpdated
				) {
					if (err) return reject(err);
					return resolve(numUpdated === 1);
				});
			});
		},
		createComment: (imageId, author, content) => {
			return new Promise((resolve, reject) => {
				if (!imageId || !content) return reject(new Error('Bad request'));
				images.count({ _id: imageId }, function (err, count) {
					if (count === 0) return reject(new Error('Bad imageId provided'));
					let comment = new Comment({ imageId, author, content });
					comments.insert(comment, function (err, comment) {
						if (err) return reject(err);
						return resolve(comment);
					});
				});

			});
		},
		authenticateCommentDeletion: (commentId, user) => {
			//either image owner or comment author can delete
			return new Promise((resolve, reject) => {
				comments.findOne({ _id: commentId }, function (err, comment) {
					if (err) return reject(err);
					images.findOne({ _id: comment.imageId }, function (error, image) {
						if (error) return reject(error);
						const canDelete = user ? (comment.author===user || image.owner===user) : false;
						return resolve(canDelete);
					});
				});
			});
		},
	};

}());