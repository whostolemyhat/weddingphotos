/* global Backbone */
var app = app || {};

app.Photo = Backbone.Model.extend({
    defaults: {
        path: 'img/placeholder.png',
        thumb: 'img/thumbs/placeholder.png',
        caption: '',
        date: new Date(),
        takenBy: ''
    },

    parse: function(response) {
        // convert Backbone id into Mongo _id
        response.id = response._id;
        return response;
    }
});