var socket = io.connect({port:8000});

var Content = document.querySelector('.container');

document.addEventListener('click', event => {
	const element = event.target;
	// If a TOC header has been clicked:
	if (element.className === 'toc-item-link') {
		// Get the slug and display it:
		const slug = element.dataset.slug;
		console.info('Clicked header slug: ' + slug);

        webviewApi.postMessage({
			name: 'scrollToHash',
			hash: element.dataset.slug,
		});
	}
});

Content.addEventListener('keypress', () => {
	socket.emit('contentChange',)
})

socket.on('onContentChange',(data) => {
	console.log(data);
})