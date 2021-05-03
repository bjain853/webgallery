(function () {
    const Datastore = require('nedb');

    module.exports = {
        comments: new Datastore({ filename: 'db/comments.db', autoload: true, timestampData: true }),
        images: new Datastore({ filename: 'db/pictures.db', autoload: true }),
        users: new Datastore({ filename: 'db/users.db', autoload: true }),
        ID: function () {
            return '_' + Math.random().toString(36).substr(2, 9);
        }
    }
}());
