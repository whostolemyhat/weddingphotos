/*global Backbone, _, $ */
var app = app || {};

app.PhotoView = Backbone.View.extend({
    tagName: 'div',
    className: 'photoContainer',
    template: _.template($('#photoTemplate').html()),

    render: function() {
        // this.$el = tagName
        this.$el.html(this.template(this.model.attributes));

        return this;
    },

    events: {
        'click .delete': 'deletePhoto',
        'click .update': 'updatePhoto'
    },

    deletePhoto: function() {
        this.model.destroy();
        this.remove();
    },

    updatePhoto: function() {
        // create form
        // populate with current data
    }
});