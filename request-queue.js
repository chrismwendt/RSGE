var __ = require('underscore');
var request = require('request');

exports.minDelay = 1/16*1000;
exports.maxDelay = 16*1000;
exports.enqueue = function(urls, callback) {
    urls = __.union(urls, urls);
    __.each(urls, function(url) {
        queue.push({'url': url, 'callback': callback});
    });
    if (queue.length == urls.length) scheduleNext();
};
exports.drain = undefined;

var queue = [];
var delay = exports.minDelay;
var scheduleNext = function() {
    __.delay(__(request).partial(queue[0].url, __(handler).partial(Date())), delay);
};
var handler = function(startTime, error, response) {
    if (error || !response.body) { 
        delay = Math.min(delay*2, exports.maxDelay);
        scheduleNext();
        return;
    }

    queue[0].callback(response, startTime);
    queue.shift();

    delay = Math.max(delay/2, exports.minDelay);
    if (!__.isEmpty(queue)) scheduleNext();
    else if (exports.drain) exports.drain();
};
