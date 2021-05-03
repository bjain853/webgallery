const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
	addImage,
	deleteImage,
	getImage,
	authenticateImageDeletion,
	isGalleryEmpty,
	getGallery,
} = require('../Controllers/images');
const validator = require('express-validator');
const virus_check = require('./secure-upload');

const upload = multer({
	dest: 'uploads/',
});



const canDeleteImage = function (req, res, next) {
	const imageId = req.params.id;
	if (!imageId) return res.status(400).json('Bad Request');

	authenticateImageDeletion(imageId, req.username)
		.then((canDelete) => {
			if (canDelete) return next();
			else return res.status(403).json("Deletion denied");
		})
		.catch((err) => {
			let status = 500;
			if (err.message === "Invalid imageId given") status = 404;
			return res.status(status).json(err.message);
		});
};

router.get('/images/:id/', function (req, res) {
	const imageId = req.params.id;
	if (!imageId) return res.status(400).json('Bad Request');
	if (imageId === -1) return res.status(400).json("Invalid image Id");
	else getImage(imageId)
		.then((image) => {
			const file = image.picture;
			res.setHeader('Content-Type', file.mimetype);
			res.sendFile(path.resolve(".", file.path));
		})
		.catch((err) => {
			res.status(500).json(err.message);
		});
});

router.get('/image/:id/info/', function (req, res) {
	const imageId = req.params.id;
	if (!imageId) return res.status(400).json('Bad Request');
	else if (parseInt(imageId) === -1) getGallery(req.gallery).then(image => {
		return res.status(200).json(image);
	})
	else getImage(imageId)
		.then((image) => {
			res.status(200).json(image);
		})
		.catch((err) => {
			return res.status(500).json(err.message);
		});
});

router.get('/imagesIsEmpty/', function (req, res) {
	isGalleryEmpty(req.gallery)
		.then((empty) => {
			return res.json({ empty });
		})
		.catch((err) => {
			return res.status(500).json(err.message);
		});
});

router.post('/images/',
	upload.array("pictures"),
	validator.body('title').not().isEmpty().trim().escape()
	, function (req, res) {

		const caption = req.body.title;
		const files = req.files;
		if (!caption || !files) {
			return res.status(400).json('Bad Request');
		};

		virus_check(files).then(notAffected => {

			if (notAffected) return req.username;
			else {
				for (let i = 0; i < files.length; i++) {
					fs.unlinkSync(files[i].path);
				}
				return null;
			}
		}).then(owner => {
			if (owner) return addImage(caption, owner, files);
			return null;
		}).then((insertedImages) => {
			if (insertedImages) {
				let responseImg;
				if (insertedImages.length > 1) {
					let image = insertedImages[0] ? insertedImages[0] : null;
					responseImg = { _id: image._id, owner: image.owner, caption: image.caption, date: image.date, next: { _id: insertedImages[1]._id }, previous: { _id: image._id } };
				} else if (insertedImages.length === 1) {
					let image = insertedImages[0];
					responseImg = { _id: image._id, owner: image.owner, caption: image.caption, date: image.date, next: { _id: image._id }, previous: { _id: image._id } };
				}
				return res.status(200).json(responseImg);
			} else {
				return res.status(501).json("No images inserted");
			}
		}).catch((err) => {
			return res.status(500).json(err.message);
		});
	});

router.delete('/image/:id/', canDeleteImage, function (req, res) {
	const imageId = req.params.id;
	if (!imageId) {
		return res.status(400).json(`Bad Request`);
	}

	getImage(imageId)
		.then((image) => {
			if (image) return fs.unlinkSync(image.picture.path); //delete actual file
			throw new Error(`No image with ${imageId} found`);
		})
		.then(() => {
			return deleteImage(imageId)
		}) //delete from db
		.then((deleted) => {
			if (deleted) return res.status(200).json(deleted);
			else throw new Error("Image can't be successfully deleted");
		})
		.catch((err) => {
			if (err.message === `No image with ${imageId} found`) return res.status(404).json(err.message);
			return res.status(500).json(err.message);
		});

});

module.exports = router;
