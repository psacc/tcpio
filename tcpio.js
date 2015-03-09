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
        c.on('error', console.error);

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


function testServer(port, command) {
    var command_params = [].slice.call(arguments, 2);
    console.log('testServer');

    var s = net.createServer(function(c) {
        console.log('client connected');
        c.on('end', function() {
            console.log('client disconnected');
        });
        c.on('error', console.error);

        setInterval(function () {
            c.write("testServer speaking!\n");
        }, 1000);

        c.pipe(process.stdout);
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

function testClient(port) {
    console.log('testClient');

    var c = net.connect({port: port},
        function() {
            console.log('connected to server!');
            setInterval(function () {
                c.write("testClient speaking!\n");
            }, 1000);
            c.pipe(process.stdin);
        });
}

function testProcess(message) {
    setInterval(function () {
        process.stdout.write(message + "\n");
    }, 1000);
    process.stdin.pipe(process.stderr);
}

var functionalities = {
    server : server,
    client : client,
    testServer : testServer,
    testClient : testClient,
    testProcess : testProcess
};

console.log('Starting ' + type);

functionalities[type].apply(this, params);
