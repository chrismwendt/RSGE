var mongoose = require('mongoose');
var async = require('async');
var rsNumber = require('./rs-number');
var itemFetcher = require('./itemFetcher');
var _ = require('underscore');

var databaseURI = process.env.MONGOLAB_URI || 'mongodb://localhost/rsge';

var Item = mongoose.model('Item', {
    id: Number,
    name: String,
    priceHistory: [ {
            timestamp: Date,
            price: Number
        }
    ]
});

var wrap = function(uri, wrapCallback) {
    mongoose.connect(uri);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    async.series([
        _.partial(_.bind(db.once, db), 'open'),
        function(callback) {
            console.log('Connected to ' + uri + '.');
            console.log('Opened ' + uri + '.');
            callback();
        },
        _.partial(wrapCallback, db),
        function(callback) {
            console.log('Closed ' + uri + '.');
            callback();
        },
        _.bind(mongoose.disconnect, mongoose),
        function(callback) {
            console.log('Disconnected from ' + uri + '.');
            callback();
        }
    ]);
}

var createItem = function(newItem, timestamp, errorCallback) {
    Item.create({
        id: newItem.id,
        name: newItem.name,
        priceHistory: [ {
                timestamp: timestamp,
                price: rsNumber.toInt(newItem.current.price)
            }
        ]
    }, function(error, document) {
        if (error) {
            console.log('Error creating item ID ' + newItem.id + ': ' + error);
            errorCallback();
        }
    });
}

var updateItem = function(item, newItem, timestamp, errorCallback) {
    item.update({
        $addToSet: {
            priceHistory: {
                $each: [ {
                        timestamp: timestamp,
                        price: rsNumber.toInt(newItem.current.price)
                    }
                ]
            }
        }
    }, function(error) {
        if (error) {
            console.log('Error updating item ID ' + newItem.id + ': ' + error);
            errorCallback();
        }
    });
}

var main = function() {
    wrap(databaseURI, function(db, callback) {
        itemFetcher.itemStream(function(item, timestamp) {
            Item.findOne({
                id: item.id
            }, function(error, existingItem) {
                if (error) {
                    console.log('Error finding item ID ' + item.id + ': ' + error);
                    callback();
                }
                console.log('Adding: ' + item.name + ' ' + item.current.price);
                if (!existingItem) {
                    console.log(item.name + ' is a new item!');
                    createItem(item, timestamp, callback);
                } else {
                    updateItem(existingItem, item, timestamp, callback);
                }
            });
        });
    });
}

main();
