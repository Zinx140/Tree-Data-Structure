// --- KONFIGURASI VISUAL ---
const NODE_RADIUS = 25;
const VERTICAL_SPACING = 70;
const HORIZONTAL_SPACING = 60;
const ANIMATION_SPEED = 0.15;

// --- STRUKTUR DATA TRIE ---
class TrieNode {
    constructor(char = '') {
        this.char = char;
        this.children = {};
        this.isEndOfWord = false;
        
        // Visual
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.level = 0;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode('*'); // Root dengan karakter khusus
    }

    // ================= INSERT =================
    insert(word) {
        if (!word || word.trim() === '') {
            setMessage('Masukkan kata yang valid!');
            return;
        }

        word = word.toLowerCase().trim();
        let current = this.root;

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            
            if (!current.children[char]) {
                current.children[char] = new TrieNode(char);
                setMessage(`Menambahkan karakter '${char}' ke Trie.`);
            }
            
            current = current.children[char];
        }

        if (current.isEndOfWord) {
            setMessage(`Kata "${word}" sudah ada di Trie.`);
        } else {
            current.isEndOfWord = true;
            setMessage(`Kata "${word}" berhasil ditambahkan ke Trie.`);
        }
    }

    // ================= SEARCH =================
    search(word) {
        if (!word || word.trim() === '') {
            setMessage('Masukkan kata yang valid!');
            return false;
        }

        word = word.toLowerCase().trim();
        let current = this.root;

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            
            if (!current.children[char]) {
                setMessage(`Kata "${word}" tidak ditemukan di Trie.`);
                return false;
            }
            
            current = current.children[char];
        }

        if (current.isEndOfWord) {
            setMessage(`Kata "${word}" ditemukan di Trie!`);
            return true;
        } else {
            setMessage(`Kata "${word}" tidak ditemukan (hanya prefix).`);
            return false;
        }
    }

    // ================= DELETE =================
    delete(word) {
        if (!word || word.trim() === '') {
            setMessage('Masukkan kata yang valid!');
            return;
        }

        word = word.toLowerCase().trim();
        
        if (!this.search(word)) {
            setMessage(`Kata "${word}" tidak ada di Trie.`);
            return;
        }

        this._delete(this.root, word, 0);
        setMessage(`Kata "${word}" berhasil dihapus dari Trie.`);
    }

    _delete(node, word, index) {
        if (index === word.length) {
            node.isEndOfWord = false;
            return Object.keys(node.children).length === 0;
        }

        const char = word[index];
        const childNode = node.children[char];

        if (!childNode) {
            return false;
        }

        const shouldDeleteChild = this._delete(childNode, word, index + 1);

        if (shouldDeleteChild) {
            delete node.children[char];
            return Object.keys(node.children).length === 0 && !node.isEndOfWord;
        }

        return false;
    }

    // ================= UTILITY =================
    startsWith(prefix) {
        prefix = prefix.toLowerCase().trim();
        let current = this.root;

        for (let i = 0; i < prefix.length; i++) {
            const char = prefix[i];
            
            if (!current.children[char]) {
                return false;
            }
            
            current = current.children[char];
        }

        return true;
    }
}

// --- VISUALISASI ---
const trie = new Trie();
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

// Layout Logic
function calculatePositions() {
    if (!trie.root) return;
    
    // Hitung posisi setiap node
    const levelNodes = [];
    
    function traverse(node, level) {
        if (!node) return;
        
        if (!levelNodes[level]) {
            levelNodes[level] = [];
        }
        
        node.level = level;
        levelNodes[level].push(node);
        
        const children = Object.values(node.children);
        children.forEach(child => traverse(child, level + 1));
    }
    
    traverse(trie.root, 0);
    
    // Atur posisi horizontal dan vertikal
    levelNodes.forEach((nodes, level) => {
        const totalWidth = nodes.length * HORIZONTAL_SPACING;
        const startX = Math.max(100, (container.clientWidth - totalWidth) / 2);
        
        nodes.forEach((node, index) => {
            node.targetX = startX + (index * HORIZONTAL_SPACING);
            node.targetY = 60 + (level * VERTICAL_SPACING);
        });
    });
    
    resizeCanvas();
}

function resizeCanvas() {
    if (!trie.root) return;
    
    let maxX = 0, maxY = 0;
    
    function findBounds(node) {
        if (!node) return;
        
        if (node.targetX > maxX) maxX = node.targetX;
        if (node.targetY > maxY) maxY = node.targetY;
        
        Object.values(node.children).forEach(child => findBounds(child));
    }
    
    findBounds(trie.root);
    
    const newWidth = Math.max(container.clientWidth, maxX + 100);
    const newHeight = Math.max(container.clientHeight, maxY + 100);
    
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
    }
}

// --- ANIMATION LOOP ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (trie.root) {
        updateAnimation(trie.root);
        drawConnections(trie.root);
        drawNodes(trie.root);
    }
    
    requestAnimationFrame(draw);
}

function updateAnimation(node) {
    if (!node) return;
    
    node.x += (node.targetX - node.x) * ANIMATION_SPEED;
    node.y += (node.targetY - node.y) * ANIMATION_SPEED;
    
    if (Math.abs(node.x - node.targetX) < 0.5) node.x = node.targetX;
    if (Math.abs(node.y - node.targetY) < 0.5) node.y = node.targetY;
    
    Object.values(node.children).forEach(child => updateAnimation(child));
}

function drawConnections(node) {
    if (!node) return;
    
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    
    Object.values(node.children).forEach(child => {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(child.x, child.y);
        ctx.stroke();
        drawConnections(child);
    });
}

function drawNodes(node) {
    if (!node) return;
    
    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    
    // Color based on type
    if (node === trie.root) {
        ctx.fillStyle = '#ffd700'; // Gold for root
    } else if (node.isEndOfWord) {
        ctx.fillStyle = '#90EE90'; // Light green for end of word
    } else {
        ctx.fillStyle = '#ffffff'; // White for regular nodes
    }
    
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw character
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.char, node.x, node.y);
    
    // Draw children
    Object.values(node.children).forEach(child => drawNodes(child));
}

// --- CONTROLS ---
function updateTrieVisuals() {
    calculatePositions();
}

function insertWord() {
    const val = document.getElementById('inputValue').value;
    if (!val || val.trim() === '') {
        setMessage('Masukkan kata yang valid!');
        return;
    }
    
    trie.insert(val);
    document.getElementById('inputValue').value = '';
    updateTrieVisuals();
}

function searchWord() {
    const val = document.getElementById('inputValue').value;
    if (!val || val.trim() === '') {
        setMessage('Masukkan kata yang valid!');
        return;
    }
    
    trie.search(val);
    updateTrieVisuals();
}

function deleteWord() {
    const val = document.getElementById('inputValue').value;
    if (!val || val.trim() === '') {
        setMessage('Masukkan kata yang valid!');
        return;
    }
    
    trie.delete(val);
    updateTrieVisuals();
}

function resetTrie() {
    trie.root = new TrieNode('*');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMessage("Trie Di-Reset.");
}

function setMessage(msg) {
    document.getElementById('message').innerText = msg;
}

// Init
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;
draw();

window.addEventListener('resize', () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    updateTrieVisuals();
});