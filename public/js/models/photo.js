var app = app || {};

app.Photo = Backbone.Model.extend({
    defaults: {
        photo: 'img/placeholder.png',
        thumb: 'img/thumbs/placeholder.png',
        caption: '',
        date: new Date(),
        takenBy: ''
    }
});