var NATS = require('nats');
var nats = NATS.connect("nats://localhost:4222");

console.log('Start nats: ');

// Simple Publisher
var counter = 0;
setInterval(function() {
  var message = {
    counter: counter++,
    payload: 'Hello world!'
  };
  nats.publish('foo.bar', JSON.stringify(message));
}, 5000);


// Simple Subscriber
nats.subscribe('foo.*', function(msg) {
  console.log('Received a message: ' + msg);
});

// Unsubscribing
var sid = nats.subscribe('foo.*', function(msg) {});
nats.unsubscribe(sid);

// Request Streams
var sid = nats.request('request', function(response) {
  console.log('Got a response in msg stream: ' + response);
});

// Request with Auto-Unsubscribe. Will unsubscribe after
// the first response is received via {'max':1}
nats.request('help', null, {'max':1}, function(response) {
  console.log('Got a response for help: ' + response);
});


// Request for single response with timeout.
nats.requestOne('help', null, {}, 1000, function(response) {
  // `NATS` is the library.
  if(response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
    console.log('Request for help timed out.');
    return;
  }
  console.log('Got a response for help: ' + response);
});

// Replies
nats.subscribe('help', function(request, replyTo) {
  nats.publish(replyTo, 'I can help!');
});

// Close connection
setTimeout(function() {
  nats.close();
}, 300000);
