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
        'use strict';
        e.preventDefault();
        e.stopPropagation();
        console.log(app.AlbumView.files);

        // loading spinner

        // var formData = {};
        // $('#addPhoto div').children('input').each(function(i, el) {
        //     if ($(el).val() !== '') {
        //         formData[el.id] = $(el).val();
        //     }
        // });

        // console.log(formData);

        // // this.collection.add(new app.Photo(formData));
        // this.collection.create(formData);
        var data = new FormData();
        // $.each(app.AlbumView.files, function(key, value) {
        var fileInput = document.getElementById('photo');
        var files = fileInput.files;
        for(var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log(file.type);
            if(!file.type.match('image.*')) {
                continue;
            }
            data.append('photos[]', file, file.name);
        }

        $('#addPhoto div').children('input').each(function(i, el) {
            if ($(el).val() !== '' && $(el).attr('id') !== 'photo') {
                data.append(el.id, $(el).val());
            }
        });
        console.log(data);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/photos/', true);
        xhr.onload = function() {
            if(xhr.status === 200) {
                // it worked
                console.log('success');
            } else {
                console.error(xhr.status);
            }
        };
        xhr.send(data);
        // this.collection.create(data);
    }

    // prepareUpload: function(e) {
    //     'use strict';
    //     app.AlbumView.files = e.target.files;
    // }
});