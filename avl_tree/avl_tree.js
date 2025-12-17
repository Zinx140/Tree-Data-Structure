// --- KONFIGURASI VISUAL ---
const NODE_RADIUS = 25;
const VERTICAL_SPACING = 70;
const ANIMATION_SPEED = 0.15;
// --- STRUKTUR DATA ---
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;

        // AVL Property
        this.height = 1;

        // Visual
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.visIndex = 0;
    }
}
class AVLTree {
    constructor() {
        this.root = null;
    }

    // ================= UTIL =================
    getHeight(node) {
        if (node === null) {
            return 0;
        } else {
            return node.height;
        }
    }

    updateHeight(node) {
        let leftHeight = this.getHeight(node.left);
        let rightHeight = this.getHeight(node.right);

        if (leftHeight > rightHeight) {
            node.height = leftHeight + 1;
        } else {
            node.height = rightHeight + 1;
        }
    }

    getBalance(node) {
        if (node === null) {
            return 0;
        }
        return this.getHeight(node.left) - this.getHeight(node.right);
    }

    // ================= ROTATION =================
    rightRotate(y) {
        let x = y.left;
        let T2 = x.right;

        x.right = y;
        y.left = T2;

        if (T2 !== null) {
            T2.parent = y;
        }

        x.parent = y.parent;
        y.parent = x;

        if (x.parent === null) {
            this.root = x;
        } else {
            if (x.parent.left === y) {
                x.parent.left = x;
            } else {
                x.parent.right = x;
            }
        }

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    leftRotate(x) {
        let y = x.right;
        let T2 = y.left;

        y.left = x;
        x.right = T2;

        if (T2 !== null) {
            T2.parent = x;
        }

        y.parent = x.parent;
        x.parent = y;

        if (y.parent === null) {
            this.root = y;
        } else {
            if (y.parent.left === x) {
                y.parent.left = y;
            } else {
                y.parent.right = y;
            }
        }

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    // ================= INSERT =================
    insert(value) {
        this.root = this._insert(this.root, value, null);
    }

    _insert(node, value, parent) {
        if (node === null) {
            let newNode = new Node(value);
            newNode.parent = parent;
            return newNode;
        }

        if (value < node.value) {
            node.left = this._insert(node.left, value, node);
        } else if (value > node.value) {
            node.right = this._insert(node.right, value, node);
        } else {
            return node; // nilai duplikat
        }

        this.updateHeight(node);

        let balance = this.getBalance(node);

        // ===== ROTATION CASE =====

        // Left Left
        if (balance > 1 && value < node.left.value) {
            return this.rightRotate(node);
        }

        // Right Right
        if (balance < -1 && value > node.right.value) {
            return this.leftRotate(node);
        }

        // Left Right
        if (balance > 1 && value > node.left.value) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left
        if (balance < -1 && value < node.right.value) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }
    // ================= SEARCH =================
    search(value) {
        let current = this.root;

        while (current !== null) {
            if (value === current.value) {
                return true;
            } else {
                if (value < current.value) {
                    current = current.left;
                } else {
                    current = current.right;
                }
            }
        }
        return false;
    }

    // ================= DELETE =================
    delete(value) {
        this.root = this._delete(this.root, value);
        if (this.root !== null) {
            this.root.parent = null;
        }
    }

    _delete(node, value) {
        if (node === null) {
            return node;
        }

        if (value < node.value) {
            node.left = this._delete(node.left, value);
            if (node.left !== null) {
                node.left.parent = node;
            }
        } 
        else if (value > node.value) {
            node.right = this._delete(node.right, value);
            if (node.right !== null) {
                node.right.parent = node;
            }
        } 
        else {
            // node ditemukan
            if (node.left === null || node.right === null) {
                let temp;

                if (node.left !== null) {
                    temp = node.left;
                } else {
                    temp = node.right;
                }

                return temp;
            } 
            else {
                let successor = node.right;
                while (successor.left !== null) {
                    successor = successor.left;
                }

                node.value = successor.value;
                node.right = this._delete(node.right, successor.value);
            }
        }

        this.updateHeight(node);

        let balance = this.getBalance(node);

        // Left Left
        if (balance > 1 && this.getBalance(node.left) >= 0) {
            return this.rightRotate(node);
        }

        // Left Right
        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Right
        if (balance < -1 && this.getBalance(node.right) <= 0) {
            return this.leftRotate(node);
        }

        // Right Left
        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }
}

// --- VISUALISASI ---
const tree = new AVLTree();
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');
// Layout Logic (Inorder X)
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
function resizeCanvas() {
    if (!tree.root) return;
    let maxX = 0, maxY = 0;
    function findBounds(node) {
        if (!node) return;
        if (node.targetX > maxX) maxX = node.targetX;
        if (node.targetY > maxY) maxY = node.targetY;
        findBounds(node.left);
        findBounds(node.right);
    }
    findBounds(tree.root);
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
// --- ANIMATION LOOP ---
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
    if (Math.abs(node.x - node.targetX) < 0.5) node.x = node.targetX;
    if (Math.abs(node.y - node.targetY) < 0.5) node.y = node.targetY;
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
    if (node === tree.root) ctx.fillStyle = '#ffd700';
    else ctx.fillStyle = '#ffffff';
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
// --- CONTROLS ---
// Di sini kita update secara global
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
    setMessage("Tree Di-Reset.");
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