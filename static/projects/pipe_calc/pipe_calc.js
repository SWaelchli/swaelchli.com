// File: eng-tools/pipe_calc/pipe_calc.js


const drawingCanvas = document.getElementById('drawingCanvas');
const ctx = drawingCanvas.getContext('2d');
const drawPipeModeBtn = document.getElementById('drawPipeModeBtn');
const drawSymbolModeBtn = document.getElementById('drawSymbolModeBtn');
const deleteSymbolModeBtn = document.getElementById('deleteSymbolModeBtn');
const symbolControls = document.getElementById('symbolControls');
const symbolShapeRadios = document.querySelectorAll('input[name="symbolShape"]');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const calculateAllBtn = document.getElementById('calculateAllBtn');
const saveBtn = document.getElementById('saveBtn'); // New save button
const loadBtn = document.getElementById('loadBtn'); // New load button
const fileInput = document.getElementById('fileInput'); // Hidden file input
const pipeSectionsTableBody = document.getElementById('pipeSectionsTableBody');
const globalErrorMessageDiv = document.getElementById('globalErrorMessage');

let pipes = []; // Stores drawn pipe objects
let symbols = []; // Stores drawn symbol objects
let currentDrawingObject = null; // Stores the start point/state of a new object being drawn
let nextPipeId = 1; // Unique ID for each pipe section

let currentMode = 'pipe'; // 'pipe', 'symbol', or 'deleteSymbol'
let currentSymbolShape = 'line'; // Default symbol shape

let minCalculatedVelocity = Infinity;
let maxCalculatedVelocity = -Infinity;

const SNAP_TOLERANCE_SQ = 225; // Squared distance for 15px snap tolerance (15*15)
const ENDPOINT_SNAP_TOLERANCE_SQ = 100; // Squared distance for 10px endpoint snap (10*10)
const CENTER_HANDLE_RADIUS = 7; // Radius for the center move handle
const CENTER_HANDLE_RADIUS_SQ = CENTER_HANDLE_RADIUS * CENTER_HANDLE_RADIUS;

// Pipe data as previously defined
const pipeData = {
    // NPS 1/2"
    '0.5': {
        'Sch. 5S': 0.710, 'Sch. 10S': 0.674, 'Sch. 40': 0.622, 'Sch. 80': 0.546,
        'Sch. 160': 0.466, 'Sch. XXS': 0.252
    },
    // NPS 3/4"
    '0.75': {
        'Sch. 5S': 0.920, 'Sch. 10S': 0.884, 'Sch. 40': 0.824, 'Sch. 80': 0.742,
        'Sch. 160': 0.612, 'Sch. XXS': 0.434
    },
    // NPS 1"
    '1': {
        'Sch. 5S': 1.185, 'Sch. 10S': 1.097, 'Sch. 40': 1.049, 'Sch. 80': 0.957,
        'Sch. 160': 0.815, 'Sch. XXS': 0.599
    },
    // NPS 1 1/4"
    '1.25': {
        'Sch. 5S': 1.530, 'Sch. 10S': 1.442, 'Sch. 40': 1.380, 'Sch. 80': 1.278,
        'Sch. 160': 1.160, 'Sch. XXS': 0.896
    },
    // NPS 1 1/2"
    '1.5': {
        'Sch. 5S': 1.770, 'Sch. 10S': 1.682, 'Sch. 40': 1.610, 'Sch. 80': 1.500,
        'Sch. 160': 1.338, 'Sch. XXS': 1.100
    },
    // NPS 2"
    '2': {
        'Sch. 5S': 2.245, 'Sch. 10S': 2.157, 'Sch. 40': 2.067, 'Sch. 80': 1.939,
        'Sch. 160': 1.687, 'Sch. XXS': 1.503
    },
    // NPS 2 1/2"
    '2.5': {
        'Sch. 5S': 2.709, 'Sch. 10S': 2.635, 'Sch. 40': 2.469, 'Sch. 80': 2.323,
        'Sch. 160': 2.125, 'Sch. XXS': 1.771
    },
    // NPS 3"
    '3': {
        'Sch. 5S': 3.334, 'Sch. 10S': 3.260, 'Sch. 40': 3.068, 'Sch. 80': 2.900,
        'Sch. 160': 2.624, 'Sch. XXS': 2.300
    },
    // NPS 3 1/2"
    '3.5': {
        'Sch. 5S': 3.834, 'Sch. 10S': 3.760, 'Sch. 40': 3.548, 'Sch. 80': 3.364
    },
    '4': {
        'Sch. 5S': 4.334, 'Sch. 10S': 4.260, 'Sch. 40': 4.026, 'Sch. 80': 3.826,
        'Sch. 120': 3.624, 'Sch. 160': 3.438, 'Sch. XXS': 3.152
    },
    '5': {
        'Sch. 5S': 5.345, 'Sch. 10S': 5.295, 'Sch. 40': 5.047, 'Sch. 80': 4.813,
        'Sch. 120': 4.563, 'Sch. 160': 4.313, 'Sch. XXS': 4.063
    },
    '6': {
        'Sch. 5S': 6.407, 'Sch. 10S': 6.357, 'Sch. 40': 6.065, 'Sch. 80': 5.761,
        'Sch. 120': 5.501, 'Sch. 160': 5.189, 'Sch. XXS': 4.897
    },
    '8': {
        'Sch. 5S': 8.493, 'Sch. 10S': 8.357, 'Sch. 20': 8.249, 'Sch. 30': 8.125,
        'Sch. 40': 7.981, 'Sch. 60': 7.857, 'Sch. 80': 7.625, 'Sch. 100': 7.375,
        'Sch. 120': 7.125, 'Sch. 140': 6.875, 'Sch. 160': 6.625, 'Sch. XXS': 6.065
    },
    '10': {
        'Sch. 5S': 10.595, 'Sch. 10S': 10.420, 'Sch. 20': 10.250, 'Sch. 30': 10.080,
        'Sch. 40': 10.020, 'Sch. 60': 9.812, 'Sch. 80': 9.562, 'Sch. 100': 9.312,
        'Sch. 120': 9.000, 'Sch. 140': 8.688, 'Sch. 160': 8.375, 'Sch. XXS': 7.981
    },
    '12': {
        'Sch. 5S': 12.652, 'Sch. 10S': 12.378, 'Sch. 20': 12.250, 'Sch. 30': 12.125,
        'Sch. 40': 11.938, 'Sch. 60': 11.626, 'Sch. 80': 11.378, 'Sch. 100': 11.000,
        'Sch. 120': 10.626, 'Sch. 140': 10.250, 'Sch. 160': 9.876, 'Sch. XXS': 9.500
    }
};

// Sorted list of NPS for the dropdown (convert decimal keys to display strings)
const npsSizes = Object.keys(pipeData).sort((a, b) => parseFloat(a) - parseFloat(b)).map(nps => {
    const num = parseFloat(nps);
    if (num === 0.5) return "1/2";
    if (num === 0.75) return "3/4";
    if (num === 1.25) return "1 1/4";
    if (num === 1.5) return "1 1/2";
    if (num === 2.5) return "2 1/2";
    if (num === 3.5) return "3 1/2";
    return nps; // For whole numbers
});

// Conversion factors
const CONVERSIONS = {
    GPM_TO_CUBIC_FT_PER_SEC: 0.002228, // 1 GPM = 0.002228 cubic feet per second
    M3_HR_TO_CUBIC_FT_PER_SEC: 0.0098086, // 1 m³/hr = 0.0098086 cubic feet per second
    INCH_TO_FEET: 1 / 12, // 1 inch = 1/12 feet
    FEET_TO_METERS: 0.3048 // 1 foot = 0.3048 meters
};

/**
 * Sets up the canvas size to be responsive.
 */
function setupCanvas() {
    const rect = drawingCanvas.getBoundingClientRect();
    drawingCanvas.width = rect.width;
    drawingCanvas.height = rect.height;
    redrawCanvas();
}

/**
 * Helper to calculate squared distance between two points.
 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 * @returns {number} Squared distance.
 */
function distSq(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

/**
 * Calculates the squared distance from a point (px, py) to a line segment (x1, y1)-(x2, y2).
 * Also returns the closest point on the segment.
 * @param {number} px - Point X.
                 * @param {number} py - Point Y.
                 * @param {number} x1 - Segment start X.
                 * @param {number} y1 - Segment start Y.
                 * @param {number} x2 - Segment end X.
                 * @param {number} y2 - Segment end Y.
                 * @returns {{dist: number, point: {x: number, y: number}}} Squared distance and closest point.
 */
function sqDistanceToSegment(px, py, x1, y1, x2, y2) {
    const l2 = distSq(x1, y1, x2, y2);
    if (l2 === 0) { // Segment is a point
        return { dist: distSq(px, py, x1, y1), point: { x: x1, y: y1 } };
    }

    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]

    const nearestX = x1 + t * (x2 - x1);
    const nearestY = y1 + t * (y2 - y1);

    return {
        dist: distSq(px, py, nearestX, nearestY),
        point: { x: nearestX, y: nearestY }
    };
}

/**
 * Interpolates between green and red based on normalized value.
 * Value 0 = green, Value 1 = red.
 * @param {number} value - Normalized value between 0 and 1.
                 * @returns {string} Hex color string.
 */
function getGreenToRed(value) {
    value = Math.max(0, Math.min(1, value)); // Clamping value
    const r = Math.floor(255 * value);
    const g = Math.floor(255 * (1 - value));
    const b = 0;
    return `rgb(${r},${g},${b})`;
}

/**
 * Gets the color for a pipe based on its velocity.
 * @param {number} velocity - The velocity of the pipe.
                 * @returns {string} Hex color string.
 */
function getVelocityColor(velocity) {
    // If there's no valid range (e.g., no pipes with valid velocity, or all pipes have same velocity)
    if (minCalculatedVelocity === Infinity || maxCalculatedVelocity === -Infinity || maxCalculatedVelocity === minCalculatedVelocity) {
        return '#6366f1'; // Default blue
    }
    const normalizedVelocity = (velocity - minCalculatedVelocity) / (maxCalculatedVelocity - minCalculatedVelocity);
    return getGreenToRed(normalizedVelocity);
}

/**
 * Redraws all pipes and symbols on the canvas.
 */
function redrawCanvas() {
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Draw pipes
    pipes.forEach(pipe => {
        let pipeColor;
        if (pipe.highlighted) {
            pipeColor = '#10b981'; // Highlight color (green)
        } else if (typeof pipe.velocityFtS === 'number' && !isNaN(pipe.velocityFtS)) {
            pipeColor = getVelocityColor(pipe.velocityFtS);
        } else {
            pipeColor = '#6366f1'; // Default blue
        }
        drawPipe(pipe.startX, pipe.startY, pipe.endX, pipe.endY, pipe.id, pipeColor);

        // Draw endpoint circles if hovering and not actively resizing that pipe
        if (currentMode === 'pipe' && !currentDrawingObject) { // Only show circles in pipe mode when not drawing/resizing
            const mousePos = window.lastMouseMovePos; // Use last known mouse position
            if (mousePos) {
                if (distSq(mousePos.x, mousePos.y, pipe.startX, pipe.startY) < ENDPOINT_SNAP_TOLERANCE_SQ) {
                    drawCircle(pipe.startX, pipe.startY, 5, 'rgba(0, 0, 255, 0.7)'); // Blue highlight
                } else if (distSq(mousePos.x, mousePos.y, pipe.endX, pipe.endY) < ENDPOINT_SNAP_TOLERANCE_SQ) {
                    drawCircle(pipe.endX, pipe.endY, 5, 'rgba(0, 0, 255, 0.7)'); // Blue highlight
                }
            }
        }
    });

    // Draw symbols
    symbols.forEach(symbol => {
        drawSymbol(symbol);
        // Draw symbol handles if in symbol mode and not currently drawing
        if (currentMode === 'symbol' && !currentDrawingObject) {
            const mousePos = window.lastMouseMovePos;
            if (mousePos && isMouseNearSymbolHandles(mousePos, symbol, ENDPOINT_SNAP_TOLERANCE_SQ)) {
                drawSymbolHandles(symbol);
            }
        }
    });

    // If currently drawing, show the temporary object
    if (currentDrawingObject) {
        if (currentDrawingObject.type === 'newPipe' || currentDrawingObject.type === 'resizingPipe') {
            // This logic is already handled in the shared drawPipe function,
            // currentDrawingObject.type 'resizingPipe' updates the actual pipe object
            // while 'newPipe' uses currentDrawingObject.x,y and currentDrawingObject.currentX,currentY.
            // The temporary line is drawn directly here.
            ctx.beginPath();
            ctx.moveTo(currentDrawingObject.x, currentDrawingObject.y);
            
            let targetX = currentDrawingObject.currentX;
            let targetY = currentDrawingObject.currentY;

            // Apply orthogonal snapping for the preview
            const dx = targetX - currentDrawingObject.x;
            const dy = targetY - currentDrawingObject.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                targetY = currentDrawingObject.y;
            } else {
                targetX = currentDrawingObject.x;
            }

            // If resizing, the fixed point is different
            if (currentDrawingObject.type === 'resizingPipe') {
                ctx.moveTo(currentDrawingObject.fixedX, currentDrawingObject.fixedY);
                ctx.lineTo(targetX, targetY);
            } else { // newPipe
                ctx.lineTo(targetX, targetY);
            }
            
            ctx.strokeStyle = '#8b5cf6'; // Purple for drawing
            ctx.lineWidth = 3;
            ctx.stroke();

        } else if (currentMode === 'symbol') {
            const { type, x, y, currentX, currentY } = currentDrawingObject;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(0,0,0,0.1)';

            switch (type) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                    break;
                case 'circle':
                    drawTempCircle(x, y, currentX, currentY);
                    break;
                case 'triangle':
                    drawTempTriangle(x, y, currentX, currentY);
                    break;
                case 'square':
                case 'rectangle':
                    drawTempRect(x, y, currentX, currentY, type);
                    break;
            }
        }
    }
}

/**
 * Draws a simple circle.
 * @param {number} x
                 * @param {number} y
                 * @param {number} radius
                 * @param {string} color
 */
function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
}

/**
 * Draws a single pipe segment on the canvas.
                 * @param {number} x1 - Start X coordinate.
                 * @param {number} y1 - Start Y coordinate.
                 * @param {number} x2 - End X coordinate.
                 * @param {number} y2 - End Y coordinate.
                 * @param {number} id - Pipe ID for text label.
                 * @param {string} color - The color to draw the pipe.
 */
function drawPipe(x1, y1, x2, y2, id, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pipe ID number near the center of the line
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    let textOffsetX = 0;
    let textOffsetY = -10; // Default offset for horizontal pipes

    // Adjust text position for vertical pipes
    if (Math.abs(x1 - x2) < 1) { // Vertical pipe (using a small tolerance for floating point)
        textOffsetX = 15; // Move text to the right
        textOffsetY = 0;
        ctx.textAlign = 'left'; // Align text left to the line
    } else { // Horizontal pipe
        ctx.textAlign = 'center';
    }

    ctx.fillStyle = '#334155'; // Text color remains consistent
    ctx.font = '14px Inter';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, midX + textOffsetX, midY + textOffsetY);
}

/**
 * Draws a generic symbol on the canvas.
                 * @param {object} symbol - The symbol object {type, x, y, endX, endY, radius, ...}
 */
function drawSymbol(symbol) {
    ctx.strokeStyle = 'black'; // Symbols are always black
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Light fill for closed shapes

    switch (symbol.type) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(symbol.x1, symbol.y1);
            ctx.lineTo(symbol.x2, symbol.y2);
            ctx.stroke();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(symbol.centerX, symbol.centerY, symbol.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(symbol.x1, symbol.y1);
            ctx.lineTo(symbol.x2, symbol.y2);
            ctx.lineTo(symbol.x3, symbol.y3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'square':
        case 'rectangle':
            ctx.fillRect(symbol.x, symbol.y, symbol.width, symbol.height);
            ctx.strokeRect(symbol.x, symbol.y, symbol.width, symbol.height);
            break;
    }
}

/**
 * Draws a square or rectangle for preview.
                 * @param {number} x1 - Start X.
                 * @param {number} y1 - Start Y.
                 * @param {number} x2 - Current X.
                 * @param {number} y2 - Current Y.
                 * @param {string} shapeType - 'square' or 'rectangle'.
 */
function drawTempRect(x1, y1, x2, y2, shapeType) {
    let rectX = Math.min(x1, x2);
    let rectY = Math.min(y1, y2);
    let rectW = Math.abs(x2 - x1);
    let rectH = Math.abs(y2 - y1);

    if (shapeType === 'square') {
        const size = Math.max(rectW, rectH);
        rectW = size;
        rectH = size;
    }
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
}

/**
 * Draws a circle for preview.
                 * @param {number} x - Center X.
                 * @param {number} y - Center Y.
                 * @param {number} currentX - Current mouse X.
                 * @param {number} currentY - Current mouse Y.
 */
function drawTempCircle(x, y, currentX, currentY) {
    const radius = Math.sqrt(distSq(x, y, currentX, currentY));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

/**
 * Draws a triangle for preview.
                 * @param {number} x1 - Base start X.
                 * @param {number} y1 - Base start Y.
                 * @param {number} x2 - Base end X.
                 * @param {number} y2 - Base end Y.
 */
function drawTempTriangle(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const baseVectorX = x2 - x1;
    const baseVectorY = y2 - y1;
    const baseLength = Math.sqrt(baseVectorX * baseVectorX + baseVectorY * baseVectorY);

    let x3, y3;
    if (baseLength > 0) {
        // Calculate a perpendicular vector and scale it for height
        const perpVectorX = -baseVectorY;
        const perpVectorY = baseVectorX;
        const height = baseLength * Math.sqrt(3) / 2; // For an equilateral triangle
        x3 = midX + (perpVectorX / baseLength) * height;
        y3 = midY + (perpVectorY / baseLength) * height;
    } else {
        // If base is a point, draw a simple vertical line upwards as height
        x3 = x1;
        y3 = y1 - 50; // Arbitrary height for visual
    }
    
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/**
 * Draws small square handles on a symbol's resize points.
                 * @param {object} symbol - The symbol object.
 */
function drawSymbolHandles(symbol) {
    const handleSize = 5; // Half size of the square handle
    const handleColor = 'rgba(255, 165, 0, 0.8)'; // Orange for handles
    const centerHandleColor = 'rgba(139, 92, 246, 0.8)'; // Purple for center handle

    ctx.fillStyle = handleColor;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;

    let pointsToDrawHandles = [];
    let centerPoint = null;

    switch (symbol.type) {
        case 'line':
            pointsToDrawHandles.push({ x: symbol.x1, y: symbol.y1 });
            pointsToDrawHandles.push({ x: symbol.x2, y: symbol.y2 });
            centerPoint = {x: (symbol.x1 + symbol.x2) / 2, y: (symbol.y1 + symbol.y2) / 2};
            break;
        case 'circle':
            // Use a few points on the circumference to indicate resizability
            pointsToDrawHandles.push({ x: symbol.centerX + symbol.radius, y: symbol.centerY });
            pointsToDrawHandles.push({ x: symbol.centerX - symbol.radius, y: symbol.centerY });
            pointsToDrawHandles.push({ x: symbol.centerX, y: symbol.centerY + symbol.radius });
            pointsToDrawHandles.push({ x: symbol.centerX, y: symbol.centerY - symbol.radius });
            centerPoint = {x: symbol.centerX, y: symbol.centerY};
            break;
        case 'triangle':
            pointsToDrawHandles.push({ x: symbol.x1, y: symbol.y1 });
            pointsToDrawHandles.push({ x: symbol.x2, y: symbol.y2 });
            pointsToDrawHandles.push({ x: symbol.x3, y: symbol.y3 });
            // Geometric center of a triangle
            centerPoint = {
                x: (symbol.x1 + symbol.x2 + symbol.x3) / 3,
                y: (symbol.y1 + symbol.y2 + symbol.y3) / 3
            };
            break;
        case 'square':
        case 'rectangle':
            pointsToDrawHandles.push({ x: symbol.x, y: symbol.y }); // Top-left
            pointsToDrawHandles.push({ x: symbol.x + symbol.width, y: symbol.y }); // Top-right
            pointsToDrawHandles.push({ x: symbol.x, y: symbol.y + symbol.height }); // Bottom-left
            pointsToDrawHandles.push({ x: symbol.x + symbol.width, y: symbol.y + symbol.height }); // Bottom-right
            // Center of rectangle
            centerPoint = {x: symbol.x + symbol.width / 2, y: symbol.y + symbol.height / 2};
            break;
    }

    pointsToDrawHandles.forEach(p => {
        ctx.fillRect(p.x - handleSize, p.y - handleSize, handleSize * 2, handleSize * 2);
        ctx.strokeRect(p.x - handleSize, p.y - handleSize, handleSize * 2, handleSize * 2);
    });

    if (centerPoint) {
        drawCircle(centerPoint.x, centerPoint.y, CENTER_HANDLE_RADIUS, centerHandleColor);
    }
}

/**
 * Checks if the mouse is near any of a symbol's resize handles.
                 * @param {{x: number, y: number}} mousePos
                 * @param {object} symbol
                 * @param {number} toleranceSq - Squared tolerance for detection.
                 * @returns {string|null} Handle type ('start', 'end', 'center', 'bottomRight', 'thirdVertex') or null.
 */
function isMouseNearSymbolHandles(mousePos, symbol, toleranceSq) {
    if (symbol.type === 'line') {
        if (distSq(mousePos.x, mousePos.y, symbol.x1, symbol.y1) < toleranceSq) return 'start';
        if (distSq(mousePos.x, mousePos.y, symbol.x2, symbol.y2) < toleranceSq) return 'end';
        const centerPoint = {x: (symbol.x1 + symbol.x2) / 2, y: (symbol.y1 + symbol.y2) / 2};
        if (distSq(mousePos.x, mousePos.y, centerPoint.x, centerPoint.y) < CENTER_HANDLE_RADIUS_SQ) return 'center';
    } else if (symbol.type === 'circle') {
        if (Math.abs(Math.sqrt(distSq(mousePos.x, mousePos.y, symbol.centerX, symbol.centerY)) - symbol.radius) < Math.sqrt(toleranceSq)) return 'circumference';
        if (distSq(mousePos.x, mousePos.y, symbol.centerX, symbol.centerY) < CENTER_HANDLE_RADIUS_SQ) return 'center';
    } else if (symbol.type === 'triangle') {
        if (distSq(mousePos.x, mousePos.y, symbol.x1, symbol.y1) < toleranceSq) return 'v1';
        if (distSq(mousePos.x, mousePos.y, symbol.x2, symbol.y2) < toleranceSq) return 'v2';
        if (distSq(mousePos.x, mousePos.y, symbol.x3, symbol.y3) < toleranceSq) return 'v3';
        const centerPoint = { x: (symbol.x1 + symbol.x2 + symbol.x3) / 3, y: (symbol.y1 + symbol.y2 + symbol.y3) / 3 };
        if (distSq(mousePos.x, mousePos.y, centerPoint.x, centerPoint.y) < CENTER_HANDLE_RADIUS_SQ) return 'center';
    } else if (symbol.type === 'square' || symbol.type === 'rectangle') {
        if (distSq(mousePos.x, mousePos.y, symbol.x + symbol.width, symbol.y + symbol.height) < toleranceSq) return 'bottomRight';
        if (distSq(mousePos.x, mousePos.y, symbol.x, symbol.y) < toleranceSq) return 'topLeft';
        if (distSq(mousePos.x, mousePos.y, symbol.x + symbol.width, symbol.y) < toleranceSq) return 'topRight';
        if (distSq(mousePos.x, mousePos.y, symbol.x, symbol.y + symbol.height) < toleranceSq) return 'bottomLeft';
        const centerPoint = {x: symbol.x + symbol.width / 2, y: symbol.y + symbol.height / 2};
        if (distSq(mousePos.x, mousePos.y, centerPoint.x, centerPoint.y) < CENTER_HANDLE_RADIUS_SQ) return 'center';
    }
    return null;
}


/**
 * Returns mouse coordinates relative to the canvas.
 * @param {MouseEvent} event - The mouse event.
 * @returns {{x: number, y: number}} - X and Y coordinates.
 */
function getMousePos(event) {
    const rect = drawingCanvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

/**
 * Checks if a point is within a symbol's bounds for selection/deletion.
                 * @param {{x: number, y: number}} point - Mouse coordinates.
                 * @param {object} symbol - The symbol object.
                 * @returns {boolean} True if the point is "on" the symbol.
 */
function isPointOnSymbol(point, symbol) {
    const tolerance = 5; // Click tolerance for symbols

    switch (symbol.type) {
        case 'line':
            return sqDistanceToSegment(point.x, point.y, symbol.x1, symbol.y1, symbol.x2, symbol.y2).dist < tolerance * tolerance;
        case 'circle':
            // Check if point is within circle's area (more forgiving for deletion)
            return distSq(point.x, point.y, symbol.centerX, symbol.centerY) < (symbol.radius + tolerance) * (symbol.radius + tolerance);
        case 'rectangle':
        case 'square':
            // Check if point is within the bounding box
            const minX = Math.min(symbol.x, symbol.x + symbol.width);
            const maxX = Math.max(symbol.x, symbol.x + symbol.width);
            const minY = Math.min(symbol.y, symbol.y + symbol.height);
            const maxY = Math.max(symbol.y, symbol.y + symbol.height);
            return point.x >= minX - tolerance && point.x <= maxX + tolerance &&
                point.y >= minY - tolerance && point.y <= maxY + tolerance;
        case 'triangle':
            // Simple bounding box check for now, can be improved with point-in-polygon
            const triMinX = Math.min(symbol.x1, symbol.x2, symbol.x3);
            const triMaxX = Math.max(symbol.x1, symbol.x2, symbol.x3);
            const triMinY = Math.min(symbol.y1, symbol.y2, symbol.y3);
            const triMaxY = Math.max(symbol.y1, symbol.y2, symbol.y3);
            return point.x >= triMinX - tolerance && point.x <= triMaxX + tolerance &&
                point.y >= triMinY - tolerance && point.y <= triMaxY + tolerance;
    }
    return false;
}


/**
 * Handles mousedown event on the canvas.
 * Checks for snapping to existing pipes or starting a new drawing.
 * @param {MouseEvent} e - The mouse event.
 */
function handleMouseDown(e) {
    e.preventDefault(); // Prevent default browser drag behavior
    if (e.button !== 0) return; // Only respond to left click

    const pos = getMousePos(e);
    window.lastMouseDownPos = pos; // Store for mouseup validation
    
    if (currentMode === 'deleteSymbol') {
        // Check if a symbol is clicked for deletion
        for (let i = symbols.length - 1; i >= 0; i--) {
            if (isPointOnSymbol(pos, symbols[i])) {
                symbols.splice(i, 1); // Remove the symbol
                redrawCanvas();
                return; // Stop after deleting one symbol
            }
        }
    }

    // If not deleting a symbol, proceed with drawing/resizing
    let startX = pos.x;
    let startY = pos.y;
    let snappedPipe = null;
    let snapPoint = null;
    let minDistSq = SNAP_TOLERANCE_SQ; // for snapping to line segments
    let snappedEndpoint = null; // { pipe: pipeObj, end: 'start' | 'end' }
    let clickedSymbolForResizeOrMove = null; // { symbol: symbolObj, handleType: 'start'|'end'|'center'|'bottomRight'|'thirdVertex' }

    if (currentMode === 'pipe') {
        // Check for snapping to existing pipe endpoints for resizing
        pipes.forEach(pipe => {
            if (distSq(pos.x, pos.y, pipe.startX, pipe.startY) < ENDPOINT_SNAP_TOLERANCE_SQ) {
                snappedEndpoint = { pipe: pipe, end: 'start' };
                startX = pipe.startX; // Snap to the endpoint
                startY = pipe.startY;
            } else if (distSq(pos.x, pos.y, pipe.endX, pipe.endY) < ENDPOINT_SNAP_TOLERANCE_SQ) {
                snappedEndpoint = { pipe: pipe, end: 'end' };
                startX = pipe.endX; // Snap to the endpoint
                startY = pipe.endY;
            }
        });

        if (snappedEndpoint) {
            currentDrawingObject = {
                type: 'resizingPipe',
                pipe: snappedEndpoint.pipe,
                fixedX: snappedEndpoint.end === 'start' ? snappedEndpoint.pipe.endX : snappedEndpoint.pipe.startX,
                fixedY: snappedEndpoint.end === 'start' ? snappedEndpoint.pipe.endY : snappedEndpoint.pipe.startY,
                movingEnd: snappedEndpoint.end,
                x: startX, // This is the moving point
                y: startY,
                currentX: pos.x,
                currentY: pos.y
            };
        } else {
            // Check for snapping to existing pipe line segments for new pipe creation
            pipes.forEach(pipe => {
                const { dist, point } = sqDistanceToSegment(pos.x, pos.y, pipe.startX, pipe.startY, pipe.endX, pipe.endY);
                if (dist < minDistSq) {
                    minDistSq = dist;
                    startX = point.x;
                    startY = point.y;
                    snappedPipe = pipe;
                    snapPoint = point;
                }
            });

            currentDrawingObject = {
                type: 'newPipe',
                x: startX,
                y: startY,
                currentX: pos.x,
                currentY: pos.y,
                snappedPipeId: snappedPipe ? snappedPipe.id : null,
                snapPoint: snapPoint // Store the exact snap point
            };
        }
    } else if (currentMode === 'symbol') {
        // Check if an existing symbol is clicked for resizing or moving
        const tolerance = Math.sqrt(ENDPOINT_SNAP_TOLERANCE_SQ); // Use the same tolerance for handles
        for(let i = symbols.length - 1; i >= 0; i--) {
            const sym = symbols[i];
            const handle = isMouseNearSymbolHandles(pos, sym, ENDPOINT_SNAP_TOLERANCE_SQ);
            if (handle) {
                clickedSymbolForResizeOrMove = { symbol: sym, handleType: handle }; break;
            }
        }

        if (clickedSymbolForResizeOrMove) {
            currentDrawingObject = {
                type: clickedSymbolForResizeOrMove.handleType === 'center' ? 'movingSymbol' : 'resizingSymbol',
                symbol: clickedSymbolForResizeOrMove.symbol,
                handleType: clickedSymbolForResizeOrMove.handleType,
                initialX: pos.x, // Store initial mouse pos for calculating delta
                initialY: pos.y,
                currentX: pos.x,
                currentY: pos.y
            };
        } else {
            currentDrawingObject = {
                type: currentSymbolShape,
                x: pos.x,
                y: pos.y,
                currentX: pos.x,
                currentY: pos.y
            };
        }
    }
    drawingCanvas.addEventListener('mousemove', handleMouseMove);
}

/**
 * Handles mousemove event on the canvas.
 * Updates the temporary drawing object.
                 * @param {MouseEvent} e - The mouse event.
 */
function handleMouseMove(e) {
    if (!currentDrawingObject) return;

    const pos = getMousePos(e);
    window.lastMouseMovePos = pos; // Update global mouse position for endpoint indicators
    currentDrawingObject.currentX = pos.x;
    currentDrawingObject.currentY = pos.y;

    if (currentDrawingObject.type === 'resizingPipe') {
        const pipe = currentDrawingObject.pipe;
        let newX = currentDrawingObject.currentX;
        let newY = currentDrawingObject.currentY;

        // Apply orthogonal snapping for resizing relative to the fixed end
        const fixedX = currentDrawingObject.fixedX;
        const fixedY = currentDrawingObject.fixedY;

        const dx = newX - fixedX;
        const dy = newY - fixedY;

        if (Math.abs(dx) > Math.abs(dy)) {
            newY = fixedY;
        } else {
            newX = fixedX;
        }

        if (currentDrawingObject.movingEnd === 'start') {
            pipe.startX = newX;
            pipe.startY = newY;
        } else {
            pipe.endX = newX;
            pipe.endY = newY;
        }
    } else if (currentDrawingObject.type === 'resizingSymbol') {
        const sym = currentDrawingObject.symbol;
        const { handleType, initialX, initialY, currentX, currentY } = currentDrawingObject;
        const deltaX = currentX - initialX;
        const deltaY = currentY - initialY;


        if (sym.type === 'line') {
            if (handleType === 'start') {
                sym.x1 = currentX; sym.y1 = currentY;
            } else { // handleType === 'end'
                sym.x2 = currentX; sym.y2 = currentY;
            }
        } else if (sym.type === 'circle') {
            // Recalculate radius from center to current mouse position
            sym.radius = Math.sqrt(distSq(sym.centerX, sym.centerY, currentX, currentY));
        } else if (sym.type === 'rectangle' || sym.type === 'square') {
            // Resizing from bottom-right corner, need to preserve top-left
            // Original x, y of symbol are top-left
            sym.width = currentX - sym.x;
            sym.height = currentY - sym.y;

            if (sym.type === 'square') {
                const size = Math.max(Math.abs(sym.width), Math.abs(sym.height));
                sym.width = sym.width > 0 ? size : -size;
                sym.height = sym.height > 0 ? size : -size;
            }
        } else if (sym.type === 'triangle') {
            // Only resizing the third vertex
            if (handleType === 'v1') { sym.x1 = currentX; sym.y1 = currentY; }
            else if (handleType === 'v2') { sym.x2 = currentX; sym.y2 = currentY; }
            else if (handleType === 'v3') { sym.x3 = currentX; sym.y3 = currentY; }
        }
    } else if (currentDrawingObject.type === 'movingSymbol') {
        const sym = currentDrawingObject.symbol;
        const deltaX = currentDrawingObject.currentX - currentDrawingObject.initialX;
        const deltaY = currentDrawingObject.currentY - currentDrawingObject.initialY;

        // Update symbol's position based on delta
        if (sym.type === 'line') {
            sym.x1 += deltaX; sym.y1 += deltaY;
            sym.x2 += deltaX; sym.y2 += deltaY;
        } else if (sym.type === 'circle') {
            sym.centerX += deltaX; sym.centerY += deltaY;
        } else if (sym.type === 'triangle') {
            sym.x1 += deltaX; sym.y1 += deltaY;
            sym.x2 += deltaX; sym.y2 += deltaY;
            sym.x3 += deltaX; sym.y3 += deltaY;
        } else if (sym.type === 'rectangle' || sym.type === 'square') {
            sym.x += deltaX; sym.y += deltaY;
        }

        // Update initial position for next move event to maintain delta
        currentDrawingObject.initialX = currentDrawingObject.currentX;
        currentDrawingObject.initialY = currentDrawingObject.currentY;
    }
    redrawCanvas();
}

/**
 * Handles mouseup event on the canvas.
 * Finalizes drawing, resizing, or dividing pipes/symbols.
                 * @param {MouseEvent} e - The mouse event.
 */
function handleMouseUp(e) {
    if (!currentDrawingObject) return;

    const endPos = getMousePos(e);
    const minLength = 5; // pixels

    // Check if it was just a click (no drag)
    if (distSq(window.lastMouseDownPos.x, window.lastMouseDownPos.y, endPos.x, endPos.y) < minLength * minLength && currentDrawingObject.type !== 'resizingPipe' && currentDrawingObject.type !== 'resizingSymbol' && currentDrawingObject.type !== 'movingSymbol') {
        currentDrawingObject = null;
        drawingCanvas.removeEventListener('mousemove', handleMouseMove);
        redrawCanvas();
        return; // Treat as accidental click, don't create or resize
    }
    
    if (currentDrawingObject.type === 'resizingPipe') {
        const pipe = currentDrawingObject.pipe;
        let newX = currentDrawingObject.currentX;
        let newY = currentDrawingObject.currentY;

        // Re-apply orthogonal snapping to the final position
        const fixedX = currentDrawingObject.fixedX;
        const fixedY = currentDrawingObject.fixedY;

        const dx = newX - fixedX;
        const dy = newY - fixedY;

        if (Math.abs(dx) > Math.abs(dy)) {
            newY = fixedY;
        } else {
            newX = fixedX;
        }

        if (currentDrawingObject.movingEnd === 'start') {
            pipe.startX = newX;
            pipe.startY = newY;
        } else {
            pipe.endX = newX;
            pipe.endY = newY;
        }

        // If the resized pipe became too short, remove it
        if (distSq(pipe.startX, pipe.startY, pipe.endX, pipe.endY) < minLength * minLength) {
            removePipeAndRow(pipe.id);
        } else {
            // Velocity and highlighting states are maintained, just redraw
            redrawCanvas();
        }

    } else if (currentDrawingObject.type === 'newPipe') {
        // Apply orthogonal snapping to the final endpoint of a new pipe
        let finalX = endPos.x;
        let finalY = endPos.y;
        const dx = finalX - currentDrawingObject.x;
        const dy = finalY - currentDrawingObject.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            finalY = currentDrawingObject.y; // Snap to horizontal
        } else {
            finalX = currentDrawingObject.x; // Snap to vertical
        }

        if (distSq(currentDrawingObject.x, currentDrawingObject.y, finalX, finalY) < minLength * minLength) {
            currentDrawingObject = null;
            drawingCanvas.removeEventListener('mousemove', handleMouseMove);
            redrawCanvas();
            return; // Too short, treat as accidental click
        }

        if (currentDrawingObject.snappedPipeId !== null) {
            const originalPipe = pipes.find(p => p.id === currentDrawingObject.snappedPipeId);
            if (originalPipe) {
                const snapPoint = currentDrawingObject.snapPoint;

                const newSegment1 = {
                    id: -1, startX: originalPipe.startX, startY: originalPipe.startY, endX: snapPoint.x, endY: snapPoint.y,
                    velocityFtS: null, highlighted: false,
                    nps: originalPipe.nps, schedule: originalPipe.schedule,
                    volumeFlow: originalPipe.volumeFlow, volumeFlowUnit: originalPipe.volumeFlowUnit,
                    description: originalPipe.description ? originalPipe.description + ' (seg 1)' : ''
                };
                const newSegment2 = {
                    id: -1, startX: snapPoint.x, startY: snapPoint.y, endX: originalPipe.endX, endY: originalPipe.endY,
                    velocityFtS: null, highlighted: false,
                    nps: originalPipe.nps, schedule: originalPipe.schedule,
                    volumeFlow: originalPipe.volumeFlow, volumeFlowUnit: originalPipe.volumeFlowUnit,
                    description: originalPipe.description ? originalPipe.description + ' (seg 2)' : ''
                };

                pipes = pipes.filter(p => p.id !== originalPipe.id);

                if (distSq(newSegment1.startX, newSegment1.startY, newSegment1.endX, newSegment1.endY) >= minLength * minLength) {
                    pipes.push(newSegment1);
                }
                if (distSq(newSegment2.startX, newSegment2.startY, newSegment2.endX, newSegment2.endY) >= minLength * minLength) {
                    pipes.push(newSegment2);
                }
            }
        }

        const newPipe = {
            id: -1, startX: currentDrawingObject.x, startY: currentDrawingObject.y, endX: finalX, endY: finalY,
            velocityFtS: null, highlighted: false,
            nps: npsSizes[0].includes('/') ? (npsSizes[0] === '1/2' ? '0.5' : '0.75') : npsSizes[0],
            schedule: '', volumeFlow: '', volumeFlowUnit: 'gpm', description: ''
        };
        const defaultNPSKey = newPipe.nps;
        const availableSchedules = pipeData[defaultNPSKey] ? Object.keys(pipeData[defaultNPSKey]) : [];
        newPipe.schedule = availableSchedules.includes('Sch. 40') ? 'Sch. 40' : (availableSchedules.length > 0 ? availableSchedules[0] : '');
        
        pipes.push(newPipe);

    } else if (currentDrawingObject.type === 'resizingSymbol') {
        const sym = currentDrawingObject.symbol;
        const { currentX, currentY, handleType } = currentDrawingObject;
        const minSymbolSize = 10; // Minimum size for symbols

        if (sym.type === 'line') {
            // Ensure it's not too small
            if (distSq(sym.x1, sym.y1, sym.x2, sym.y2) < minLength * minLength) {
                symbols = symbols.filter(s => s !== sym);
            }
        } else if (sym.type === 'circle') {
            sym.radius = Math.max(minSymbolSize / 2, Math.sqrt(distSq(sym.centerX, sym.centerY, currentX, currentY)));
        } else if (sym.type === 'rectangle' || sym.type === 'square') {
            // Finalize dimensions, ensuring positive width/height and min size
            sym.width = currentX - sym.x;
            sym.height = currentY - sym.y;
            
            // Handle negative width/height from dragging left/up
            sym.x = sym.width < 0 ? sym.x + sym.width : sym.x;
            sym.y = sym.height < 0 ? sym.y + sym.height : sym.y;
            sym.width = Math.abs(sym.width);
            sym.height = Math.abs(sym.height);

            if (sym.type === 'square') {
                const size = Math.max(sym.width, sym.height);
                sym.width = size;
                sym.height = size;
            }
            
            if (sym.width < minSymbolSize || sym.height < minSymbolSize) {
                symbols = symbols.filter(s => s !== sym);
            }
        } else if (sym.type === 'triangle') {
            // Triangle vertices directly updated in mousemove, now check validity
            const baseLength = Math.sqrt(distSq(sym.x1, sym.y1, sym.x2, sym.y2));
            const side1 = Math.sqrt(distSq(sym.x1, sym.y1, sym.x3, sym.y3));
            const side2 = Math.sqrt(distSq(sym.x2, sym.y2, sym.x3, sym.y3));
            
            if (baseLength < minLength || side1 < minLength || side2 < minLength) {
                symbols = symbols.filter(s => s !== sym);
            }
        }

    } else if (currentDrawingObject.type === 'movingSymbol') {
        // Symbol was moved, state is already updated in mousemove
        // No additional finalization needed for movement beyond updating position
    } else if (currentMode === 'symbol') { // New symbol creation
        const { type, x, y, currentX, currentY } = currentDrawingObject;
        let newSymbol = { type: type };

        if (type === 'line') {
            newSymbol.x1 = x;
            newSymbol.y1 = y;
            newSymbol.x2 = currentX;
            newSymbol.y2 = currentY;
            if (distSq(newSymbol.x1, newSymbol.y1, newSymbol.x2, newSymbol.y2) < minLength * minLength) {
                currentDrawingObject = null;
                drawingCanvas.removeEventListener('mousemove', handleMouseMove);
                redrawCanvas();
                return;
            }
        } else if (type === 'circle') {
            newSymbol.centerX = x;
            newSymbol.centerY = y;
            newSymbol.radius = Math.sqrt(distSq(x, y, currentX, currentY));
            if (newSymbol.radius < minLength) {
                currentDrawingObject = null;
                drawingCanvas.removeEventListener('mousemove', handleMouseMove);
                redrawCanvas();
                return;
            }
        } else if (type === 'triangle') {
            newSymbol.x1 = x;
            newSymbol.y1 = y;
            newSymbol.x2 = currentX;
            newSymbol.y2 = currentY;

            const midX = (x + currentX) / 2;
            const midY = (y + currentY) / 2;
            const baseLength = Math.sqrt(distSq(x, y, currentX, currentY));
            const height = baseLength * Math.sqrt(3) / 2;

            const normalX = -(currentY - y);
            const normalY = (currentX - x);
            const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
            
            if (normalLength > 0) {
                newSymbol.x3 = midX + (normalX / normalLength) * height;
                newSymbol.y3 = midY + (normalY / normalLength) * height;
            } else {
                newSymbol.x3 = x + height;
                newSymbol.y3 = y;
            }

            if (baseLength < minLength) {
                currentDrawingObject = null;
                drawingCanvas.removeEventListener('mousemove', handleMouseMove);
                redrawCanvas();
                return;
            }

        } else if (type === 'square' || type === 'rectangle') {
            // Ensure x, y, width, height are properly min/abs values for storage
            newSymbol.x = Math.min(x, currentX);
            newSymbol.y = Math.min(y, currentY);
            newSymbol.width = Math.abs(currentX - x);
            newSymbol.height = Math.abs(currentY - y);

            if (type === 'square') {
                const size = Math.max(newSymbol.width, newSymbol.height);
                newSymbol.width = size;
                newSymbol.height = size;
            }
            if (newSymbol.width < minLength || newSymbol.height < minLength) {
                currentDrawingObject = null;
                drawingCanvas.removeEventListener('mousemove', handleDrawingObject); // Should be handleMouseMove
                redrawCanvas();
                return;
            }
        }
        symbols.push(newSymbol);
    }

    rebuildTableAndRenumber(); // Rebuild and re-number pipes (doesn't affect symbols)
    redrawCanvas(); // Full redraw to update all changes

    currentDrawingObject = null;
    drawingCanvas.removeEventListener('mousemove', handleMouseMove);
}

/**
 * Clears the global error message.
 */
function clearGlobalMessage(message = '', isError = true) {
    globalErrorMessageDiv.textContent = message;
    if (message) {
        globalErrorMessageDiv.classList.remove('hidden');
        if (isError) {
            globalErrorMessageDiv.style.color = '#ef4444'; // Red for error
        } else {
            globalErrorMessageDiv.style.color = '#10b981'; // Green for success
        }
    } else {
        globalErrorMessageDiv.classList.add('hidden');
    }
}


/**
 * Populates the schedule dropdown based on the selected NPS.
                 * @param {HTMLSelectElement} scheduleSelectElement - The schedule select element.
                 * @param {string} selectedNPSKey - The currently selected NPS value (e.g., "0.5").
                 * @param {string} [currentScheduleValue] - The schedule value to attempt to pre-select.
 */
function populateScheduleDropdown(scheduleSelectElement, selectedNPSKey, currentScheduleValue = null) {
    scheduleSelectElement.innerHTML = ''; // Clear existing options
    const availableSchedules = pipeData[selectedNPSKey] ? Object.keys(pipeData[selectedNPSKey]) : [];

    availableSchedules.forEach(schedule => {
        const option = document.createElement('option');
        option.value = schedule;
        option.textContent = schedule;
        scheduleSelectElement.appendChild(option);
    });

    // Attempt to re-select the current schedule value if it's still valid
    if (currentScheduleValue && availableSchedules.includes(currentScheduleValue)) {
        scheduleSelectElement.value = currentScheduleValue;
    } else if (availableSchedules.includes('Sch. 40')) {
        // Default to Sch. 40 if available and no valid previous value
        scheduleSelectElement.value = 'Sch. 40';
    } else if (availableSchedules.length > 0) {
        // Otherwise, select the first available schedule
        scheduleSelectElement.value = availableSchedules[0];
    } else {
        scheduleSelectElement.value = ''; // No available schedules
    }
}


/**
 * Creates and appends a new pipe section row to the table.
                 * @param {object} pipeObj - The pipe object containing all its properties.
 */
function createTableRowForPipe(pipeObj) {
    const row = document.createElement('tr');
    row.className = 'pipe-section-row';
    row.dataset.pipeId = pipeObj.id; // Link to the drawn pipe
    row.draggable = true; // Make rows draggable

    // Add drag-and-drop event listeners
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    // Add mouseover/mouseout listeners for highlighting
    row.addEventListener('mouseover', () => highlightPipe(pipeObj.id, true));
    row.addEventListener('mouseout', () => highlightPipe(pipeObj.id, false));


    // Section Number Cell
    const sectionNumCell = document.createElement('td');
    const pipeNumberIndicator = document.createElement('span');
    pipeNumberIndicator.className = 'pipe-number-indicator';
    pipeNumberIndicator.textContent = pipeObj.id;
    sectionNumCell.appendChild(pipeNumberIndicator);
    sectionNumCell.setAttribute('data-label', 'Section:');
    row.appendChild(sectionNumCell);


    // NPS Select
    const npsCell = document.createElement('td');
    npsCell.setAttribute('data-label', 'NPS:');
    const npsSelect = document.createElement('select');
    npsSelect.className = 'block w-full rounded-lg text-sm pipe-nps';

    npsSizes.forEach(npsDisplay => {
        let npsValue;
        if (npsDisplay.includes(' ')) { // e.g., "1 1/4"
            const parts = npsDisplay.split(' ');
            const whole = parseFloat(parts[0]);
            const fractionParts = parts[1].split('/');
            const fractionalValue = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
            npsValue = (whole + fractionalValue).toString();
        } else if (npsDisplay.includes('/')) { // e.g., "1/2"
            const fractionParts = npsDisplay.split('/');
            npsValue = (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1])).toString();
        } else { // e.g., "1"
            npsValue = npsDisplay;
        }
        const option = document.createElement('option');
        option.value = npsValue;
        option.textContent = npsDisplay + '"';
        npsSelect.appendChild(option);
    });
    npsSelect.value = pipeObj.nps; // Set saved NPS value
    npsCell.appendChild(npsSelect);
    row.appendChild(npsCell);


    // Schedule Select
    const scheduleCell = document.createElement('td');
    scheduleCell.setAttribute('data-label', 'Schedule:');
    const scheduleSelect = document.createElement('select');
    scheduleSelect.className = 'block w-full rounded-lg text-sm pipe-schedule';
    scheduleCell.appendChild(scheduleSelect);
    row.appendChild(scheduleCell);

    // Populate and set saved schedule
    populateScheduleDropdown(scheduleSelect, pipeObj.nps, pipeObj.schedule);


    // Volume Flow Input and Unit Select
    const volumeFlowCell = document.createElement('td');
    volumeFlowCell.setAttribute('data-label', 'Volume Flow:');
    const volumeFlowGroup = document.createElement('div');
    volumeFlowGroup.className = 'flow-group';

    const volumeFlowInput = document.createElement('input');
    volumeFlowInput.type = 'number';
    volumeFlowInput.className = 'flow-input';
    volumeFlowInput.placeholder = 'Flow Rate';
    volumeFlowInput.min = '0';
    volumeFlowInput.step = 'any';
    volumeFlowInput.value = pipeObj.volumeFlow; // Set saved volume flow

    const volumeFlowUnitSelect = document.createElement('select');
    volumeFlowUnitSelect.className = 'flow-unit';
    const gpmOption = document.createElement('option');
    gpmOption.value = 'gpm';
    gpmOption.textContent = 'GPM';
    const m3hrOption = document.createElement('option');
    m3hrOption.value = 'm3_hr';
    m3hrOption.textContent = 'm³/hr';
    volumeFlowUnitSelect.appendChild(gpmOption);
    volumeFlowUnitSelect.appendChild(m3hrOption);
    volumeFlowUnitSelect.value = pipeObj.volumeFlowUnit; // Set saved volume flow unit

    volumeFlowGroup.appendChild(volumeFlowInput);
    volumeFlowGroup.appendChild(volumeFlowUnitSelect);
    volumeFlowCell.appendChild(volumeFlowGroup);
    row.appendChild(volumeFlowCell);

    // Description Input (New Column)
    const descriptionCell = document.createElement('td');
    descriptionCell.setAttribute('data-label', 'Description:');
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.className = 'description-input';
    descriptionInput.placeholder = 'e.g., Inlet Line';
    descriptionInput.value = pipeObj.description; // Set saved description
    descriptionCell.appendChild(descriptionInput);
    row.appendChild(descriptionCell);


    // Velocity Result Display
    const velocityResultCell = document.createElement('td');
    velocityResultCell.setAttribute('data-label', 'Velocity:');
    const velocityResultSpan = document.createElement('span');
    velocityResultSpan.className = 'result-cell velocity-result';
    // If velocity was previously calculated, display it
    if (typeof pipeObj.velocityFtS === 'number' && !isNaN(pipeObj.velocityFtS)) {
        velocityResultSpan.innerHTML = `
            ${pipeObj.velocityFtS.toFixed(2)} ft/s<br>
            (${(pipeObj.velocityFtS * CONVERSIONS.FEET_TO_METERS).toFixed(2)} m/s)
        `;
    } else {
        velocityResultSpan.textContent = 'N/A';
    }
    velocityResultCell.appendChild(velocityResultSpan);
    row.appendChild(velocityResultCell);


    // Actions Cell (Remove Button)
    const actionsCell = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'button-red';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
        removePipeAndRow(pipeObj.id); // Call combined removal function
        clearGlobalMessage(); // Clear any global error after row removal
    });
    actionsCell.appendChild(removeBtn);
    row.appendChild(actionsCell);

    // Append row to table body
    pipeSectionsTableBody.appendChild(row);

    // Add event listener to NPS select for dynamic schedule options
    npsSelect.addEventListener('change', () => {
        pipeObj.nps = npsSelect.value; // Update pipeObj
        const currentSchedule = scheduleSelect.value; // Store current schedule before populating
        populateScheduleDropdown(scheduleSelect, pipeObj.nps, currentSchedule);
        // Update pipeObj's schedule based on new dropdown selection
        pipeObj.schedule = scheduleSelect.value;
        velocityResultSpan.textContent = 'N/A'; // Clear result on NPS change
        velocityResultSpan.style.backgroundColor = '#eef2ff';
        velocityResultSpan.style.color = '#4338ca';
        pipeObj.velocityFtS = null; // Reset velocity in pipe object
        redrawCanvas();
    });

    // Event listener for description input
    descriptionInput.addEventListener('input', () => {
        pipeObj.description = descriptionInput.value; // Update pipeObj description
    });


    // Event listeners for other input changes to update pipeObj and clear results
    [scheduleSelect, volumeFlowInput, volumeFlowUnitSelect].forEach(element => {
        element.addEventListener('change', () => {
            if (element === scheduleSelect) pipeObj.schedule = element.value;
            if (element === volumeFlowInput) pipeObj.volumeFlow = element.value;
            if (element === volumeFlowUnitSelect) pipeObj.volumeFlowUnit = element.value;

            velocityResultSpan.textContent = 'N/A';
            velocityResultSpan.style.backgroundColor = '#eef2ff';
            velocityResultSpan.style.color = '#4338ca';
            pipeObj.velocityFtS = null; // Reset velocity in pipe object
            redrawCanvas();
        });
        if (element.type === 'number') {
            element.addEventListener('input', () => {
                pipeObj.volumeFlow = element.value; // Update immediately on input for numbers
                velocityResultSpan.textContent = 'N/A';
                velocityResultSpan.style.backgroundColor = '#eef2ff';
                velocityResultSpan.style.color = '#4338ca';
                pipeObj.velocityFtS = null; // Reset velocity in pipe object
                redrawCanvas();
            });
        }
    });
}

/**
 * Rebuilds the entire table and re-numbers all pipes based on the current `pipes` array order.
 * This function is crucial for keeping table rows, pipe IDs, and canvas labels in sync
 * after operations like adding, removing, or reordering pipes.
 */
function rebuildTableAndRenumber() {
    pipeSectionsTableBody.innerHTML = ''; // Clear all table rows
    nextPipeId = 1; // Reset for sequential IDs

    pipes.forEach(pipe => {
        pipe.id = nextPipeId++; // Assign new sequential ID
        createTableRowForPipe(pipe); // Re-create row with updated pipe data
    });

    // Re-calculate min/max velocities and redraw canvas with new colors
    minCalculatedVelocity = Infinity;
    maxCalculatedVelocity = -Infinity;
    let validVelocities = [];
    pipes.forEach(pipe => {
        if (typeof pipe.velocityFtS === 'number' && !isNaN(pipe.velocityFtS)) {
            validVelocities.push(pipe.velocityFtS);
        }
    });
    if (validVelocities.length > 0) {
        minCalculatedVelocity = Math.min(...validVelocities);
        maxCalculatedVelocity = Math.max(...validVelocities);
    } else {
        minCalculatedVelocity = Infinity;
        maxCalculatedVelocity = -Infinity;
    }

    redrawCanvas();
}


/**
 * Calculates the fluid velocity for a single pipe section row.
 * Stores results in the pipe object for drawing color.
                 * @param {HTMLElement} row - The table row element to calculate for.
                 * @returns {object} - An object containing velocity in ft/s and m/s, or null if invalid.
 */
function calculateVelocityForRow(row) {
    const npsSelect = row.querySelector('.pipe-nps');
    const scheduleSelect = row.querySelector('.pipe-schedule');
    const volumeFlowInput = row.querySelector('.volume-flow-input');
    const volumeFlowUnitSelect = row.querySelector('.volume-flow-unit');
    const descriptionInput = row.querySelector('.description-input'); // Get description input
    const velocityResultSpan = row.querySelector('.velocity-result');
    const pipeId = parseInt(row.dataset.pipeId);
    const pipeObj = pipes.find(p => p.id === pipeId);

    // Retrieve and store current values from the form inputs into the pipe object
    if (pipeObj) {
        pipeObj.nps = npsSelect.value;
        pipeObj.schedule = scheduleSelect.value;
        pipeObj.volumeFlow = volumeFlowInput.value;
        pipeObj.volumeFlowUnit = volumeFlowUnitSelect.value;
        pipeObj.description = descriptionInput.value; // Store description
        pipeObj.velocityFtS = null; // Reset before recalculation
    }

    // Reset styles initially
    velocityResultSpan.style.backgroundColor = '#eef2ff';
    velocityResultSpan.style.color = '#4338ca';


    const selectedNPS = pipeObj ? pipeObj.nps : null;
    const selectedSchedule = pipeObj ? pipeObj.schedule : null;
    let volumeFlow = parseFloat(pipeObj ? pipeObj.volumeFlow : '');
    const volumeFlowUnit = pipeObj ? pipeObj.volumeFlowUnit : '';

    // Input validation
    if (isNaN(volumeFlow) || volumeFlow < 0) {
        velocityResultSpan.textContent = 'Invalid Flow';
        velocityResultSpan.style.backgroundColor = '#fee2e2';
        velocityResultSpan.style.color = '#dc2626';
        redrawCanvas();
        return null;
    }

    // Get pipe internal diameter
    const pipeID_inches = pipeData[selectedNPS]?.[selectedSchedule];
    if (!pipeID_inches) {
        velocityResultSpan.textContent = 'ID Not Found';
        velocityResultSpan.style.backgroundColor = '#fee2e2';
        velocityResultSpan.style.color = '#dc2626';
        redrawCanvas();
        return null;
    }

    // Convert pipe ID from inches to feet
    const pipeID_feet = pipeID_inches * CONVERSIONS.INCH_TO_FEET;

    // Calculate the cross-sectional area of the pipe in square feet
    // Area = π * (Diameter/2)^2
    const pipeArea_sq_ft = Math.PI * Math.pow(pipeID_feet / 2, 2);

    if (pipeArea_sq_ft <= 0) {
        velocityResultSpan.textContent = 'Zero Area';
        velocityResultSpan.style.backgroundColor = '#fee2e2';
        velocityResultSpan.style.color = '#dc2626';
        redrawCanvas();
        return null;
    }

    // Convert volume flow to cubic feet per second (ft³/s)
    let volumeFlow_cubic_ft_per_sec;
    if (volumeFlowUnit === 'gpm') {
        volumeFlow_cubic_ft_per_sec = volumeFlow * CONVERSIONS.GPM_TO_CUBIC_FT_PER_SEC;
    } else if (volumeFlowUnit === 'm3_hr') {
        volumeFlow_cubic_ft_per_sec = volumeFlow * CONVERSIONS.M3_HR_TO_CUBIC_FT_PER_SEC;
    } else {
        velocityResultSpan.textContent = 'Invalid Unit';
        velocityResultSpan.style.backgroundColor = '#fee2e2';
        velocityResultSpan.style.color = '#dc2626';
        redrawCanvas();
        return null;
    }

    // Calculate velocity (Velocity = Volume Flow / Area) in feet per second (ft/s)
    const velocity_ft_per_sec = volumeFlow_cubic_ft_per_sec / pipeArea_sq_ft;

    // Store velocity in the pipe object for drawing
    if (pipeObj) {
        pipeObj.velocityFtS = velocity_ft_per_sec;
    }

    // Convert to meters per second
    const velocity_m_per_sec = velocity_ft_per_sec * CONVERSIONS.FEET_TO_METERS;

    // Format the output
    const formattedVelocity_ft_s = velocity_ft_per_sec.toFixed(2);
    const formattedVelocity_m_s = velocity_m_per_sec.toFixed(2);

    velocityResultSpan.innerHTML = `
        ${formattedVelocity_ft_s} ft/s<br>
        (${formattedVelocity_m_s} m/s)
    `;

    return { ft_s: velocity_ft_per_sec, m_s: velocity_m_per_sec };
}

/**
 * Calculates velocity for all pipe sections in the table and updates canvas colors.
 */
function calculateAllVelocities() {
    clearGlobalMessage();
    const rows = pipeSectionsTableBody.querySelectorAll('.pipe-section-row');
    if (rows.length === 0) {
        showGlobalError("Please draw and add at least one pipe section to calculate.");
        return;
    }

    minCalculatedVelocity = Infinity;
    maxCalculatedVelocity = -Infinity;
    let validVelocities = []; // Collect all valid velocities to determine true min/max

    rows.forEach(row => {
        const result = calculateVelocityForRow(row); // This now updates pipeObj.velocityFtS
        if (result && typeof result.ft_s === 'number' && !isNaN(result.ft_s)) {
            validVelocities.push(result.ft_s);
        }
    });

    if (validVelocities.length > 0) {
        minCalculatedVelocity = Math.min(...validVelocities);
        maxCalculatedVelocity = Math.max(...validVelocities);
    } else {
        minCalculatedVelocity = Infinity;
        maxCalculatedVelocity = -Infinity;
    }

    redrawCanvas(); // Redraw all pipes with new colors
}

/**
 * Removes a pipe from the canvas and its corresponding row from the table.
                 * @param {number} pipeId - The ID of the pipe to remove.
 */
function removePipeAndRow(pipeId) {
    // Remove from pipes array
    pipes = pipes.filter(p => p.id !== pipeId);
    rebuildTableAndRenumber();
}

/**
 * Highlights a pipe on the canvas and its corresponding row.
                 * @param {number} pipeId - The ID of the pipe to highlight.
                 * @param {boolean} highlight - True to highlight, false to unhighlight.
 */
function highlightPipe(pipeId, highlight) {
    const pipe = pipes.find(p => p.id === pipeId);
    const row = pipeSectionsTableBody.querySelector(`[data-pipe-id="${pipeId}"]`);
    if (pipe) {
        pipe.highlighted = highlight;
        redrawCanvas(); // Redraw to show/hide highlight color
    }
    if (row) {
        if (highlight) {
            row.classList.add('highlighted');
        } else {
            row.classList.remove('highlighted');
        }
    }
}


// --- Drag and Drop Logic for Table Rows ---
let draggedItem = null; // Stores the <tr> element being dragged

function handleDragStart(e) {
    draggedItem = this; // 'this' refers to the <tr> being dragged
    e.dataTransfer.effectAllowed = 'move';
    // Store the pipeId of the dragged item
    e.dataTransfer.setData('text/plain', this.dataset.pipeId);
    
    // Add a class for visual feedback during drag
    setTimeout(() => {
        this.classList.add('dragging');
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    const targetRow = e.target.closest('tr');
    if (targetRow && targetRow !== draggedItem) {
        // Visual feedback for drop target
        pipeSectionsTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('drop-target'));
        targetRow.classList.add('drop-target');
    }
}

function handleDragLeave(e) {
    e.target.closest('tr')?.classList.remove('drop-target');
}

function handleDrop(e) {
    e.preventDefault();
    const targetRow = e.target.closest('tr');
    
    if (targetRow && draggedItem && targetRow !== draggedItem) {
        const fromPipeId = parseInt(draggedItem.dataset.pipeId);
        const toPipeId = parseInt(targetRow.dataset.pipeId);

        const fromIndex = pipes.findIndex(p => p.id === fromPipeId);
        const toIndex = pipes.findIndex(p => p.id === toPipeId);

        if (fromIndex > -1 && toIndex > -1) {
            const [removed] = pipes.splice(fromIndex, 1);
            pipes.splice(toIndex, 0, removed);
            rebuildTableAndRenumber(); // Rebuild the table to reflect the new order and renumber
        }
    }
    pipeSectionsTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('drop-target'));
}

function handleDragEnd(e) {
    draggedItem?.classList.remove('dragging');
    draggedItem = null;
    pipeSectionsTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('drop-target'));
}


// --- Mode Switching Logic ---
function setMode(mode) {
    currentMode = mode;
    drawPipeModeBtn.classList.remove('active');
    drawSymbolModeBtn.classList.remove('active');
    deleteSymbolModeBtn.classList.remove('active');
    symbolControls.classList.add('hidden'); // Hide symbol controls by default

    if (mode === 'pipe') {
        drawPipeModeBtn.classList.add('active');
        drawingCanvas.style.cursor = 'crosshair';
    } else if (mode === 'symbol') {
        drawSymbolModeBtn.classList.add('active');
        symbolControls.classList.remove('hidden');
        drawingCanvas.style.cursor = 'crosshair';
    } else if (mode === 'deleteSymbol') {
        deleteSymbolModeBtn.classList.add('active');
        drawingCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'red\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'feather feather-x-circle\'><circle cx=\'12\' cy=\'12\' r=\'10\'></circle><line x1=\'15\' y1=\'9\' x2=\'9\' y2=\'15\'></line><line x1=\'9\' y1=\'9\' x2=\'15\' y2=\'15\'></line></svg>") 12 12, auto'; // Custom delete cursor
    }
}

drawPipeModeBtn.addEventListener('click', () => setMode('pipe'));
drawSymbolModeBtn.addEventListener('click', () => setMode('symbol'));
deleteSymbolModeBtn.addEventListener('click', () => setMode('deleteSymbol'));


symbolShapeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentSymbolShape = event.target.value;
    });
});

// --- Save and Load Functions ---
function saveDiagram() {
    try {
        const diagramData = {
            pipes: pipes,
            symbols: symbols,
            nextPipeId: nextPipeId
        };
        const dataStr = JSON.stringify(diagramData, null, 2); // Pretty print JSON

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        // Prompt for filename or use default
        const filename = prompt("Enter a filename (e.g., my_diagram):", "fluid_diagram") || "fluid_diagram";
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        clearGlobalMessage("Diagram saved successfully!", false); // Use global error div for success too
    } catch (error) {
        console.error("Error saving diagram:", error);
        clearGlobalMessage(`Error saving diagram: ${error.message}`);
    }
}

function loadDiagram() {
    fileInput.click(); // Trigger the hidden file input click
}

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        clearGlobalMessage("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);

            // Validate loaded data structure (basic check)
            if (loadedData.pipes && Array.isArray(loadedData.pipes) &&
                loadedData.symbols && Array.isArray(loadedData.symbols) &&
                typeof loadedData.nextPipeId === 'number') {
                
                pipes = loadedData.pipes;
                symbols = loadedData.symbols;
                nextPipeId = loadedData.nextPipeId;

                rebuildTableAndRenumber(); // Rebuild table with loaded pipe data
                redrawCanvas(); // Redraw canvas with loaded pipes and symbols
                clearGlobalMessage("Diagram loaded successfully!", false);
            } else {
                clearGlobalMessage("Invalid diagram file format. Please select a valid JSON file.");
            }
        } catch (error) {
            console.error("Error loading diagram:", error);
            clearGlobalMessage(`Error loading diagram: ${error.message}. Make sure it's a valid JSON file.`);
        } finally {
            fileInput.value = ''; // Clear the file input
        }
    };
    reader.onerror = () => {
        clearGlobalMessage("Error reading file.");
        fileInput.value = '';
    };
    reader.readAsText(file);
});


// Event Listeners for drawing controls
drawingCanvas.addEventListener('mousedown', handleMouseDown);
drawingCanvas.addEventListener('mouseup', handleMouseUp);
// Mousemove for drawing is added/removed dynamically within mousedown/mouseup
// Add a global mousemove listener to track mouse position for endpoint highlighting
window.addEventListener('mousemove', (e) => {
    window.lastMouseMovePos = getMousePos(e);
    // Only redraw for hover effects if not actively drawing/resizing
    if (!currentDrawingObject && (currentMode === 'pipe' || currentMode === 'symbol')) {
        redrawCanvas();
    }
});


// Button Event Listeners
clearCanvasBtn.addEventListener('click', () => {
    pipes = []; // Clear all pipes
    symbols = []; // Clear all symbols
    pipeSectionsTableBody.innerHTML = ''; // Clear all table rows
    nextPipeId = 1; // Reset pipe ID counter
    minCalculatedVelocity = Infinity; // Reset min/max velocities
    maxCalculatedVelocity = -Infinity;
    redrawCanvas();
    clearGlobalMessage();
});
calculateAllBtn.addEventListener('click', calculateAllVelocities);
saveBtn.addEventListener('click', saveDiagram); // Attach save function
loadBtn.addEventListener('click', loadDiagram); // Attach load function

// Responsive canvas sizing
window.addEventListener('resize', setupCanvas);
setMode('pipe'); // Set initial mode
setupCanvas(); // Initial canvas setup