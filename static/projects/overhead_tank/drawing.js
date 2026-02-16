resetDrawing(); // Call resetDrawing to initialize the drawing


// Reset button that reloads this drawing.js file
document.getElementById('ResetButton').addEventListener('click', function() {
    resetDrawing(); // Call the resetDrawing function to reset the drawing
});



function resetDrawing() {
    

    canvaso = document.getElementById('tankCanvas');
    context = canvaso.getContext('2d');


    context.lineWidth = 3;

    // Bearing Blocks Comperssor
    context.strokeStyle = '#000000';
    context.strokeRect(20, 200, 30, 20);

    context.strokeStyle = '#000000';
    context.strokeRect(120, 200, 30, 20);

    // Compressor Casing

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(50, 240);
    context.lineTo(50, 180);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(50, 180);
    context.lineTo(120, 150);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(120, 150);
    context.lineTo(120, 270);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(120, 270);
    context.lineTo(50, 240);
    context.stroke();
    context.closePath();

    //Supply Line

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(30, 220);
    context.lineTo(30, 400);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(30, 400);
    context.lineTo(480, 400);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(510, 400);
    context.lineTo(560, 400);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(40, 220);
    context.lineTo(40, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(130, 390);
    context.lineTo(130, 220);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(140, 220);
    context.lineTo(140, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(35, 390);
    context.lineTo(480, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(510, 390);
    context.lineTo(560, 390);
    context.stroke();
    context.closePath();


    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(430, 390);
    context.lineTo(430, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(440, 360);
    context.lineTo(440, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(415, 360);
    context.lineTo(433, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(437, 360);
    context.lineTo(455, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(430, 360);
    context.lineTo(430, 180);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(440, 360);
    context.lineTo(440, 180);
    context.stroke();
    context.closePath();
    
    //Tank

    context.strokeStyle = '#000000';
    context.strokeRect(393.5, 24, 83, 158);


    //draw oil in header line
    context.strokeStyle = '#9E6851';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(31, 395);
    context.lineTo(480, 395);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#9E6851';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(510, 395);
    context.lineTo(560, 395);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#9E6851';
    context.beginPath();
    context.moveTo(35, 222);
    context.lineTo(35, 395);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#9E6851';
    context.beginPath();
    context.moveTo(135, 222);
    context.lineTo(135, 395);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#9E6851';
    context.beginPath();
    context.moveTo(435, 359);
    context.lineTo(435, 395);
    context.stroke();
    context.closePath();

    //check valve header

    // Specific Check Valve Symbol (similar to the image you provided)
    context.lineWidth = 3;
    context.strokeStyle = '#000000';

    // Left vertical bar
    context.beginPath();
    context.moveTo(480, 385);
    context.lineTo(480, 405);
    context.stroke();
    context.closePath();

    // Right vertical bar
    context.beginPath();
    context.moveTo(510, 385);
    context.lineTo(510, 405);
    context.stroke();
    context.closePath();

    context.lineWidth = 2; // Thinner line for the arrow
    context.beginPath();
    context.moveTo(510, 385);
    context.lineTo(480, 405);
    context.stroke();
    context.closePath();


    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(510, 385, 3, 0, Math.PI * 2, true); // Red dot at the top of the right bar
    context.fill();
    context.closePath();


    // Arrowhead at the end of the red diagonal line (pointing towards the left bar)
    context.beginPath();
    context.moveTo(480, 405);
    context.lineTo(485, 395); // Back of arrow
    context.lineTo(488, 408); // Back of arrow
    context.closePath();
    context.stroke();
    context.fill();



};

/**
 * Draws a pressure gauge on the canvas.
 * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
 * @param {number} x - The x-coordinate of the gauge's center.
 * @param {number} y - The y-coordinate of the gauge's center.
 * @param {number} value - The pressure value to display.
 * @param {string} label - The label for the pressure gauge (e.g., "P1").
 */
function drawPressureGauge(context, x, y, value, label) {
    const radius = 20;
    const needleLength = 15;
    const needleColor = 'red';
    const gaugeColor = '#333';
    const textColor = '#000';

    // Draw gauge circle
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = gaugeColor;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    // Draw needle
    context.save();
    context.translate(x, y);
    // Map value (0-5 barg) to angle (e.g., -135 deg to 135 deg relative to horizontal)
    // Assuming max pressure is 5 barg for the gauge scale
    const maxPressure = 5;
    const angleRange = 270 * (Math.PI / 180); // 270 degrees in radians
    const startAngle = -135 * (Math.PI / 180); // Start at -135 degrees (bottom left)

    // Ensure value is within bounds for angle calculation
    const clampedValue = Math.max(0, Math.min(value, maxPressure));
    const angle = startAngle + (clampedValue / maxPressure) * angleRange;

    context.rotate(angle);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(needleLength, 0);
    context.strokeStyle = needleColor;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    context.restore();

    // Draw value text
    context.font = '12px Arial';
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${value.toFixed(1)}`, x, y + radius -10); // Display value below gauge

    // Draw label
    context.font = '14px Arial';
    context.fillStyle = textColor;
    context.fillText(label, x, y - radius - 10); // Display label above gauge
}