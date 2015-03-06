var net = require('net');
var child_process = require('child_process');

var type = process.argv[2];
var params = process.argv.slice(3);

function server(port, command) {
    var command_params = [].slice.call(arguments, 2);
    console.log('server');

    var s = net.createServer(function(c) {
        console.log('client connected');
        c.on('end', function() {
            console.log('client disconnected');
        });

        console.log('executing command: ' + command + ' with params: ' + command_params);
        var child = child_process.spawn(command, command_params);
        child.stdout.pipe(c);
        c.pipe(child.stdin);
        child.stderr.pipe(process.stderr);
        child.stdin.on('end', function () {
            console.log('__END__');
        });
    });

    s.listen(port, function() {
        console.log('server bound');
    });
}
function client(port) {
    console.log('client');

    var c = net.connect({port: port},
        function() {
            console.log('connected to server!');
            process.stdout.pipe(c);
            c.pipe(process.stdin);
        });
}

var functionalities = {
    server: server,
    client: client
};

console.log('Starting ' + type);

functionalities[type].apply(this, params);
