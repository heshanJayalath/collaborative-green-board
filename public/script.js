let canvas = document.getElementById('canvas');
canvas.width = 0.99 * window.innerWidth;
canvas.height = window.innerHeight;

var io = io.connect("http://localhost:8080/")

let ctx = canvas.getContext('2d');
ctx.fillStyle = '#117150';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let x;
let y;
let mouseDown = false;
let drawingColor = 'white'; // Initial color

let colorPicker = document.getElementById('colorPicker');
ctx.strokeStyle = drawingColor; // Set the initial pencil color


// Handle color changes
colorPicker.addEventListener('input', function () {
    drawingColor = this.value;
    ctx.strokeStyle = drawingColor;
});

let paths = []; // Array to store drawn paths

window.onmousedown = (e) => {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x, y);
    io.emit('down', { x, y })
    mouseDown = true;
}

window.onmouseup = (e) => {
    mouseDown = false;
    paths.push({ color: drawingColor, path: ctx.getImageData(0, 0, canvas.width, canvas.height) });
}

io.on("ondraw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
})

io.on("ondown", ({ x, y }) => {
    ctx.moveTo(x, y)
})

window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if (mouseDown) {
        io.emit('draw', { x, y })
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

// Function to redraw all paths with their respective colors
function redrawPaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#117150';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < paths.length; i++) {
        ctx.putImageData(paths[i].path, 0, 0);
        ctx.strokeStyle = paths[i].color;
        ctx.stroke();
    }
}

// Function to clear the canvas and paths
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#117150';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paths = [];
}

// Example: Add button event listeners for testing
document.getElementById('clearButton').addEventListener('click', clearCanvas);
document.getElementById('redoButton').addEventListener('click', redrawPaths);