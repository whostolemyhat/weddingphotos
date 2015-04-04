/*global Backbone, _, $ */
var app = app || {};

app.PhotoView = Backbone.View.extend({
    tagName: 'div',
    className: 'photo',
    template: _.template($('#photoTemplate').html()),

    render: function() {
        this.$el.html(this.template(this.model.attributes));

        return this;
    },

    events: {
        'click .delete': 'deletePhoto'
    },

    deletePhoto: function() {
        this.model.destroy();
        this.remove();
    }
});