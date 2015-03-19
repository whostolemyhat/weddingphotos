/* global $ */
function onProgress(e, position, total, percentComplete) {
    $('#progressbar').width(percentComplete + '%');
    $('#statustext').html(percentComplete + '%');
    if(percentComplete > 50) {
        $('#statustext').css('color', '#fff');
    }
}

function beforeSubmit() {
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
}

function afterSuccess(responseText, statusText, xhr, el) {
    console.log(responseText, statusText, xhr, el);
    $('.upload__output').html('Finished uploading!');
    $('.progress').addClass('fadeOut');
}

$(document).ready(function() {
    var options = {
        target: '.upload__output',
        beforeSubmit: beforeSubmit,
        uploadProgress: onProgress,
        success: afterSuccess,
        resetForm: true
    };
    $('#upload').submit(function() {
        console.log('uploading');
        $(this).ajaxSubmit(options);
        return false;
    });
});