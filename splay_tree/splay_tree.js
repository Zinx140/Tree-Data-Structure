const NODE_RADIUS = 25;
const VERTICAL_SPACING = 70;
const ANIMATION_SPEED = 0.15;

class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        // Visual Properties
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        // Helper Layout
        this.visIndex = 0;
    }
}
class SplayTree {
    constructor() {
        this.root = null;
    }

    // ROTASI 
    rightRotate(x) {
        let y = x.left;
        x.left = y.right;
        if (y.right) {
            y.right.parent = x;
        } 

        y.parent = x.parent;

        if (!x.parent) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        } 

        y.right = x;
        x.parent = y;
    }

    leftRotate(x) {
        let y = x.right;
        x.right = y.left;

        if (y.left) {
            y.left.parent = x;
        } 

        y.parent = x.parent;

        if (!x.parent) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }

        y.left = x;
        x.parent = y;
    }
    
    // SPLAY 
    splay(n) {
        while (n.parent) {
            if (!n.parent.parent) {

                // Zig / Zag
                if (n.parent.left === n) {
                    this.rightRotate(n.parent);
                } else {
                    this.leftRotate(n.parent);
                } 

            } else {

                let p = n.parent;
                let g = p.parent;
                if (n.parent.left === n && p.parent.left === p) { // Zig-Zig
                    this.rightRotate(g);
                    this.rightRotate(p);
                } else if (n.parent.right === n && p.parent.right === p) { // Zag-Zag
                    this.leftRotate(g);
                    this.leftRotate(p);
                } else if (n.parent.right === n && p.parent.left === p) { // Zig-Zag
                    this.leftRotate(p);
                    this.rightRotate(g);
                } else { // Zag-Zig
                    this.rightRotate(p);
                    this.leftRotate(g);
                }

            }
        }
    }

    // HELPER UNTUK DELETE 
    replaceNode(u, v) {
        if (!u.parent) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        } 

        if (v) {
            v.parent = u.parent;
        } 
    }

    // INSERT 
    insert(value) {
        let z = this.root;
        let p = null;
        while (z) {
            p = z;
            if (value < z.value) {
                z = z.left;
            } else if (value > z.value) {
                z = z.right;
            } else {
                setMessage(`Nilai ${value} sudah ada. Splaying ke root.`);
                this.splay(z);
                return;
            }
        }

        let newNode = new Node(value);
        newNode.parent = p;
        if (p) {
            newNode.x = p.x;
            newNode.y = p.y;
        } else {
            newNode.x = container.clientWidth / 2;
            newNode.y = 50;
        }

        if (!p) {
            this.root = newNode;
        } else if (value < p.value) {
            p.left = newNode;
        } else { 
            p.right = newNode;
        }
        setMessage(`Insert ${value} (BST), lalu Splay ke Root.`);
        this.splay(newNode);
    }

    // SEARCH 
    search(value) {
        let z = this.root;
        let lastVisited = null;
        while (z) {
            if (value === z.value) {
                setMessage(`Ditemukan ${value}. Splaying ke Root.`);
                this.splay(z);
                return true;
            }

            lastVisited = z;
            if (value < z.value) {
                z = z.left;
            } else {
                z = z.right;
            } 
        }

        if (lastVisited) {
            setMessage(`${value} tidak ditemukan. Splaying parent terakhir (${lastVisited.value}).`);
            this.splay(lastVisited);
        } else {
            setMessage("Tree kosong.");
        }
        return false;
    }

    //  DELETE  
    delete(value) {
        let z = this.root;
        let lastVisited = null;
        // 1. Cari Node
        while (z) {
            if (z.value === value) break;

            lastVisited = z;
            if (value < z.value) {
                z = z.left;
            } else {
                z = z.right;
            }
        }
        // Jika tidak ketemu
        if (!z) {
            setMessage(`Delete ${value} gagal (tidak ada). Splay node terakhir dikunjungi.`);
            if (lastVisited) {
                this.splay(lastVisited);
            } 
            return;
        }
        setMessage(`Menghapus ${value}...`);
        let nodeToSplay = null; 
        if (z.left && z.right) {
            let predecessor = z.left;
            while (predecessor.right) {
                predecessor = predecessor.right;
            }
            
            let parentOfPredecessor = predecessor.parent;
            z.value = predecessor.value;
            this.replaceNode(predecessor, predecessor.left);

            if (parentOfPredecessor === z) {
                nodeToSplay = z;
            } else {
                nodeToSplay = parentOfPredecessor;
            }

            setMessage(`Swap dengan Predecessor. Hapus fisik. Splay parent (${nodeToSplay.value}).`);
        } else {
            
            nodeToSplay = z.parent;
            if (!z.left) {
                this.replaceNode(z, z.right);
            } else {
                this.replaceNode(z, z.left);
            } 

            if (nodeToSplay) {
                setMessage(`Node dihapus. Splay parent (${nodeToSplay.value}).`);
            } else {
                setMessage(`Root dihapus.`);
            } 
            
        }

        if (nodeToSplay) {
            setTimeout(() => {
                this.splay(nodeToSplay);
                updateTreeVisuals(); 
            }, 600); 
        }
    }
}

// --- VISUALISASI ---
const tree = new SplayTree();
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

let globalIndex = 0;
function calculatePositions() {
    if (!tree.root) return;

    globalIndex = 0;
    assignInorderIndex(tree.root);
    const X_SPACING = 55;
    assignCoordinates(tree.root, X_SPACING, 60);
    resizeCanvas();
}

function assignInorderIndex(node) {
    if (!node) return;

    assignInorderIndex(node.left);
    node.visIndex = globalIndex++;
    assignInorderIndex(node.right);
}

function assignCoordinates(node, spacing, y) {
    if (!node) return;

    node.targetX = (node.visIndex * spacing) + spacing;
    node.targetY = y;
    assignCoordinates(node.left, spacing, y + VERTICAL_SPACING);
    assignCoordinates(node.right, spacing, y + VERTICAL_SPACING);
}

function findBounds(node, bounds) {
    if (!node) return;

    if (node.targetX > bounds.maxX) {
        bounds.maxX = node.targetX;
    }

    if (node.targetY > bounds.maxY) {
        bounds.maxY = node.targetY;
    }

    findBounds(node.left, bounds);
    findBounds(node.right, bounds);
}

function resizeCanvas() {
    if (!tree.root) return;
    
    let currentBounds = { maxX: 0, maxY: 0 };

    findBounds(tree.root, currentBounds);

    const maxX = currentBounds.maxX;
    const maxY = currentBounds.maxY;

    const newWidth = Math.max(container.clientWidth, maxX + 100);
    const newHeight = Math.max(container.clientHeight, maxY + 100);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
    }

    if (maxX < container.clientWidth) {
        let offset = (container.clientWidth - (maxX + 50)) / 2;
        if (offset > 0) shiftTreeX(tree.root, offset);
    }
}

function shiftTreeX(node, offset) {
    if (!node) return;

    node.targetX += offset;
    shiftTreeX(node.left, offset);
    shiftTreeX(node.right, offset);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (tree.root) {
        updateAnimation(tree.root);
        drawConnections(tree.root);
        drawNodes(tree.root);
    }
    requestAnimationFrame(draw);
}

function updateAnimation(node) {
    if (!node) return;

    node.x += (node.targetX - node.x) * ANIMATION_SPEED;
    node.y += (node.targetY - node.y) * ANIMATION_SPEED;
    if (Math.abs(node.x - node.targetX) < 0.5) {
        node.x = node.targetX;
    } 

    if (Math.abs(node.y - node.targetY) < 0.5) {
        node.y = node.targetY;
    } 

    updateAnimation(node.left);
    updateAnimation(node.right);
}

function drawConnections(node) {
    if (!node) return;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    if (node.left) {
        ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(node.left.x, node.left.y); ctx.stroke();
        drawConnections(node.left);
    }
    if (node.right) {
        ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(node.right.x, node.right.y); ctx.stroke();
        drawConnections(node.right);
    }
}

function drawNodes(node) {
    if (!node) return;
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

    if (node === tree.root) {
        ctx.fillStyle = '#ffd700';
    } 
    else {
        ctx.fillStyle = '#ffffff';
    }

    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);
    drawNodes(node.left);
    drawNodes(node.right);
}

function updateTreeVisuals() {
    calculatePositions();
}

function insertNode() {
    const val = parseInt(document.getElementById('inputValue').value);

    if (isNaN(val)) return;

    tree.insert(val);
    document.getElementById('inputValue').value = '';
    updateTreeVisuals();
}

function searchNode() {
    const val = parseInt(document.getElementById('inputValue').value);
    
    if (isNaN(val)) return;
    
    tree.search(val);
    updateTreeVisuals();
}

function deleteNode() {
    const val = parseInt(document.getElementById('inputValue').value);

    if (isNaN(val)) return;
    
    tree.delete(val);
    updateTreeVisuals();
}

function resetTree() {
    tree.root = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMessage("Tree di-reset.");
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
    updateTreeVisuals();
});