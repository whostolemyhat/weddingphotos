var app = app || {};

app.AlbumView = Backbone.View.extend({
    el: '#photos',

    initialize: function(initialPhotos) {
        this.collection = new app.Album(initialPhotos);
        this.render();
    },

    render: function() {
        this.collection.each(function(item) {
            this.renderPhoto(item);
        }, this);
    },

    // render a photo by creating a PhotoView and append
    // element it renders to the album's element
    renderPhoto: function(item) {
        var photoView = new app.PhotoView({
            model: item
        });
        this.$el.append(photoView.render().el);
    }
});