// --- STRUKTUR DATA ARRAY ---

// Array untuk menyimpan node.
// Format item: { value: number, left: index, right: index, parent: index, active: boolean }
let treeData = []; 
let root = -1; // Menunjuk ke INDEX di dalam treeData

// Helper untuk membuat node baru di array
function createNode(value) {
    const newNode = {
        value: value,
        left: -1,   // -1 artinya NULL
        right: -1,
        parent: -1,
        active: true // Penanda apakah node ini "hidup" atau sudah dihapus
    };
    treeData.push(newNode);
    return treeData.length - 1; // Kembalikan indexnya
}

// --- LOGIKA SPLAY TREE (ARRAY VERSION) ---

// Rotasi Kanan (Zig) pada index x
function rightRotate(x) {
    let y = treeData[x].left; // y adalah anak kiri x
    
    // x.left = y.right
    treeData[x].left = treeData[y].right;
    
    // Jika y.right bukan null (-1), update parentnya ke x
    if (treeData[y].right !== -1) {
        treeData[treeData[y].right].parent = x;
    }
    
    // y.parent = x.parent
    treeData[y].parent = treeData[x].parent;
    
    // Jika x tadinya root
    if (treeData[x].parent === -1) {
        root = y;
    } 
    // Jika x adalah anak kanan dari parentnya
    else if (x === treeData[treeData[x].parent].right) {
        treeData[treeData[x].parent].right = y;
    } 
    // Jika x adalah anak kiri dari parentnya
    else {
        treeData[treeData[x].parent].left = y;
    }
    
    // y.right = x
    treeData[y].right = x;
    // x.parent = y
    treeData[x].parent = y;
}

// Rotasi Kiri (Zag) pada index x
function leftRotate(x) {
    let y = treeData[x].right; // y adalah anak kanan x
    
    // x.right = y.left
    treeData[x].right = treeData[y].left;
    
    // Jika y.left bukan null, update parentnya ke x
    if (treeData[y].left !== -1) {
        treeData[treeData[y].left].parent = x;
    }
    
    // y.parent = x.parent
    treeData[y].parent = treeData[x].parent;
    
    // Jika x tadinya root
    if (treeData[x].parent === -1) {
        root = y;
    } 
    else if (x === treeData[treeData[x].parent].left) {
        treeData[treeData[x].parent].left = y;
    } 
    else {
        treeData[treeData[x].parent].right = y;
    }
    
    // y.left = x
    treeData[y].left = x;
    // x.parent = y
    treeData[x].parent = y;
}

// Fungsi Splay: Membawa node pada index 'idx' ke root
function splay(idx) {
    if (idx === -1 || !treeData[idx].active) return;

    while (treeData[idx].parent !== -1) {
        let p = treeData[idx].parent;      // Parent
        let g = treeData[p].parent;        // Grandparent

        // Case 1: Parent adalah Root (Zig)
        if (g === -1) {
            if (treeData[p].left === idx) {
                rightRotate(p);
            } else {
                leftRotate(p);
            }
        } 
        else {
            // Case 2: Zig-Zig (Kiri-Kiri)
            if (treeData[g].left === p && treeData[p].left === idx) {
                rightRotate(g);
                rightRotate(p);
            }
            // Case 3: Zag-Zag (Kanan-Kanan)
            else if (treeData[g].right === p && treeData[p].right === idx) {
                leftRotate(g);
                leftRotate(p);
            }
            // Case 4: Zig-Zag (Kiri-Kanan)
            else if (treeData[g].left === p && treeData[p].right === idx) {
                leftRotate(p);
                rightRotate(g);
            }
            // Case 5: Zag-Zig (Kanan-Kiri)
            else { // g.right == p && p.left == idx
                rightRotate(p);
                leftRotate(g);
            }
        }
    }
}

// Insert (BST Logic lalu Splay)
function insert(value) {
    if (root === -1) {
        root = createNode(value);
        return;
    }

    let curr = root;
    let parent = -1;

    // Cari posisi BST
    while (curr !== -1) {
        parent = curr;
        if (value < treeData[curr].value) {
            curr = treeData[curr].left;
        } else if (value > treeData[curr].value) {
            curr = treeData[curr].right;
        } else {
            // Duplicate, splay yang ada dan return
            splay(curr);
            setMessage("Nilai duplikat, di-splay ke root.", "orange");
            return;
        }
    }

    // Buat node baru di array
    let newIdx = createNode(value);
    treeData[newIdx].parent = parent;

    if (value < treeData[parent].value) {
        treeData[parent].left = newIdx;
    } else {
        treeData[parent].right = newIdx;
    }

    // Splay node baru ke atas
    splay(newIdx);
}

// Search
function search(value) {
    if (root === -1) return false;

    let curr = root;
    let lastAccessed = root;

    while (curr !== -1) {
        if (value === treeData[curr].value) {
            splay(curr);
            return true;
        }
        
        lastAccessed = curr; // Simpan jejak terakhir sebelum null
        
        if (value < treeData[curr].value) {
            curr = treeData[curr].left;
        } else {
            curr = treeData[curr].right;
        }
    }

    // Jika tidak ketemu, splay node terakhir yang dikunjungi
    if (lastAccessed !== -1) {
        splay(lastAccessed);
    }
    return false;
}

// Helper: Mencari Max di subtree (Predecessor logic)
function findMax(idx) {
    let curr = idx;
    while (treeData[curr].right !== -1) {
        curr = treeData[curr].right;
    }
    return curr;
}

// Delete
function deleteNode(value) {
    if (!search(value)) return false; 
    // search() sudah melakukan Splay target ke Root jika ditemukan.
    // Jadi sekarang root adalah node yang mau dihapus.

    let target = root; // Index target

    // Jika target tidak punya anak kiri
    if (treeData[target].left === -1) {
        root = treeData[target].right;
        if (root !== -1) treeData[root].parent = -1;
    } 
    else {
        // Ada anak kiri (dan mungkin kanan)
        // 1. Putuskan link root
        let leftSubtree = treeData[target].left;
        let rightSubtree = treeData[target].right;

        treeData[leftSubtree].parent = -1; // Sementara jadi root sendiri
        
        // 2. Cari Predecessor (Max di Kiri)
        let maxLeft = findMax(leftSubtree);
        
        // 3. Splay Predecessor ke puncak Subtree Kiri
        // Kita perlu set root sementara ke leftSubtree agar splay bekerja di subtree tsb (atau panggil splay logic manual)
        // Namun, karena parent leftSubtree sudah -1, fungsi splay(maxLeft) akan menjadikannya root global baru jika dijalankan.
        // Karena `parent` dari `leftSubtree` sudah diputus (-1), `splay(maxLeft)` akan berhenti saat `maxLeft` mencapai posisi teratas (yang parentnya -1).
        
        // Trik: set parent leftSubtree = -1 sudah dilakukan di atas.
        splay(maxLeft); 
        // Sekarang `root` berubah menjadi `maxLeft` karena efek samping fungsi splay
        // Dan `maxLeft` ini tidak punya anak kanan (karena dia max).

        // 4. Sambung subtree Kanan ke kanan Predecessor
        treeData[maxLeft].right = rightSubtree;
        if (rightSubtree !== -1) {
            treeData[rightSubtree].parent = maxLeft;
        }
        
        root = maxLeft;
    }

    // Tandai node lama sebagai tidak aktif (soft delete)
    treeData[target].active = false;
    return true;
}


// --- VISUALISASI ---

const svg = document.getElementById('tree-svg');
const tableBody = document.querySelector('#memory-table tbody');
const messageBox = document.getElementById('message-box');
const inputField = document.getElementById('nodeValue');

function setMessage(msg, color = '#333') {
    messageBox.textContent = msg;
    messageBox.style.color = color;
}

function drawTree() {
    svg.innerHTML = '';
    renderTable(); // Update tabel juga

    if (root === -1) return;

    const width = svg.clientWidth || 800;
    // Gambar rekursif mulai dari root index
    drawNodeRecursive(root, width / 2, 40, width / 4);
}

function drawNodeRecursive(idx, x, y, offset) {
    if (idx === -1) return;
    const node = treeData[idx];

    // Gambar Edge ke Kiri
    if (node.left !== -1) {
        drawLine(x, y, x - offset, y + 60);
        drawNodeRecursive(node.left, x - offset, y + 60, offset / 1.8);
    }
    // Gambar Edge ke Kanan
    if (node.right !== -1) {
        drawLine(x, y, x + offset, y + 60);
        drawNodeRecursive(node.right, x + offset, y + 60, offset / 1.8);
    }

    // Gambar Node
    drawCircle(x, y, node.value, idx);
}

function drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    svg.appendChild(line);
}

function drawCircle(x, y, value, idx) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 20);

    // Styling khusus Root
    if (idx === root) circle.classList.add('root');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.textContent = value; // + `[${idx}]` jika ingin debug index

    // Hover effect untuk melihat detail index di console/tooltip (opsional)
    group.appendChild(circle);
    group.appendChild(text);
    svg.appendChild(group);
}

// --- HANDLERS ---

function getInputValue() {
    const val = parseInt(inputField.value);
    if (isNaN(val)) {
        setMessage("Input angka valid!", "red");
        return null;
    }
    return val;
}

function handleInsert() {
    const val = getInputValue();
    if (val === null) return;
    insert(val);
    drawTree();
    setMessage(`Insert ${val} sukses.`, "green");
    inputField.value = '';
    inputField.focus();
}

function handleSearch() {
    const val = getInputValue();
    if (val === null) return;
    const found = search(val);
    drawTree();
    setMessage(found ? `Ketemu ${val} (Splayed).` : `${val} tidak ada (Nearest Splayed).`, found ? "blue" : "orange");
    inputField.value = '';
    inputField.focus();
}

function handleDelete() {
    const val = getInputValue();
    if (val === null) return;
    const success = deleteNode(val);
    drawTree();
    setMessage(success ? `Delete ${val} sukses.` : `${val} tidak ditemukan.`, success ? "red" : "orange");
    inputField.value = '';
    inputField.focus();
}

function handleReset() {
    treeData = [];
    root = -1;
    drawTree();
    setMessage("Tree dan Memori direset.");
}

// Init
drawTree();