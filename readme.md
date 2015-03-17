#Photo upload site

A webapp created to allow guests at my wedding to upload photos they take.
 
Runs on Node, Express, Mongo and Backbone (MEBN?).

##Installation

1. Clone repo
2. `npm install`
3. Create /config/database.js:
    module.exports = {
        'url': 'mongodb://path/to/your/mongodb'
    };
4. Ensure /public/uploads/ and /public/uploads/thumbs/ folders exist
5. Create appropriate placeholder images in /public/images/ and /public/images/thumbs/
6. Run `nodemon`