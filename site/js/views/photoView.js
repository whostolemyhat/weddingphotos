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
    }
});