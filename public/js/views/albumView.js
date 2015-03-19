/* global Backbone */
var app = app || {};

app.AlbumView = Backbone.View.extend({
    el: '#photos',
    files: '',

    initialize: function() {
        'use strict';
        this.collection = new app.Album();
        this.collection.fetch({ reset: true }); // get photos from api
        this.listenTo(this.collection, 'add', this.renderPhoto);
        this.listenTo(this.collection, 'reset', this.render);

        // jQuery wom't work
        // var fileInput = document.getElementById('photo');
        // var form = document.getElementById('addPhoto');
        // fileInput.addEventListener('change', this.prepareUpload);

        // fileInput.addEventListener('change', function(e) {
        //     var reader = new FileReader();

        //     for(var i = 0; i < fileInput.files.length; i++) {
        //         var file = fileInput.files[i];
        //         form.appendChild('<input type="hidden" id="fileData' + i + '">');
        //         form.appendChild('<input type="hidden" id="fileName' + i + '">');

        //         reader.onload = function(e) {
        //             $('#fileData' + i).val(reader.result);
        //             $('#fileName' + i).val(file.name);
        //         };
        //         reader.readAsDataURL(file);
        //     }
        // });

        this.render();
    },

    render: function() {
        // this.collection.comparator = function(model) {
        //     return model.get('date');
        // };
        // this.collection.sort();

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
        'click #submit': 'addPhoto'
    },

    addPhoto: function() {
        console.log('adding photo');
        var options = {
            target: '.upload__output',
            beforeSubmit: this.beforeSubmit,
            uploadProgress: this.onProgress,
            success: this.afterSuccess,
            resetForm: true
        };
        $('#upload').submit(function() {
            console.log('uploading');
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

            if(size > 1048576) {
                $('.upload__output').html(size + ' is too big!');
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
        console.log(responseText, statusText, xhr, el);
        $('.upload__output').html('Finished uploading!');
        this.collection.reset();
    }


    // addPhoto: function(e) {
    //     'use strict';
    //     e.preventDefault();
    //     e.stopPropagation();
    //     console.log(app.AlbumView.files);

    //     // loading spinner

    //     // var formData = {};
    //     // $('#addPhoto div').children('input').each(function(i, el) {
    //     //     if ($(el).val() !== '') {
    //     //         formData[el.id] = $(el).val();
    //     //     }
    //     // });

    //     // console.log(formData);

    //     // // this.collection.add(new app.Photo(formData));
    //     // this.collection.create(formData);
    //     var data = new FormData();
    //     // $.each(app.AlbumView.files, function(key, value) {
    //     var fileInput = document.getElementById('photo');
    //     var files = fileInput.files;
    //     for(var i = 0; i < files.length; i++) {
    //         var file = files[i];
    //         console.log(file.type);
    //         if(!file.type.match('image.*')) {
    //             continue;
    //         }
    //         data.append('photos[]', file, file.name);
    //     }

    //     $('#addPhoto div').children('input').each(function(i, el) {
    //         if ($(el).val() !== '' && $(el).attr('id') !== 'photo') {
    //             data.append(el.id, $(el).val());
    //         }
    //     });
    //     console.log(data);
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('POST', '/api/photos/', true);
    //     xhr.onload = function() {
    //         if(xhr.status === 200) {
    //             // it worked
    //             console.log('success');
    //         } else {
    //             console.error(xhr.status);
    //         }
    //     };
    //     xhr.send(data);
    //     // this.collection.create(data);
    // }

    // prepareUpload: function(e) {
    //     'use strict';
    //     app.AlbumView.files = e.target.files;
    // }
});