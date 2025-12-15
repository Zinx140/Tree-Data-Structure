let splay_tree = [];

class Node {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

let root = null;

const canvas = document.getElementById('canvas');

canvas.width = window.innerWidth;
canvas.height = 560;

const drawingPanel = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;
const insertBox = document.getElementById('insert');
const searchBox = document.getElementById('search');
const deleteBox = document.getElementById('delete');

function drawTree(index = 0) {
    if (index >= splay_tree.length || splay_tree[index] == null) return;

    const canvasWidth = width;
    const levelHeight = 100;    
    const topMargin = 80;
    const RADIUS = 20;

    const depth = Math.floor(Math.log2(index + 1));
    const levelStartIndex = Math.pow(2, depth) - 1;
    const positionIndex = index - levelStartIndex;
    const nodesAtLevel = Math.pow(2, depth);
    const gapX = canvasWidth / (nodesAtLevel + 1);

    const posX = gapX * (positionIndex + 1);
    const posY = topMargin + depth * levelHeight;

    const parentIndex = Math.floor((index - 1) / 2);
    if (index > 0 && parentIndex >= 0) {

        const parentDepth = Math.floor(Math.log2(parentIndex + 1));
        const parentStartIndex = Math.pow(2, parentDepth) - 1;
        const parentPosIndex = parentIndex - parentStartIndex;
        const parentNodesAtLevel = Math.pow(2, parentDepth);
        const parentGapX = canvasWidth / (parentNodesAtLevel + 1);

        const parentX = parentGapX * (parentPosIndex + 1);
        const parentY = topMargin + parentDepth * levelHeight;

        const dx = posX - parentX;
        const dy = posY - parentY;
        const angle = Math.atan2(dy, dx);

        const startX = parentX + Math.cos(angle) * RADIUS;
        const startY = parentY + Math.sin(angle) * RADIUS;

        const endX = posX - Math.cos(angle) * RADIUS;
        const endY = posY - Math.sin(angle) * RADIUS;

        drawingPanel.beginPath();
        drawingPanel.moveTo(startX, startY);
        drawingPanel.lineTo(endX, endY);
        drawingPanel.stroke();
    }

    if (splay_tree[index] == null) return;

    drawingPanel.beginPath();
    drawingPanel.fillStyle = "#FF0000";
    drawingPanel.strokeStyle = "#000000";
    drawingPanel.arc(posX, posY, RADIUS, 0, Math.PI * 2);
    drawingPanel.fill();
    drawingPanel.stroke();

    drawingPanel.fillStyle = "white";
    drawingPanel.font = "20px Arial";
    drawingPanel.textAlign = "center";
    drawingPanel.textBaseline = "middle";
    drawingPanel.fillText(splay_tree[index], posX, posY);

    drawTree(2 * index + 1);
    drawTree(2 * index + 2);
}

function computeRequiredCanvasHeight() {
    if (splay_tree.length === 0) return 300;

    const lastIndex = splay_tree.length - 1;
    const depth = Math.floor(Math.log2(lastIndex + 1));
    
    const topMargin = 80;
    const levelHeight = 100;
    
    return topMargin + depth * levelHeight + 200;
}

function computeRequiredCanvasWidth() {
    if (splay_tree.length === 0) return 500;
    
    let lastIndex = splay_tree.length - 1;
    
    let depth = Math.floor(Math.log2(lastIndex + 1));
    
    let nodesAtLastLevel = Math.pow(2, depth);
    
    let gapX = 80;
    
    let requiredWidth = (nodesAtLastLevel + 1) * gapX;
    
    return Math.max(requiredWidth, window.innerWidth);
}

function prepareCanvas() {
    const newHeight = computeRequiredCanvasHeight();
    
    if (newHeight < 560) return;
    
    canvas.height = newHeight;    
    canvas.width = computeRequiredCanvasWidth();
    
    width = canvas.width;  
    height = canvas.height;
}

function btnAction(action) {
    switch(action) {
        case "insert":
            if (insertBox.value != "") {
                insertValue(parseInt(insertBox.value));
                insertBox.value = "";
            }
        break;
        case "search":
                if (searchBox.value != "") {
                    searchValue(parseInt(searchBox.value));
                    searchBox.value = "";
                }
            break;
        case "delete":
            if (deleteBox.value != "") {
                deleteValue(parseInt(deleteBox.value));
                deleteBox.value = "";
            }
        break;
    }
    
    clearCanvas();
    prepareCanvas();
    drawTree();
}

function clearCanvas() {
    drawingPanel.clearRect(0, 0, canvas.width, canvas.height);
}

function insertValue(value, index = 0) {
    let num = parseInt(value);

    if (splay_tree.length === 0) {
        splay_tree.push(num);
        return;
    }

    while (index > splay_tree.length) {
        splay_tree.push(null);
    }

    if (splay_tree[index] == null) {
        splay_tree[index] = value;
        splay(index);
        return;
    }

    if (splay_tree[index] > num) {
        insertValue(value, 2 * index + 1);
    } else {
        insertValue(value, 2 * index + 2);
    }
}

function search(value, index = 0) {
    if (index >= splay_tree.length || splay_tree[index] == null) {
        let parentIndex = Math.floor((index - 1) / 2);
        console.log("value not found, nearest at:", parentIndex);
        return parentIndex;
    }

    if (splay_tree[index] == value) {
        console.log("value found at:", index);
        return index;
    }

    if (value < splay_tree[index]) {
        return search(value, 2 * index + 1);
    }

    return search(value, 2 * index + 2);
}

function searchValue(value, index = 0) {
    if (index >= splay_tree.length || splay_tree[index] == null) {
        let parentIndex = Math.floor((index - 1) / 2);
        console.log("value not found, nearest at:", parentIndex);
        splay(parentIndex);
        return;
    }

    if (splay_tree[index] == value) {
        console.log("value found at:", index);
        splay(index);
        return;
    }

    if (value < splay_tree[index]) {
        return searchValue(value, 2 * index + 1);
    }

    return searchValue(value, 2 * index + 2);
}

function deleteValue(value, index = 0) {
    if (index >= splay_tree.length || splay_tree[index] == null) {
        console.log("Number not found");
        return;
    }

    current = splay_tree[index];

    if (value < current) {
        deleteValue(value, index * 2 + 1);
        return;
    }

    if (value > current) {
        deleteValue(value, index * 2 + 2);
        return;
    }

    if (current == value) {
    
        let left = index * 2 + 1;
        let right = index * 2 + 2;

        let hasLeft = left < splay_tree.length && splay_tree[left] != null;
        let hasRight = right < splay_tree.length && splay_tree[right] != null;

        // JIKA LEAF
        if (!hasLeft && !hasRight) {
            splay_tree[index] = null;
            return;
        }

        if (hasLeft && !hasRight) {
            splay_tree[index] = splay_tree[left];
            deleteValue(splay_tree[left], left);
            return;
        }

        if (!hasLeft && hasRight) {
            splay_tree[index] = splay_tree[right];
            deleteValue(splay_tree[right], right);
            return;
        }

        let predIndex = findPredecessor(index);
        if (predIndex == null) {
            console.log("Predecessor not found!");
            return;
        }

        let predValue = splay_tree[predIndex];
        splay_tree[index] = predValue;
        deleteValue(predValue, predIndex);
        
    }
}

function findPredecessor(index) {
    let left = index * 2 + 1;
    if (left >= splay_tree.length || splay_tree[left] == null) {
        return null;
    }

    current = left;
    while (true) {
        let right = current * 2 + 2;
        if (right < splay_tree.length && splay_tree[right] != null) {
            current = right;
        } else {
            break;
        }
    }
    return current;
}

function zag(index) {
    if (index == 0) {
        return;
    }

    
}

function splay(index) {

    if (splay_tree[0] == null) return;

    if (index == 0) return; 

    let parent = Math.floor((index - 1) / 2);
    
    
}

drawTree();