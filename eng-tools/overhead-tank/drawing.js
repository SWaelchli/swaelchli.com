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
    context.lineTo(510, 400);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(540, 400);
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
    context.lineTo(510, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(540, 390);
    context.lineTo(560, 390);
    context.stroke();
    context.closePath();


    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(460, 390);
    context.lineTo(460, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(470, 360);
    context.lineTo(470, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(445, 360);
    context.lineTo(463, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(467, 360);
    context.lineTo(485, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(460, 360);
    context.lineTo(460, 180);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(470, 360);
    context.lineTo(470, 180);
    context.stroke();
    context.closePath();

    //Tank

    context.strokeStyle = '#000000';
    context.strokeRect(423.5, 24, 83, 158);


    //draw oil in header line
    context.strokeStyle = '#9E6851';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(31, 395);
    context.lineTo(510, 395);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#9E6851';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(540, 395);
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
    context.moveTo(465, 359);
    context.lineTo(465, 395);
    context.stroke();
    context.closePath();

    //check valve header

    // Specific Check Valve Symbol (similar to the image you provided)
    context.lineWidth = 3;
    context.strokeStyle = '#000000';

    // Left vertical bar
    context.beginPath();
    context.moveTo(510, 385);
    context.lineTo(510, 405);
    context.stroke();
    context.closePath();

    // Right vertical bar
    context.beginPath();
    context.moveTo(540, 385);
    context.lineTo(540, 405);
    context.stroke();
    context.closePath();

    context.lineWidth = 2; // Thinner line for the arrow
    context.beginPath();
    context.moveTo(540, 385);
    context.lineTo(510, 405);
    context.stroke();
    context.closePath();


    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(540, 385, 3, 0, Math.PI * 2, true); // Red dot at the top of the right bar
    context.fill();
    context.closePath();


    // Arrowhead at the end of the red diagonal line (pointing towards the left bar)
    context.beginPath();
    context.moveTo(510, 405);
    context.lineTo(515, 395); // Back of arrow
    context.lineTo(518, 408); // Back of arrow
    context.closePath();
    context.stroke();
    context.fill();



};