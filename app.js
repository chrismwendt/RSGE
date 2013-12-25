var express = require('express');

var port = process.env.PORT || 3000;;

var app = express();

app.get('/', function(request, response) {
    console.log('GET /');
    response.send('hello, world');
});

var main = function() {
    app.listen(port, function() {
        console.log('Listening on port ' + port);
    });
}

if (require.main === module) {
    main();
}
