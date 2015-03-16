var app = app || {};

app.AlbumView = Backbone.View.extend({
    el: '#photos',

    initialize: function() {
        this.collection = new app.Album();
        this.collection.fetch({ reset: true }); // get photos from api
        this.listenTo(this.collection, 'add', this.renderPhoto);
        this.listenTo(this.collection, 'reset', this.render);
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
    },

    events: {
        'click #add': 'addPhoto'
    },

    addPhoto: function(e) {
        e.preventDefault();

        var formData = {};
        $('#addPhoto div').children('input').each(function(i, el) {
            if ($(el).val() !== '') {
                formData[el.id] = $(el).val();
            }
        });

        this.collection.add(new app.Photo(formData));
    }
});