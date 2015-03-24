#Photo upload site

A webapp created to allow guests at my wedding to upload photos they take.

Runs on Node, Express, Mongo and Backbone (MEBN?).

##Installation

1. Clone repo
2. `npm install`
3. Make sure MongoDB is installed and running
3. Create /config/database.js:
    module.exports = {
        url: 'mongodb://path/to/your/mongodb'
    };
4. Create /config/session.js:
    module.exports = {
        secret: 'yoursecretsessionkeyhere'
    };
4. Ensure /public/uploads/ and /public/uploads/thumbs/ folders exist
5. Create appropriate placeholder images in /public/images/ and /public/images/thumbs/
6. Run `nodemon`

##TODO

- [x] sockets/emit
- [x] show photo on change
- [x] link to large img
- [x] username on img
- [x] set up mongo on webfaction
- [x] render model on upload
- [x] thumbs
- [ ] improve upload script
- [ ] lazyload img
- [ ] login/signup
    - [ ] google
    - [ ] facebook
    - [ ] the twitters
- [ ] multi-img upload
- [ ] loads of styling
- [ ] preview img about to be uploaded