var express = require('express');

var port = 3000;

var app = express();

app.get('/', function(request, response) {
    console.log('GET /');
    response.send('hello, world');
});

app.listen(port, function() {
    console.log('Listening on port ' + port);
});
