(function () {
	'use strict';

	let IMAGE_ID;

	document.querySelector('#alert-close').addEventListener('click', function () {
		document.querySelector('#alert').style.display = 'none';
	});

	api.onGalleryUpdate(function (image) { //event listener
		renderImage(image);
	});

	api.onUserUpdate(function (username) {
		// document.querySelector('#signout_button').style.display = username ? 'block' : 'none';
		// document.querySelector('#image-form-container').style.display = username ? 'flex' : 'none';
		// document.querySelector('#comment-form-container').style.display = username ? 'flex' : 'none';
		// document.querySelector('#hide-show-btn').style.visibility = username ? 'visible' : 'hidden';
		if (!username) {
			window.location.href = 'https://localhost:3000/login.html';
		}else{
			document.querySelector("#username").innerHTML=username;
		}
	});

	api.onError(function (err) {
		console.error('[error]', err);
	});

	api.onError(function (err) {
		let error_box = document.querySelector('#alert-message');
		error_box.innerHTML = err;
		document.querySelector('#alert').style.display = 'flex';
	});

	const renderImage = function (image) {
		const element = document.querySelector('.image-carrousel');
		if (image) {
			element.style.display = 'flex';
			document.querySelector('#comments').style.display = 'flex';
			document.querySelector('#comment-form-container').style.display = 'flex';
			document.querySelector('#empty-image').style.display = 'none';
			let date = new Date(image.date);
			IMAGE_ID = image._id;
			element.innerHTML = `
			<button class="scroll-btn left-btn"></button>
			<div class="image-card">
            <button class="image-delete-btn delete"></button>
            <div class="image-container">
              <img class="posted-image" alt="No Image Available" src="/api/images/${image._id}/" />
            </div>
            <div class="image-detail-container">
              <span class="image-date">
			  ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}
              </span>
              <span class="image-author">
                ${image.owner}
              </span>
			 <span class="image-title">
			  ${image.caption}
			</span>
            </div>  
			</div>
			<button class="scroll-btn right-btn"></button>
          `;

			element.querySelector('.image-delete-btn.delete').onclick = function () {
				api.deleteImage(image._id, function (deleted) {
					if (deleted) {
						api.changeImage(image.next._id);
					}
				});
			};

			element.querySelector('.scroll-btn.left-btn').onclick = function () {
				api.changeImage(image.previous._id);
			};
			element.querySelector('.scroll-btn.right-btn').onclick = function () {
				api.changeImage(image.next._id);
			};

			api.onCommentUpdate(image._id, function (comments, page) {
				renderComments(comments, page);
			});
		} else {
			document.querySelector('#comments').style.display = 'none';
			element.style.display = 'none';
			document.querySelector('#comment-form-container').style.display = 'none';
			document.querySelector('#empty-image').style.display = 'flex';
		}
	};

	const renderComments = function (res, page = 1) {
		const { previous, next, comments } = res;
		document.querySelector('#comments-box').innerHTML = '';
		if (comments && comments.length !== 0) {
			document.querySelector('#comments').style.display = 'flex';
			comments.forEach(function (comment) {
				let elmt = document.createElement('div');
				elmt.className = 'comment';
				elmt.id = comment._id;
				let date = new Date(comment.date);
				elmt.innerHTML = `
                <div class="comment-user">
                <img class="comment-picture" src="media/man.svg" />
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date"> ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}</div> 
                </div>
                <div class="comment-content">
                ${comment.content}
                </div>
                <div class="comment-btns">
                <button class="comment-delete-btn delete"> </button>
                </div>`;

				elmt.querySelector('.comment-delete-btn.delete').addEventListener('click', function (event) {
					api.deleteComment(comment._id);
				});
				document.querySelector('#comments-box').prepend(elmt);
			});

			let Buttons = document.querySelector('.comment-btns-container');

			Buttons.querySelector('.comment-btn-right.comment-btn').onclick = function () {
				if (next) {
					api.changePage(IMAGE_ID, next);
				}
			};
			Buttons.querySelector('.comment-btn-left.comment-btn').onclick = function () {
				if (previous) {
					api.changePage(IMAGE_ID, previous);
				}
			};
			Buttons.querySelector('.page').innerHTML = `${page}`;
		} else {
			document.querySelector('#comments').style.display = 'none';
		}
	};


	api.onImageUpdate((image) => {
		renderImage(image);
	});

	window.addEventListener('load', function () {
		/**********************************************/

		document.querySelector('#alert').style.display = 'none';

		api.getUsers(function (users) { //render gallery buttons
			users.forEach(function (user) {
				let element = document.createElement('div');
				element.id = user.username;
				element.innerHTML = `<a id=${user.username}-gallery-btn >${user.username}</a>`;
				element.className = 'btn-grad';
				document.querySelector('#gallery-menu').append(element);
				document.getElementById(`${user.username}-gallery-btn`).addEventListener('click', function () {
					api.changeGallery(user.username);
				});
			});
		});

		api.isImagesEmpty(function (empty) {
			if (empty) {
				renderImage(null);
			} else {
				api.getDefaultImage((image) => {
					if (image) {
						renderImage(image);
					}
				});
			}
		});

		document.getElementById('image-form').addEventListener('submit', function (event) {
			event.preventDefault();
			const title = document.getElementById('image-title').value;
			const files = document.getElementById('upload-picture').files;
			api.addImage(title, files);

			// clean form
			document.querySelector('#image-form').reset();
		});

		document.querySelector('#comment-form').addEventListener('submit', function (event) {
			event.preventDefault();
			api.isImagesEmpty(function (empty) {
				if (empty) {
					alert('Cannot add comment');
				} else {
					let content = document.getElementById('comment-content').value;
					// clean form
					api.addComment(IMAGE_ID, content);
					document.getElementById('comment-form').reset();
				}
			});
		});

		document.getElementById('hide-show-btn').addEventListener('click', function () {
			let element = document.getElementById('image-form-container');
			const display = element.style.display;
			element.style.display = display === 'none' ? 'flex' : 'none';
		});
		/******Image and Comment Renderer**************/
	});
})();
