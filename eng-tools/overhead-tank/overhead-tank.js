// overhead-tank.js

// 1. Get references to the HTML elements
    // Oil Header Pressure
    const OilHeaderPressureSlider = document.getElementById('OilHeaderPressure');
    const displayOilHeaderPressure = document.getElementById('displayOilHeaderPressure');
    
    // Oil Header Pressure
    const OrificeDiameterSlider = document.getElementById('OrificeDiameter');
    const displayOrificeDiameter = document.getElementById('displayOrificeDiameter');

    // Oil Density
    const OilDensityInput = document.getElementById('OilDensity');

    // Oil Viscosity
    const OilViscosityInput = document.getElementById('OilViscosity');

    // Supply Line Inner Diameter
    const SupplyLineInnerDiameterInput = document.getElementById('SupplyLineInnerDiameter');




// 2. Initialize your JavaScript variable

//General variables

let DischargeCoefficient = 0.61; // Discharge coefficient for the orifice


// This variable will hold the current value of the slider
let OilHeaderPressure = parseFloat(OilHeaderPressureSlider.value);
let OrificeDiameter = parseFloat(OrificeDiameterSlider.value);
let OilDensity = parseFloat(OilDensityInput.value)

// Set the initial displayed value to match the slider's initial value
displayOilHeaderPressure.textContent = OilHeaderPressure.toFixed(1);
displayOrificeDiameter.textContent = OrificeDiameter.toFixed(1);

// 3. Add an event listener to the sliders
// The 'input' event fires continuously as the slider is dragged
    OilHeaderPressureSlider.addEventListener('input', function() {
        // Update the JavaScript variable
        OilHeaderPressure = parseFloat(this.value);

        // update the displayed value CONTROL PANEL
        displayOilHeaderPressure.textContent = OilHeaderPressure.toFixed(1); // .toFixed(1) for one decimal place

        // update the displayed value PROCESS DATA PANEL
        displayOilHeaderPressurePro.textContent = OilHeaderPressure.toFixed(1); // .toFixed(1) for one decimal place


            // You can now use the 'OilHeaderPressure' variable in your JavaScript code
        //console.log("Current Oil Header Pressure:", OilHeaderPressure);
    });


OrificeDiameterSlider.addEventListener('input', function() {
   
    OrificeDiameter = parseFloat(this.value);
    displayOrificeDiameter.textContent = OrificeDiameter.toFixed(1); // .toFixed(1) for one decimal place
    displayOrificeDiameterPro.textContent = OrificeDiameter.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilDensityInput.addEventListener('input', function() {
   
    OilDensity = parseFloat(this.value);
    displayOilDensityPro.textContent = OilDensity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilViscosityInput.addEventListener('input', function() {
   
    OilViscosity = parseFloat(this.value);
    displayOilViscosityPro.textContent = OilViscosity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

SupplyLineInnerDiameterInput.addEventListener('input', function() {

    SupplyLineInnerDiameter = parseFloat(this.value);
    displaySupplyLineInnerDiameterPro.textContent = SupplyLineInnerDiameter.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place


});


// 4. Calulation of process data

function calculateProcessData() {
    // Calculate the flow rate using the orifice equation
    const flowRate = DischargeCoefficient * Math.PI * Math.pow(OrificeDiameter / 1000, 2) * Math.sqrt(2 * OilHeaderPressure * 100000 / OilDensity); // Convert diameter to meters and pressure to Pascals
    const flowRateLMIN = flowRate * 1000 * 60; // Convert m3/s to l/min

    // Calculate the velocity in the supply line
    const SupplyLineInnerDiameter = parseFloat(SupplyLineInnerDiameterInput.value);
    const velocity = flowRate / (Math.PI * Math.pow(SupplyLineInnerDiameter / 2000, 2)); // Convert diameter to meters


    // Display the results in the process data panel
    displayFlowRatePro.textContent = flowRateLMIN.toFixed(2); // Display flow rate in m3/s
    displayVelocityPro.textContent = velocity.toFixed(2); // Display velocity in m/s
}



// 5. Add an event listener to the calculate button
const calculateButton = document.getElementById('calculateButton');
calculateButton.addEventListener('click', function() {
    // Call the function to calculate process data
    calculateProcessData();
});

