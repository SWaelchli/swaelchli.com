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
    context.moveTo(40, 390);
    context.lineTo(130, 390);
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
    context.moveTo(140, 390);
    context.lineTo(490, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(490, 390);
    context.lineTo(490, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(500, 360);
    context.lineTo(500, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(500, 390);
    context.lineTo(560, 390);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(475, 360);
    context.lineTo(493, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(497, 360);
    context.lineTo(515, 360);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(490, 360);
    context.lineTo(490, 180);
    context.stroke();
    context.closePath();

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(500, 360);
    context.lineTo(500, 180);
    context.stroke();
    context.closePath();

    //Tank

    context.strokeStyle = '#000000';
    context.strokeRect(453.5, 24, 83, 158);


    //draw oil in header line
    context.strokeStyle = '#9E6851';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(31, 395);
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
    context.moveTo(495, 359);
    context.lineTo(495, 395);
    context.stroke();
    context.closePath();

};



