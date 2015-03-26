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