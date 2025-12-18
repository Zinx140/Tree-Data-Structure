// --- KONFIGURASI VISUAL ---
const NODE_RADIUS = 25;
const VERTICAL_SPACING = 70;
const ANIMATION_SPEED = 0.15;

// --- STRUKTUR DATA ---
class Node {
  constructor(value) {
    this.value = value;
    this.priority = Math.floor(Math.random() * 100) + 1; // Random priority 1-100
    this.left = null;
    this.right = null;
    this.parent = null;

    // Visual Properties
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.visIndex = 0;
  }
}

class TreapTree {
  constructor() {
    this.root = null;
  }

  // ================= ROTASI =================
  rightRotate(y) {
    let x = y.left;
    let T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update parents
    if (T2) {
      T2.parent = y;
    }

    x.parent = y.parent;
    y.parent = x;

    // Update root or parent's child
    if (x.parent === null) {
      this.root = x;
    } else if (x.parent.left === y) {
      x.parent.left = x;
    } else {
      x.parent.right = x;
    }

    return x;
  }

  leftRotate(x) {
    let y = x.right;
    let T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update parents
    if (T2) {
      T2.parent = x;
    }

    y.parent = x.parent;
    x.parent = y;

    // Update root or parent's child
    if (y.parent === null) {
      this.root = y;
    } else if (y.parent.left === x) {
      y.parent.left = y;
    } else {
      y.parent.right = y;
    }

    return y;
  }

  // ================= INSERT =================
  insert(value) {
    if (!this.root) {
      this.root = new Node(value);
      this.root.x = container.clientWidth / 2;
      this.root.y = 50;
      setMessage(`Insert ${value} Dengan Priority ${this.root.priority}.`);
      return;
    }

    let newNode = new Node(value);
    setMessage(
      `Insert ${value} (Priority: ${newNode.priority}) - BST Insert + Heap Rebalance.`
    );
    this.root = this._insert(this.root, newNode, null);
  }

  _insert(node, newNode, parent) {
    // BST Insert
    if (node === null) {
      newNode.parent = parent;
      if (parent) {
        newNode.x = parent.x;
        newNode.y = parent.y;
      }
      return newNode;
    }

    if (newNode.value < node.value) {
      node.left = this._insert(node.left, newNode, node);
    } else if (newNode.value > node.value) {
      node.right = this._insert(node.right, newNode, node);
    } else {
      // Duplicate value
      setMessage(`Nilai ${newNode.value} Sudah Ada.`);
      return node;
    }

    // Maintain heap property (max-heap based on priority)
    if (node.left && node.left.priority > node.priority) {
      return this.rightRotate(node);
    }

    if (node.right && node.right.priority > node.priority) {
      return this.leftRotate(node);
    }

    return node;
  }

  // ================= SEARCH =================
  search(value) {
    let current = this.root;

    while (current !== null) {
      if (value === current.value) {
        setMessage(`Ditemukan ${value} Dengan Priority ${current.priority}.`);
        return true;
      }

      if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    setMessage(`${value} Tidak Ditemukan Di Treap.`);
    return false;
  }

  // ================= DELETE =================
  delete(value) {
    setMessage(`Menghapus ${value}...`);
    this.root = this._delete(this.root, value);
  }

  _delete(node, value) {
    if (node === null) {
      setMessage(`${value} Tidak Ditemukan.`);
      return null;
    }

    if (value < node.value) {
      node.left = this._delete(node.left, value);
      if (node.left) {
        node.left.parent = node;
      }
    } else if (value > node.value) {
      node.right = this._delete(node.right, value);
      if (node.right) {
        node.right.parent = node;
      }
    } else {
      // Node found, perform deletion
      if (node.left === null && node.right === null) {
        // Leaf node
        return null;
      } else if (node.left === null) {
        // Only right child
        if (node.right) {
          node.right.parent = node.parent;
        }
        return node.right;
      } else if (node.right === null) {
        // Only left child
        if (node.left) {
          node.left.parent = node.parent;
        }
        return node.left;
      } else {
        // Both children exist
        // Rotate the child with higher priority up
        if (node.left.priority > node.right.priority) {
          node = this.rightRotate(node);
          node.right = this._delete(node.right, value);
          if (node.right) {
            node.right.parent = node;
          }
        } else {
          node = this.leftRotate(node);
          node.left = this._delete(node.left, value);
          if (node.left) {
            node.left.parent = node;
          }
        }
      }
    }

    return node;
  }
}

// --- VISUALISASI ---
const tree = new TreapTree();
const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("canvasContainer");

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

  node.targetX = node.visIndex * spacing + spacing;
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
    if (offset > 0) {
      shiftTreeX(tree.root, offset);
    }
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

  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;

  if (node.left) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.left.x, node.left.y);
    ctx.stroke();
    drawConnections(node.left);
  }

  if (node.right) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.right.x, node.right.y);
    ctx.stroke();
    drawConnections(node.right);
  }
}

function drawNodes(node) {
  if (!node) return;

  // Draw circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

  if (node === tree.root) {
    ctx.fillStyle = "#ffd700"; // Gold for root
  } else {
    ctx.fillStyle = "#ffffff";
  }

  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw value
  ctx.fillStyle = "#000";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.value, node.x, node.y - 2);

  // Draw priority (smaller, below value)
  ctx.font = "10px Arial";
  ctx.fillStyle = "#666";
  ctx.fillText(`(${node.priority})`, node.x, node.y + 10);

  drawNodes(node.left);
  drawNodes(node.right);
}

// --- CONTROLS ---
function updateTreeVisuals() {
  calculatePositions();
}

function insertNode() {
  const val = parseInt(document.getElementById("inputValue").value);

  if (isNaN(val)) return;

  tree.insert(val);
  document.getElementById("inputValue").value = "";
  updateTreeVisuals();
}

function searchNode() {
  const val = parseInt(document.getElementById("inputValue").value);

  if (isNaN(val)) return;

  tree.search(val);
  updateTreeVisuals();
}

function deleteNode() {
  const val = parseInt(document.getElementById("inputValue").value);

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
  document.getElementById("message").innerText = msg;
}

// Init
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;
draw();

window.addEventListener("resize", () => {
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  updateTreeVisuals();
});
