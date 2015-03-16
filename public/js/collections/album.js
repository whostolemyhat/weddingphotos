var app = app || {};

app.Album = Backbone.Collection.extend({
    model: app.Photo,
    url: '/api/photos'
});