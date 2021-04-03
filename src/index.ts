import joplin from 'api';

const uslug = require('uslug');

let slugs = {};

function noteHeaders(noteBody:string) {
	const headers = [];
	const lines = noteBody.split('\n');
	for (const line of lines) {
		const match = line.match(/^(#+)\s(.*)*/);
		if (!match) continue;
		headers.push({
			level: match[1].length,
			text: match[2],
		});
	}
	return headers;
}

function headerSlug(headerText) {
	const s = uslug(headerText);
	let num = slugs[s] ? slugs[s] : 1;
	const output = [s];
	if (num > 1) output.push(num);
	slugs[s] = num + 1;
	return output.join('-');
}

function escapeHtml(unsafe:string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

joplin.plugins.register({
	onStart: async function() {
		console.info('TOC plugin started!');
        
		const panel = await joplin.views.panels.create('panel_1');
		
		await joplin.views.panels.addScript(panel, './webview.css');
        await joplin.views.panels.addScript(panel, './webview.js'); 

		await joplin.views.panels.setHtml(panel,'Loading...');
        
		await joplin.views.panels.onMessage(panel, (message) => {
			if (message.name === 'scrollToHash') {
				// As the name says, the scrollToHash command makes the note scroll
				// to the provided hash.
				joplin.commands.execute('scrollToHash', message.hash)
			}
		});
		
		async function updateTOCview() {
			
			const note = await joplin.workspace.selectedNote();
            slugs = {};

			if(note){
				const headers = noteHeaders(note.body);
                 
				const itemHtml = [];
				for(const header of headers) {
					const slug = headerSlug(header.text);

					itemHtml.push(`
						<p class="toc-item" style="padding-left:${(header.level - 1) * 15}px">
							<a class="toc-item-link" href="#" data-slug="${escapeHtml(slug)}">
								${escapeHtml(header.text)}
							</a>
						</p>
					`);
				}
                
				await joplin.views.panels.setHtml(panel, `
					<div class="container">
						${itemHtml.join('\n')}
					</div>
				`);

				console.info('Note content has changed:',note);
			}
			else{
				await joplin.views.panels.setHtml(panel, 'Please select a note to view the table of content');
				console.info('No note selected');
			}
		}

		await joplin.workspace.onNoteSelectionChange(() => {
			updateTOCview();
		});

		await joplin.workspace.onNoteChange(() => updateTOCview());

		updateTOCview();
	},
});

