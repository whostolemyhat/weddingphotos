/*global Backbone, _, $ */
var app = app || {};

app.PhotoView = Backbone.View.extend({
    tagName: 'div',
    className: 'photo',
    template: _.template($('#photoTemplate').html()),

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    render: function() {
        console.log('rendering photo');
        this.$el.html(this.template(this.model.attributes));

        return this;
    },

    events: {
        'click .delete': 'deletePhoto',
        'click .refresh': 'refreshThumb'
    },

    deletePhoto: function() {
        this.model.destroy();
        this.remove();
    },

    refreshThumb: function(e) {
        e.preventDefault();

        // update thumbnail
        $.get('/api/photos/refresh/' + this.model.id);
    }
});