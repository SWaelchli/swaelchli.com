// overhead-tank.js

// 1. Get references to the HTML elements
    // Oil Header Pressure
    const OilHeaderPressureSlider = document.getElementById('OilHeaderPressure');
    const displayOilHeaderPressure = document.getElementById('displayOilHeaderPressure');
    
    // Oil Header Pressure
    const OrificeDiameterSlider = document.getElementById('OrificeDiameter');
    const displayOrificeDiameter = document.getElementById('displayOrificeDiameter');

    // Oil Density
    const OilDensityKGM3Input = document.getElementById('OilDensityKGM3');

    // Oil Viscosity
    const OilViscosityInput = document.getElementById('OilViscosity');

    // Supply Line Inner Diameter
    const SupplyLineInnerDiameterInput = document.getElementById('SupplyLineInnerDiameter');

    // Tanks Volume
    const TankVolumeInput = document.getElementById('TankVolume');

    // Tanks Height
    const TankElevationMInput = document.getElementById('TankElevationM');

    // Supply Line Oil Volume Percentage display
    const displaySupplyLineOilVolumePro = document.getElementById('displaySupplyLineOilVolumePro');
    const displayOilHeaderPressurePro = document.getElementById('displayOilHeaderPressurePro');
    const displayOrificeDiameterPro = document.getElementById('displayOrificeDiameterPro');
    const displayOilDensityKGM3Pro = document.getElementById('displayOilDensityKGM3Pro');
    const displayOilViscosityPro = document.getElementById('displayOilViscosityPro');
    const displaySupplyLineInnerDiameterPro = document.getElementById('displaySupplyLineInnerDiameterPro');
    const displayTankVolumePro = document.getElementById('displayTankVolumePro');
    const displayTankElevationMPro = document.getElementById('displayTankElevationMPro');
    const displayflowRateLMINPro = document.getElementById('displayflowRateLMINPro');
    const displayTankOilVolumePro = document.getElementById('displayTankOilVolumePro');
    const displaycurrentTimePro = document.getElementById('displaycurrentTimePro');

 




// 2. Initialize your JavaScript variable

//General variables

let DischargeCoefficient = 0.61; // Discharge coefficient for the orifice
let SupplyLineOilVolume = 0; // Volume of oil in the supply line in litre
let TankOilVolume = 0; // Volume of oil in the tank in litre

let currentTime = 0; // Current time in seconds
let timeStep = 0.1; // Time step for the simulation in seconds
let simulationIntervalId;
let totalSimulationDuration = 60 * 60; // Total duration of the simulation in seconds





// This variable will hold the current value of the slider ar input
let OilHeaderPressure = parseFloat(OilHeaderPressureSlider.value);  //barg
let OrificeDiameter = parseFloat(OrificeDiameterSlider.value);      // mm
let OilDensityKGM3 = parseFloat(OilDensityKGM3Input.value)                  // // kg/m3
let OilViscosity = parseFloat(OilViscosityInput.value)              // mm2/s
let SupplyLineInnerDiameter = parseFloat(SupplyLineInnerDiameterInput.value)   // mm
let TankVolume = parseFloat(TankVolumeInput.value)          
let TankElevationM = parseFloat(TankElevationMInput.value)              // m

// calulate initial variables
let SupplyLineVolume = Math.PI * Math.pow((SupplyLineInnerDiameter / 100) / 2, 2) * (TankElevationM * 10);   // TankElevation from m to dm, Volume of the supply line in l 
let SupplyLineOilPercentage = (SupplyLineOilVolume / SupplyLineVolume) * 100; // Percentage of oil in the supply line
let TankOilPercentage = (TankOilVolume / TankVolume) * 100;  // Percentage of oil in the tank
let OrificeDownstreamPressure = 0   // Downstream pressure at the orifice in barg
let flowRateLMIN = 0; // Flow rate in m3/s
let deltaPressure = OilHeaderPressure

console.log("SupplyLineVolume:", SupplyLineVolume);

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

OilDensityKGM3Input.addEventListener('input', function() {
   
    OilDensityKGM3 = parseFloat(this.value);
    displayOilDensityKGM3Pro.textContent = OilDensityKGM3.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilViscosityInput.addEventListener('input', function() {
   
    OilViscosity = parseFloat(this.value);
    displayOilViscosityPro.textContent = OilViscosity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

SupplyLineInnerDiameterInput.addEventListener('input', function() {

    SupplyLineInnerDiameter = parseFloat(this.value);
    displaySupplyLineInnerDiameterPro.textContent = SupplyLineInnerDiameter.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place


});

TankVolumeInput.addEventListener('input', function() {
   
    TankVolume = parseFloat(this.value);
    displayTankVolumePro.textContent = TankVolume.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

TankElevationMInput.addEventListener('input', function() {
   
    TankElevationM = parseFloat(this.value);
    displayTankElevationMPro.textContent = TankElevationM.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place

});


// 4. Calulation of process data

//function calculateProcessData() {
    // Calculate the flow rate using the orifice equation
   //const flowRateLMIN = DischargeCoefficient * Math.PI * Math.pow(OrificeDiameter / 1000, 2) * Math.sqrt(2 * OilHeaderPressure * 100000 / OilDensityKGM3); // Convert diameter to meters and pressure to Pascals
    //const flowRateLMIN = flowRateLMIN * 1000 * 60; // Convert m3/s to l/min




    // Display the results in the process data panel
    //displayflowRateLMINPro.textContent = flowRateLMIN.toFixed(2); // Display flow rate in m3/s
   
//}



// 5. Auxiliary Functions





function CalculateflowRateLMIN() {
    // Calculate the flow rate in liter per minutes using the orifice equation
    let hydrostaticPressureBARG = (((SupplyLineOilPercentage / 100) * TankElevationM * OilDensityKGM3 * 9.81)/100000); // hydrostatic pressure in barg
    let RawDeltaPressureBAR = OilHeaderPressure - hydrostaticPressureBARG; //deltaPressure in bar, header pressure - hydrostatic pressure
    // Determine the sign of the flow rate based on rawDeltaPressure
    let flowDirection = Math.sign(RawDeltaPressureBAR);


    let absoluteDeltaPressurePA = Math.abs(RawDeltaPressureBAR) * 100000; // absolute value of delta pressure in in bar
    
    flowRateMagnitudeM3S = DischargeCoefficient * Math.PI * Math.pow(OrificeDiameter / 1000, 2) * Math.sqrt(2 * absoluteDeltaPressurePA / OilDensityKGM3); // Convert diameter to meters and pressure to Pascals
    
    // Apply the determined sign to the flow rate magnitude and Convert m3/s to l/min
    flowRateLMIN = flowDirection * flowRateMagnitudeM3S * 1000 * 60;
    
    
    return flowRateLMIN; // Convert m3/s to l/min
}




// 6. Simulation Loop

function startSimulation() {

    // Set up the interval
    simulationIntervalId = setInterval(runSimulationStep, timeStep * 1000); // timeStep in milliseconds

    console.log("Simulation started.");
}

function runSimulationStep() {
    if (currentTime <= totalSimulationDuration) {
        // 1. Calculate instantaneous flow rate (using existing logic or a modified version)

        flowRateLMIN = CalculateflowRateLMIN();

        // 2. Calculate volume change
        let deltaVolume = flowRateLMIN / 60 * timeStep;  // Convert l/min to l/s and multiply by timeStep in seconds

        // 3. Update volume
        //TankOilVolume += deltaVolume;
        
        if (SupplyLineOilPercentage < 100 || (TankOilPercentage == 0 && Math.sign(flowRateLMIN) == -1)) {
        SupplyLineOilVolume += deltaVolume; // Update the oil volume in the supply line

        SupplyLineOilPercentage = (SupplyLineOilVolume / SupplyLineVolume) * 100; // Percentage of oil in the supply line
        SupplyLineOilPercentage = Math.max(0, Math.min(SupplyLineOilPercentage, 100)); // Ensure percentage is between 0 and 100





        } else {
            TankOilVolume += deltaVolume; // Update the oil volume in the tank

            TankOilPercentage = (TankOilVolume / TankVolume) * 100; // Percentage of oil in the tank
            TankOilPercentage = Math.max(0, Math.min(TankOilPercentage, 100)); // Ensure percentage is between 0 and 100

        }


        // 4. Update current time
        currentTime += timeStep;

        // 5. Update UI (e.g., display TankOilVolume, update canvas)

        // Display the results in the process data panel
        displaySupplyLineOilVolumePro.textContent = SupplyLineOilPercentage.toFixed(2); // Display flow rate in m3/s
        displayflowRateLMINPro.textContent = flowRateLMIN.toFixed(2); // Display flow rate in m3/s
        displaycurrentTimePro.textContent = currentTime.toFixed(2); // Display the current time in s
        displayTankOilVolumePro.textContent = TankOilPercentage.toFixed(2); // Display the current time in s



    } else {
        // Simulation finished
        stopSimulation();
    }
}

// Function to stop the simulation
function stopSimulation() {
    clearInterval(simulationIntervalId);
    console.log("Simulation stopped.");
}


const StartButton = document.getElementById('StartButton');
StartButton.addEventListener('click', function() {
    startSimulation(); 
});

const StopButton = document.getElementById('StopButton');
StopButton.addEventListener('click', function() {
    stopSimulation(); 
});
