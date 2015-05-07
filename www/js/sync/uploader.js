self.addEventListener('message', function(event) {
	console.log('Upload-Worker said: ', event.data);
}, false);

self.addEventListener('error', function(event) {
	//console.log('Error -Upload-Worker said: ' + event.message, event);
}, false);