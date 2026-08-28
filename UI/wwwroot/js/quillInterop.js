// Thin bridge between the Blazor RichTextEditor component and the vendored Quill editor.
// Instances are tracked per container element so multiple editors can coexist on a page.
window.aopcQuill = (function () {
    const instances = new WeakMap();

    function init(container, dotnetRef, html, placeholder) {
        if (!container || typeof Quill === 'undefined') return;
        // Guard against re-init on Blazor re-render.
        if (instances.has(container)) return;

        const quill = new Quill(container, {
            theme: 'snow',
            placeholder: placeholder || '',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ header: [1, 2, 3, false] }],
                    ['link'],
                    ['clean']
                ]
            }
        });

        if (html) {
            quill.clipboard.dangerouslyPasteHTML(html);
        }

        // Debounce change notifications so we don't round-trip to .NET on every keystroke.
        let timer = null;
        quill.on('text-change', function () {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                const content = quill.root.innerHTML;
                dotnetRef.invokeMethodAsync('OnContentChanged', content);
            }, 250);
        });

        instances.set(container, quill);
    }

    function setHtml(container, html) {
        const quill = instances.get(container);
        if (!quill) return;
        const current = quill.root.innerHTML;
        if ((html || '') !== current) {
            quill.clipboard.dangerouslyPasteHTML(html || '');
        }
    }

    function insertText(container, text) {
        const quill = instances.get(container);
        if (!quill) return;
        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();
        quill.insertText(index, text, 'user');
        quill.setSelection(index + text.length, 0, 'user');
    }

    function clear(container, dotnetRef) {
        const quill = instances.get(container);
        if (!quill) return;
        quill.setText('');
        dotnetRef.invokeMethodAsync('OnContentChanged', '');
    }

    function destroy(container) {
        instances.delete(container);
    }

    return { init, setHtml, insertText, clear, destroy };
})();
