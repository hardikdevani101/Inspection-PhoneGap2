self.addEventListener('message', function(event) {
	console.log('Donwload worker called' + event.data);
}, false);

self.addEventListener('message', function(event) {
//	console.log('Error -Donwload-Worker said: ' + event.message, event);
}, false);