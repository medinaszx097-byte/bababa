// background.js
const GEMINI_API_KEY = '//bota o nome aqui';
const MODEL = 'gemini-3.5-flash-lite';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'askGemini') {
        askGemini(request.question)
            .then(answer => sendResponse({ success: true, answer }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

function limpar(texto) {
    return texto
        .replace(/[*#_~`>]/g, '')
        .replace(/^[\-•]\s*/gm, '')
        .replace(/^\d+[\.\)]\s*/gm, '')
        .replace(/[,.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function askGemini(question) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = [
        'Responda em português de forma MUITO curta e resumida (máximo 2 frases).',
        'Use texto puro e corrido, como se estivesse conversando.',
        'NÃO use formatação: sem asteriscos, sem negrito, sem listas, sem títulos, sem markdown.',
        'NÃO use vírgulas nem pontos finais.',
        'Pergunta: ' + question
    ].join(' ');

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 400 }
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts
        .filter(p => !p.thought)
        .map(p => p.text || '')
        .join('')
        .trim();

    return limpar(raw) || '(sem resposta)';
}