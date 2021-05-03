
const router = require('express').Router();
const { getComments, deleteComment, createComment, authenticateCommentDeletion } = require('../Controllers/comments');
const validator = require('express-validator');
const canDeleteComments = function (req, res, next) {
	const commentId = req.params.id;
	authenticateCommentDeletion(commentId, req.username)
		.then((canDelete) => {

			if (canDelete) return next();
			else return res.status(403).json("Deletion denied");
		})
		.catch((err) => {
			return res.status(500).json(err.message);
		});
};

router.get('/image/:id/comments/:page/:size/', function (req, res) {
	let { page, size, id } = req.params;
	page = parseInt(page);
	size = parseInt(size);
	getComments(page, size, id)
		.then((result) => {
			return res.status(200).json(result);
		})
		.catch((err) => {
			if (err.message === 'Bad request') return res.status(400).json(err);
			if (err.message === 'Bad imageId provided') return res.status(405).json(err);
			return res.status(500).json(err.message);
		});
});

router.post('/comments/', 
	validator.body('content').not().isEmpty().trim().escape().withMessage('Invalid Comment Posted')
	,function (req, res) {
	const { content, imageId } = req.body;
	if (!content || !imageId) return res.status(400).json("Bad Request");
	createComment(imageId, req.username, content)
		.then((comment) => {
			if (comment) res.status(200).json(comment);
		})
		.catch((err) => {
			if (err.message === 'Bad imageId provided') return res.status(403).json(err);
			return res.status(500).json(err.message);
		});
});

router.delete('/comments/:id/', canDeleteComments, function (req, res) {
	const commentId = req.params.id;
	if (!commentId) return res.status(400).json("Bad request");
	deleteComment(commentId)
		.then(({ deleted, imageId }) => {
			if (deleted) return res.status(200).json({ imageId });
			return res.status(500).json(`Comment with ${commentId} cannot be deleted`);
		})
		.catch((err) => {

			return res.status(500).json(err.message);
		});
});

module.exports = router;
