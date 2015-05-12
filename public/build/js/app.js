/* global Backbone */
var app = app || {};

app.Photo = Backbone.Model.extend({
    defaults: {
        path: 'img/placeholder.png',
        thumbnail: 'img/thumbs/placeholder.png',
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
/* global Backbone */
var app = app || {};

app.AlbumView = Backbone.View.extend({
    el: '#photos',

    initialize: function() {
        'use strict';
        this.collection = new app.Album();
        this.collection.fetch({ reset: true }); // get photos from api
        this.listenTo(this.collection, 'reset', this.render);

        this.render();

        io = io.connect();
        // Send the ready event.
        io.emit('ready');

        io.on('photo', function(data) {
            data.id = data._id;
            var photo = new app.Photo(data);
            app.album.renderPhotoTop(photo);
        });
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
        this.$el.find('.photo__container').append(photoView.render().el);
    },
    
    renderPhotoTop: function(item) {
        var photoView = this.collection.findWhere({ id: item.id });

        if(photoView) {
            // find existing photo
            var photo = $('[data-id=' + photoView.id + ']').find('img');
            photo.attr('src', photo.attr('src') + '?t=' + new Date().getTime());
            // rerender
            // this.collection.reset();
        } else {
            // create new photo
            photoView = new app.PhotoView({
                model: item
            });
            photoView.render().$el.prependTo(this.$el.find('.photo__container')).addClass('highlight');
        }
    },


    events: {
        'click #submit': 'addPhoto'
    },

    addPhoto: function(e) {
        var options = {
            target: '.upload__output',
            beforeSubmit: this.beforeSubmit,
            uploadProgress: this.onProgress,
            success: this.afterSuccess,
            resetForm: true,
            clearForm: true
        };

        $('#upload').one('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.progress').show();
            $(this).ajaxSubmit(options);
            return false;
        });
    },

    onProgress: function(e, position, total, percentComplete) {
        $('.progress__bar').width(percentComplete + '%');
        $('.progress__status').html(percentComplete + '%');
        if(percentComplete > 50) {
            $('.progress_status').css('color', '#fff');
        }
    },
    beforeSubmit: function() {
        if(window.File && window.FileReader && window.FileList && window.Blob) {
            if(!$('#photo').val()) {
                $('.upload__output').html('No photo!');
                return false;
            }

            var size = $('#photo')[0].files[0].size;
            var type = $('#photo')[0].files[0].type;

            switch(type) {
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/gif':
                break;
            default:
                $('.upload__output').html('That\'s no image! ' + type);
                return false;
            }

            if(size > 3048576) {
                $('.upload__output').html('Photo is too big!');
                return false;
            }

            $('.progress').removeClass('fadeOut');
            // show loading anim
            $('.upload__output').html();
        } else {
            $('.upload__output').html('Not supported in your browser');
            return false;
        }
    },

    afterSuccess: function(responseText, statusText, xhr, el) {
        $('.upload__output').html('Finished uploading!');
        $('.progress__bar').fadeOut('slow');
        setTimeout(function() {
            $('.progress').hide();
            $('.progress__bar').show();
        }, 1000);
    }
});
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
/* global Backbone */
var app = app || {};

app.Album = Backbone.Collection.extend({
    model: app.Photo,
    url: '/api/photos'
});
/*global $ */
var app = app || {};

$(function() {
    app.album = new app.AlbumView();

    // form hiding/showing
    $('.form__trigger').on('click', function(e) {
        e.preventDefault();

        var target = $(this).data('target');
        $('.form--show').removeClass('form--show');
        $('.' + target).addClass('form--show');
        $('.overlay').removeClass('hidden');
    });

    $('.form--close, .overlay').on('click', function(e) {
        e.preventDefault();

        $(this).closest('form').removeClass('form--show');
        $('.overlay').addClass('hidden');
    });
});