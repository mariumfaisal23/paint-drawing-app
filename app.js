


const toolsBtn = document.querySelectorAll('.tool'),
    canvas = document.querySelector('canvas'),
    colorFill = document.querySelector('#fill-color'),
    sizeSlider = document.querySelector('#size-slider'),
    colorBtns = document.querySelectorAll('.color .option'), // Fix: Use querySelectorAll instead of querySelector
    colorPicker = document.querySelector('#color-picker'),
    clearCanvas = document.querySelector('.clear-board'),
    saveCanvas = document.querySelector('.save-board'),
    redoCanvas = document.querySelector('.redo-board'),
    undoCanvas = document.querySelector('.undo-board');

const ctx = canvas.getContext("2d");

let selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "black",
    isDrawing = false,
    prevMouseX,
    prevMouseY,
    snapShot,
    undoStack = [],
    redoStack = [];

const setCanvasBackground = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.style.cursor = "crosshair";
    setCanvasBackground();
})

const drawReact = (e) => {
    if (!colorFill.checked) {
        ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    } else {
        ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
}

const drawCircle = (e) => {
    ctx.beginPath();
    const radius = Math.sqrt(Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    if (colorFill.checked) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    if (colorFill.checked) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

toolsBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector('.options .active').classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    })
})

colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector('.options .selected').classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    })
})

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
})

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapShot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack = [];
}

let zoomLevel = 1;
const container = canvas.parentElement;

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapShot, 0, 0);
    if (selectedTool === "brush" || selectedTool === "eraser") {
        canvas.style.cursor = "crosshair";
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawReact(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "zoomin") {
        canvas.style.cursor = "zoom-in";
        zoomLevel += 0.02;
        canvas.style.transform = `scale(${zoomLevel})`;
    } else if (selectedTool === "zoomout") {
        canvas.style.cursor = "zoom-out";
        zoomLevel -= 0.02;
        canvas.style.transform = `scale(${zoomLevel})`;
        if (zoomLevel <= 1) {
            canvas.style.transform = `scale(1)`;
            container.style.overflow = "hidden";
        }
    } else {
        drawTriangle(e);
    }
}

const saveSnapshot = () => {
    redoStack = [];
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

undoCanvas.onclick = () => {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const prevImageData = undoStack[undoStack.length - 1];
        ctx.putImageData(prevImageData, 0, 0);
    }
}

redoCanvas.onclick = () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        const nextImageData = undoStack[undoStack.length - 1];
        ctx.putImageData(nextImageData, 0, 0);
    }
}

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    saveSnapshot();
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

clearCanvas.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
}

saveCanvas.onclick = () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));



