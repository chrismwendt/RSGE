var mongoose = require('mongoose');
var async = require('async');
var rsNumber = require('./rs-number');

var databaseName = 'rs';
var collectionName = 'ge';

var Item = mongoose.model('Item', {
        id: Number,
        name: String,
        priceHistory: {
            timestamp: Date,
        price: Number
    }
});

var wrap = function(uri, callback) {
    mongoose.connect(uri);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('Connected to ' + uri + '.');
        console.log('Opened ' + uri + '.');
        callback(function() {
            db.close(function() {
                console.log('Closed ' + uri + '.');
                mongoose.disconnect(function() {
                    console.log('Disconnected from ' + uri + '.');
                });
            });
        });
    });
}

var main = function() {
    wrap('mongodb://localhost/' + databaseName, function(callback) {
        console.log('insert prices');
        callback();
    });
}

main();
