var mongoose = require('mongoose');
var async = require('async');
var rsNumber = require('./rs-number');
var itemFetcher = require('./itemFetcher');

var databaseName = 'rs';

var Item = mongoose.model('Item', {
    id: Number,
    name: String,
    priceHistory: [ {
            timestamp: Date,
            price: Number
        }
    ]
});

var wrap = function(uri, callback) {
    mongoose.connect(uri);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('Connected to ' + uri + '.');
        console.log('Opened ' + uri + '.');
        callback(db, function() {
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
    wrap('mongodb://localhost/' + databaseName, function(db, callback) {
        itemFetcher.itemStream(function(item, timestamp) {
            Item.findOne({
                id: item.id
            }, function(error, itemi) {
                if (error) {
                    console.log('Error finding item ID ' + item.id + ': ' + error);
                    callback();
                }
                console.log('Adding: ' + item.name + ' ' + item.current.price);
                if (!itemi) {
                    console.log(item.name + ' is a new item!');
                    Item.create({
                        id: item.id,
                        name: item.name,
                        priceHistory: [ {
                                timestamp: timestamp,
                                price: rsNumber.toInt(item.current.price)
                            }
                        ]
                    }, function(error, document) {
                        if (error) {
                            console.log('Error creating item ID ' + item.id + ': ' + error);
                            callback();
                        }
                    });
                } else {
                    itemi.update({
                        $pushAll: {
                            priceHistory: [ {
                                    timestamp: timestamp,
                                    price: rsNumber.toInt(item.current.price)
                                }
                            ]
                        }
                    }, function(error) {
                        if (error) {
                            console.log('Error updating item ID ' + item.id + ': ' + error);
                            callback();
                        }
                    });
                }
            });
        });
    });
}

main();
