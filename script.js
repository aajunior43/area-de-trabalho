// Elements
const wordInput = document.getElementById('newWord');
const wordListEl = document.getElementById('wordList');

// State
let words = JSON.parse(localStorage.getItem('clipboardWords')) || [];

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    restoreTheme();
    updateThemeIcon();
    updateWordList();
});

// ========= Word functions ========= //
function saveWords() {
    localStorage.setItem('clipboardWords', JSON.stringify(words));
}

function addWord() {
    const newWord = wordInput.value.trim();
    if (!newWord) return;
    words.push(newWord);
    wordInput.value = '';
    updateWordList();
    saveWords();
}

function removeWord(index) {
    words.splice(index, 1);
    updateWordList();
    saveWords();
}

function clearWords() {
    if (!words.length) return;
    if (confirm('Tem certeza que deseja limpar toda a lista?')) {
        words = [];
        updateWordList();
        saveWords();
    }
}

function copyWord(index) {
    navigator.clipboard.writeText(words[index])
        .then(() => {
            const wordButtons = document.querySelectorAll('.word-item');
            const btn = wordButtons[index];
            const original = btn.textContent;
            btn.textContent = 'Copiado!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 1500);
        })
        .catch(err => console.error('Erro ao copiar:', err));
}

function updateWordList() {
    wordListEl.innerHTML = '';
    words.forEach((word, idx) => {
        const container = document.createElement('div');
        container.className = 'word-item-container';

        const wordBtn = document.createElement('button');
        wordBtn.className = 'word-item btn';
        wordBtn.textContent = word;
        wordBtn.addEventListener('click', () => copyWord(idx));

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeWord(idx); });

        container.appendChild(wordBtn);
        container.appendChild(removeBtn);
        wordListEl.appendChild(container);
    });
}

// ========= File I/O ========= //
function downloadWords() {
    if (!words.length) return;
    const blob = new Blob([words.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'area_de_transferencia.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadWords() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const uploaded = content.split(/\r?\n/).filter(w => w.trim());
        words = [...new Set([...words, ...uploaded])]; // avoids duplicates
        updateWordList();
        saveWords();
    };
    reader.readAsText(file);
}

// ========= Theme ========= //
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function restoreTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
}

function updateThemeIcon(theme = document.documentElement.getAttribute('data-theme') || 'dark') {
    const icon = document.querySelector('.theme-toggle i');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ========= Events ========= //
wordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWord(); });

// Expose to global scope for HTML inline handlers (optional)
window.addWord = addWord;
window.downloadWords = downloadWords;
window.uploadWords = uploadWords;
window.toggleTheme = toggleTheme;
window.clearWords = clearWords;