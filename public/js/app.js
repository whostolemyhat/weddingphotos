var app = app || {};

$(function() {
    var photos = [
        { photo: 'uploads/Desert.jpg', caption: 'A lovely picture', takenBy: 'Bob', date: 1426159763463 },
        { photo: 'uploads/Jellyfish.jpg', caption: 'Jellyfish', takenBy: 'Bob', date: 1426159779463 },
        { photo: 'uploads/Penguins.jpg', caption: 'Penguins', takenBy: 'Tim', date: 1426150779463 },
        { caption: 'Penguins', takenBy: 'Bob', date: 1426150729463 }
    ];

    new app.AlbumView(photos);
});