// content.js
let bubble = null;
let dismissTimer = null;

function dismiss() {
    if (bubble) { bubble.remove(); bubble = null; }
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
}

function show(text, isError) {
    dismiss();
    bubble = document.createElement('div');
    bubble.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        max-width: 320px;
        padding: 10px 14px;
        background: #ffffff;
        border: none;
        border-radius: 10px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        color: ${isError ? '#c66' : '#c8c8c8'};
        font-size: 12px;
        font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.55;
        z-index: 2147483647;
        cursor: pointer;
        user-select: none;
    `;
    bubble.textContent = text;
    bubble.addEventListener('click', dismiss);
    document.body.appendChild(bubble);
    dismissTimer = setTimeout(dismiss, 45000);
}

document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        const sel = (window.getSelection()?.toString() || '').trim();
        
        if (sel.length < 3) {
            show('Selecione um texto primeiro (mínimo 3 letras).', true);
            return;
        }
        
        e.preventDefault();
        show('…');
        
        try {
            chrome.runtime.sendMessage({ action: 'askGemini', question: sel }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    show('Recarregue a página (Ctrl+R) para atualizar a extensão.', true);
                    return;
                }
                if (response.success) {
                    show(response.answer, false);
                } else {
                    show('Erro: ' + response.error, true);
                }
            });
        } catch (err) {
            show('Recarregue a página (Ctrl+R) para atualizar a extensão.', true);
        }
    }
    
    if (e.key === 'Escape') dismiss();
});