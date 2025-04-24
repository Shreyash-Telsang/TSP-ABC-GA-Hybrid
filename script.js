// Main variables
let cities = [];
let bestRoute = [];
let isVisualizing = false;
let animationId = null;
let convergenceData = []; // To track progress for visualization
let map = null;
let cityMarkers = [];
let routeLayer = null;
let initialDistance = 0;
let finalDistance = 0;
let showLabels = true;
let showHeatmap = false;
let heatmapLayer = null;
let isCustomMode = false;
let mapType = 'random';

// Solution history for comparing multiple runs
let solutionHistory = [];
let algorithmComparisonData = {
    labels: [],
    datasets: [
        {
            label: 'ABC',
            data: [],
            backgroundColor: 'rgba(52, 152, 219, 0.5)',
        },
        {
            label: 'GA',
            data: [],
            backgroundColor: 'rgba(46, 204, 113, 0.5)',
        },
        {
            label: 'Hybrid',
            data: [],
            backgroundColor: 'rgba(231, 76, 60, 0.5)',
        }
    ]
};

// Predefined city sets for different countries
const predefinedLocations = {
    india: [
        { name: "Mumbai", lat: 19.076, lng: 72.8777 },
        { name: "Delhi", lat: 28.7041, lng: 77.1025 },
        { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
        { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
        { name: "Chennai", lat: 13.0827, lng: 80.2707 },
        { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
        { name: "Pune", lat: 18.5204, lng: 73.8567 },
        { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
        { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
        { name: "Lucknow", lat: 26.8467, lng: 80.9462 }
    ],
    usa: [
        { name: "New York", lat: 40.7128, lng: -74.006 },
        { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
        { name: "Chicago", lat: 41.8781, lng: -87.6298 },
        { name: "Houston", lat: 29.7604, lng: -95.3698 },
        { name: "Phoenix", lat: 33.4484, lng: -112.074 },
        { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
        { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
        { name: "San Diego", lat: 32.7157, lng: -117.1611 },
        { name: "Dallas", lat: 32.7767, lng: -96.7970 },
        { name: "San Francisco", lat: 37.7749, lng: -122.4194 }
    ],
    uk: [
        { name: "London", lat: 51.5074, lng: -0.1278 },
        { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
        { name: "Manchester", lat: 53.4808, lng: -2.2426 },
        { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
        { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
        { name: "Bristol", lat: 51.4545, lng: -2.5879 },
        { name: "Sheffield", lat: 53.3811, lng: -1.4701 },
        { name: "Leeds", lat: 53.8008, lng: -1.5491 },
        { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
        { name: "Newcastle", lat: 54.9783, lng: -1.6174 }
    ],
    australia: [
        { name: "Sydney", lat: -33.8688, lng: 151.2093 },
        { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
        { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
        { name: "Perth", lat: -31.9505, lng: 115.8605 },
        { name: "Adelaide", lat: -34.9285, lng: 138.6007 },
        { name: "Gold Coast", lat: -28.0167, lng: 153.4000 },
        { name: "Canberra", lat: -35.2809, lng: 149.1300 },
        { name: "Newcastle", lat: -32.9283, lng: 151.7817 },
        { name: "Wollongong", lat: -34.4278, lng: 150.8930 },
        { name: "Hobart", lat: -42.8821, lng: 147.3272 }
    ]
};

// DOM elements
const mapElement = document.getElementById('map');
const numCitiesInput = document.getElementById('num-cities');
const algorithmSelect = document.getElementById('algorithm');
const mapTypeSelect = document.getElementById('map-type');
const countrySelect = document.getElementById('country-select');
const randomSettingsDiv = document.getElementById('random-settings');
const realWorldSettingsDiv = document.getElementById('real-world-settings');
const customControlsDiv = document.getElementById('custom-controls');
const abcParamsDiv = document.getElementById('abc-params');
const gaParamsDiv = document.getElementById('ga-params');
const hybridParamsDiv = document.getElementById('hybrid-params');
const generateBtn = document.getElementById('generate-btn');
const solveBtn = document.getElementById('solve-btn');
const visualizeBtn = document.getElementById('visualize-btn');
const stopBtn = document.getElementById('stop-btn');
const clearPointsBtn = document.getElementById('clear-points');
const toggleLabelsBtn = document.getElementById('toggle-labels');
const toggleHeatmapBtn = document.getElementById('toggle-heatmap');
const distanceSpan = document.getElementById('distance');
const iterationsSpan = document.getElementById('iterations');
const timeSpan = document.getElementById('time');
const improvementSpan = document.getElementById('improvement');
const convergenceChart = document.getElementById('convergence-chart');

// Initialize map
function initMap() {
    // If map already exists, destroy it
    if (map !== null) {
        map.remove();
    }

    // Create new map instance
    map = L.map('map').setView([20, 0], 2);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize heatmap layer
    const heatConfig = {
        "radius": 25,
        "maxOpacity": 0.8,
        "scaleRadius": false,
        "useLocalExtrema": true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count'
    };
    
    heatmapLayer = new HeatmapOverlay(heatConfig);
    map.addLayer(heatmapLayer);
    heatmapLayer.setData({ max: 10, data: [] });

    // Setup for custom map clicking
    map.on('click', function(e) {
        if (isCustomMode) {
            addCustomPoint(e.latlng.lat, e.latlng.lng);
        }
    });
}

// Event listeners
algorithmSelect.addEventListener('change', () => {
    if (algorithmSelect.value === 'abc') {
        abcParamsDiv.style.display = 'block';
        gaParamsDiv.style.display = 'none';
        hybridParamsDiv.style.display = 'none';
    } else if (algorithmSelect.value === 'ga') {
        abcParamsDiv.style.display = 'none';
        gaParamsDiv.style.display = 'block';
        hybridParamsDiv.style.display = 'none';
    } else { // hybrid
        abcParamsDiv.style.display = 'none';
        gaParamsDiv.style.display = 'none';
        hybridParamsDiv.style.display = 'block';
    }
});

mapTypeSelect.addEventListener('change', () => {
    mapType = mapTypeSelect.value;
    if (mapType === 'random') {
        randomSettingsDiv.style.display = 'block';
        realWorldSettingsDiv.style.display = 'none';
        isCustomMode = false;
    } else { // real-world
        randomSettingsDiv.style.display = 'none';
        realWorldSettingsDiv.style.display = 'block';
    }
});

countrySelect.addEventListener('change', () => {
    if (countrySelect.value === 'custom') {
        isCustomMode = true;
        customControlsDiv.style.display = 'block';
        clearCities();
        map.setView([0, 0], 2);
    } else {
        isCustomMode = false;
        customControlsDiv.style.display = 'none';
    }
});

generateBtn.addEventListener('click', generateCities);
solveBtn.addEventListener('click', solveTSP);
visualizeBtn.addEventListener('click', visualizePath);
stopBtn.addEventListener('click', stopVisualization);
clearPointsBtn.addEventListener('click', clearCities);
toggleLabelsBtn.addEventListener('click', toggleLabels);
toggleHeatmapBtn.addEventListener('click', toggleHeatmapDisplay);

// Set default views on load
window.addEventListener('DOMContentLoaded', () => {
    // Algorithm params
    abcParamsDiv.style.display = 'none';
    gaParamsDiv.style.display = 'none';
    hybridParamsDiv.style.display = 'block';
    
    // Map settings
    realWorldSettingsDiv.style.display = 'none';
    customControlsDiv.style.display = 'none';
    
    // Initialize map
    initMap();
});

// Toggle display of city labels
function toggleLabels() {
    showLabels = !showLabels;
    updateCityMarkers();
}

// Toggle heatmap display
function toggleHeatmapDisplay() {
    showHeatmap = !showHeatmap;
    if (showHeatmap) {
        updateHeatmap();
    } else {
        heatmapLayer.setData({ max: 10, data: [] });
    }
}

// Update heatmap with current cities
function updateHeatmap() {
    if (!showHeatmap) return;
    
    const heatmapData = cities.map(city => ({
        lat: city.lat || 0,
        lng: city.lng || 0,
        count: 1
    }));
    
    heatmapLayer.setData({
        max: 10,
        data: heatmapData
    });
}

// Generate cities based on selected mode
function generateCities() {
    stopVisualization();
    clearCities();
    
    if (mapType === 'random') {
        generateRandomCities();
    } else { // real-world
        if (countrySelect.value === 'custom') {
            if (cities.length < 3) {
                showAlert('Please add at least 3 cities by clicking on the map');
                return;
            }
        } else {
            generatePredefinedCities(countrySelect.value);
        }
    }
    
    if (cities.length >= 3) {
        solveBtn.disabled = false;
        initialDistance = calculateRandomRouteDistance();
        distanceSpan.textContent = initialDistance.toFixed(2);
    } else {
        solveBtn.disabled = true;
    }
    
    visualizeBtn.disabled = true;
    iterationsSpan.textContent = '-';
    timeSpan.textContent = '-';
    improvementSpan.textContent = '-';
    
    // Clear convergence chart
    if (window.convergenceChart) {
        window.convergenceChart.destroy();
        window.convergenceChart = null;
    }
}

// Generate random cities on the map
function generateRandomCities() {
    const numCities = parseInt(numCitiesInput.value);
    cities = [];
    
    // For random mode, we need to calculate positions on the map view
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();
    
    // Create a depot/starting point (first city)
    const centerLat = (southWest.lat + northEast.lat) / 2;
    const centerLng = (southWest.lng + northEast.lng) / 2;
    
    cities.push({
        id: 0,
        name: 'Depot',
        lat: centerLat,
        lng: centerLng,
        isDepot: true
    });
    
    // Generate random cities within the bounds
    for (let i = 1; i < numCities; i++) {
        const lat = southWest.lat + Math.random() * (northEast.lat - southWest.lat);
        const lng = southWest.lng + Math.random() * (northEast.lng - southWest.lng);
        
        cities.push({
            id: i,
            name: `City ${i}`,
            lat: lat,
            lng: lng,
            isDepot: false
        });
    }
    
    updateCityMarkers();
    updateHeatmap();
}

// Generate cities from predefined country data
function generatePredefinedCities(country) {
    if (predefinedLocations[country]) {
        cities = predefinedLocations[country].map((city, index) => ({
            id: index,
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            isDepot: index === 0
        }));
        
        // Fit map to these cities
        const bounds = L.latLngBounds(cities.map(city => [city.lat, city.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
        
        updateCityMarkers();
        updateHeatmap();
    }
}

// Add a custom point when in custom mode
function addCustomPoint(lat, lng) {
    const cityId = cities.length;
    cities.push({
        id: cityId,
        name: cityId === 0 ? 'Depot' : `City ${cityId}`,
        lat: lat,
        lng: lng,
        isDepot: cityId === 0
    });
    
    updateCityMarkers();
    updateHeatmap();
    
    if (cities.length >= 3) {
    solveBtn.disabled = false;
    }
}

// Clear all cities
function clearCities() {
    cities = [];
    bestRoute = [];
    
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    
    // Clear all markers
    cityMarkers.forEach(marker => map.removeLayer(marker));
    cityMarkers = [];
    
    solveBtn.disabled = true;
    visualizeBtn.disabled = true;
    distanceSpan.textContent = '-';
    iterationsSpan.textContent = '-';
    timeSpan.textContent = '-';
    improvementSpan.textContent = '-';
    
    heatmapLayer.setData({ max: 10, data: [] });
}

// Update city markers on the map
function updateCityMarkers() {
    // Remove existing markers
    cityMarkers.forEach(marker => map.removeLayer(marker));
    cityMarkers = [];
    
    // Add markers for each city
    cities.forEach(city => {
        const markerIcon = L.divIcon({
            className: `custom-marker-icon ${city.isDepot ? 'depot' : ''}`,
            html: `<div style="width: 10px; height: 10px;"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });
        
        const marker = L.marker([city.lat, city.lng], { icon: markerIcon });
        
        if (showLabels) {
            marker.bindTooltip(city.name, {
                permanent: true,
                direction: 'top',
                offset: [0, -5]
            });
        }
        
        marker.addTo(map);
        cityMarkers.push(marker);
    });
}

// Calculate distance between two cities
function calculateDistance(city1, city2) {
    if (mapType === 'random') {
        // Euclidean distance for random mode
        const dx = city1.lat - city2.lat;
        const dy = city1.lng - city2.lng;
    return Math.sqrt(dx * dx + dy * dy);
    } else {
        // Haversine formula for real-world distances
        const R = 6371; // Earth's radius in km
        const dLat = (city2.lat - city1.lat) * Math.PI / 180;
        const dLon = (city2.lng - city1.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(city1.lat * Math.PI / 180) * Math.cos(city2.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }
}

// Calculate total route distance
function calculateTotalDistance(route) {
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
        totalDistance += calculateDistance(cities[route[i]], cities[route[i + 1]]);
    }
    
    // Add distance back to depot (first city)
    totalDistance += calculateDistance(cities[route[route.length - 1]], cities[route[0]]);
    
    return totalDistance;
}

// Calculate initial random route distance
function calculateRandomRouteDistance() {
    const randomRoute = [0];
    
    // Generate a random route for initial comparison
    const remainingCities = Array.from({length: cities.length - 1}, (_, i) => i + 1);
    while (remainingCities.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingCities.length);
        randomRoute.push(remainingCities[randomIndex]);
        remainingCities.splice(randomIndex, 1);
    }
    
    return calculateTotalDistance(randomRoute);
}

// Draw route on the map
function drawRoute(route, color = '#3498db', weight = 3, opacity = 0.7) {
    // Remove existing route
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    
    // Create a polyline for the route
    const routePoints = route.map(cityId => [cities[cityId].lat, cities[cityId].lng]);
    // Add the first point again to complete the loop
    routePoints.push([cities[route[0]].lat, cities[route[0]].lng]);
    
    routeLayer = L.polyline(routePoints, {
        color: color,
        weight: weight,
        opacity: opacity,
        lineJoin: 'round'
    }).addTo(map);
    
    // Fit the map to the route
    if (mapType !== 'random') {
        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    }
}

// Show an alert message
function showAlert(message) {
    alert(message);
}

// Solve TSP using the selected algorithm
function solveTSP() {
    if (cities.length < 3) {
        showAlert("Please generate at least 3 cities");
        return;
    }
    
    const algorithm = algorithmSelect.value;
    const startTime = performance.now();
    
    // Reset convergence data
    convergenceData = [];
    
    let result;
    if (algorithm === 'abc') {
        const colonySize = parseInt(document.getElementById('abc-colony-size').value);
        const maxIterations = parseInt(document.getElementById('abc-max-iterations').value);
        const limit = parseInt(document.getElementById('abc-limit').value);
        
        result = solveWithABC(colonySize, maxIterations, limit);
        bestRoute = result.bestRoute;
        
        iterationsSpan.textContent = result.iterations;
    } else if (algorithm === 'ga') {
        const populationSize = parseInt(document.getElementById('ga-population-size').value);
        const maxGenerations = parseInt(document.getElementById('ga-max-generations').value);
        const mutationRate = parseFloat(document.getElementById('ga-mutation-rate').value);
        const crossoverRate = parseFloat(document.getElementById('ga-crossover-rate').value);
        
        result = solveWithGA(populationSize, maxGenerations, mutationRate, crossoverRate);
        bestRoute = result.bestRoute;
        
        iterationsSpan.textContent = result.generations;
    } else { // hybrid
        const populationSize = parseInt(document.getElementById('hybrid-population-size').value);
        const maxIterations = parseInt(document.getElementById('hybrid-max-iterations').value);
        const limit = parseInt(document.getElementById('hybrid-limit').value);
        const mutationRate = parseFloat(document.getElementById('hybrid-mutation-rate').value);
        const crossoverRate = parseFloat(document.getElementById('hybrid-crossover-rate').value);
        const abcPhase = parseInt(document.getElementById('hybrid-abc-phase').value);
        const gaPhase = parseInt(document.getElementById('hybrid-ga-phase').value);
        
        result = solveWithHybrid(populationSize, maxIterations, limit, mutationRate, crossoverRate, abcPhase, gaPhase);
        bestRoute = result.bestRoute;
        
        iterationsSpan.textContent = result.iterations;
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    timeSpan.textContent = executionTime.toFixed(2);
    
    // Add depot as starting point if not already there
    if (bestRoute[0] !== 0) {
        bestRoute = [0, ...bestRoute.filter(cityId => cityId !== 0)];
    }
    
    finalDistance = calculateTotalDistance(bestRoute);
    distanceSpan.textContent = finalDistance.toFixed(2);
    
    // Calculate improvement
    const improvementPercentage = ((initialDistance - finalDistance) / initialDistance) * 100;
    improvementSpan.textContent = improvementPercentage.toFixed(2) + '%';
    
    // Draw the best route
    drawRoute(bestRoute, '#3498db', 4, 0.8);
    
    visualizeBtn.disabled = false;
    
    // Add to solution history
    addToSolutionHistory(algorithm, cities.length, finalDistance, executionTime, improvementPercentage);
    
    // Update algorithm comparison chart
    updateComparisonChart(algorithm, finalDistance);
    
    // Ensure convergence data has values and log them
    console.log("Final convergence data:", convergenceData);
    if (convergenceData.length === 0) {
        console.warn("No convergence data was collected!");
    }
    
    // Draw convergence chart
    drawConvergenceChart();
}

// Solve TSP using Artificial Bee Colony algorithm
function solveWithABC(colonySize, maxIterations, limit) {
    // Initialize variables
    const numCities = cities.length;
    let solutions = [];
    let abandonmentCounter = Array(colonySize).fill(0);
    
    // Initialize food sources (solutions)
    for (let i = 0; i < colonySize; i++) {
        let solution = [0]; // Start with depot
        
        // Generate random permutation for remaining cities
        let remainingCities = Array.from({length: numCities - 1}, (_, j) => j + 1);
        while (remainingCities.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingCities.length);
            solution.push(remainingCities[randomIndex]);
            remainingCities.splice(randomIndex, 1);
        }
        
        const distance = calculateTotalDistance(solution);
        solutions.push({
            route: solution,
            fitness: 1 / distance,
            distance: distance
        });
    }
    
    let bestSolution = {...solutions[0]};
    
    // Find initial best solution
    for (let i = 1; i < solutions.length; i++) {
        if (solutions[i].fitness > bestSolution.fitness) {
            bestSolution = {...solutions[i]};
        }
    }
    
    // Track initial best distance for convergence
    convergenceData.push(bestSolution.distance);
    console.log("Initial best distance:", bestSolution.distance);
    
    // Main ABC algorithm loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Employed bee phase
        for (let i = 0; i < colonySize; i++) {
            const currentSolution = solutions[i].route.slice();
            
            // Select two random positions to swap (excluding depot)
            const pos1 = 1 + Math.floor(Math.random() * (numCities - 1));
            let pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
            while (pos2 === pos1) {
                pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
            }
            
            // Create neighbor by swapping
            const neighborSolution = currentSolution.slice();
            [neighborSolution[pos1], neighborSolution[pos2]] = [neighborSolution[pos2], neighborSolution[pos1]];
            
            const neighborDistance = calculateTotalDistance(neighborSolution);
            const neighborFitness = 1 / neighborDistance;
            
            // Greedy selection
            if (neighborFitness > solutions[i].fitness) {
                solutions[i].route = neighborSolution;
                solutions[i].fitness = neighborFitness;
                solutions[i].distance = neighborDistance;
                abandonmentCounter[i] = 0;
            } else {
                abandonmentCounter[i]++;
            }
        }
        
        // Calculate probabilities for onlooker bee phase
        const totalFitness = solutions.reduce((sum, s) => sum + s.fitness, 0);
        const probabilities = solutions.map(s => s.fitness / totalFitness);
        
        // Onlooker bee phase
        let t = 0;
        let i = 0;
        
        while (t < colonySize) {
            if (Math.random() < probabilities[i]) {
                t++;
                
                const currentSolution = solutions[i].route.slice();
                
                // Select two random positions to swap (excluding depot)
                const pos1 = 1 + Math.floor(Math.random() * (numCities - 1));
                let pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                while (pos2 === pos1) {
                    pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                }
                
                // Create neighbor by swapping
                const neighborSolution = currentSolution.slice();
                [neighborSolution[pos1], neighborSolution[pos2]] = [neighborSolution[pos2], neighborSolution[pos1]];
                
                const neighborDistance = calculateTotalDistance(neighborSolution);
                const neighborFitness = 1 / neighborDistance;
                
                // Greedy selection
                if (neighborFitness > solutions[i].fitness) {
                    solutions[i].route = neighborSolution;
                    solutions[i].fitness = neighborFitness;
                    solutions[i].distance = neighborDistance;
                    abandonmentCounter[i] = 0;
                } else {
                    abandonmentCounter[i]++;
                }
            }
            
            i = (i + 1) % colonySize;
        }
        
        // Scout bee phase
        for (let i = 0; i < colonySize; i++) {
            if (abandonmentCounter[i] >= limit) {
                let solution = [0]; // Start with depot
                
                // Generate random permutation for remaining cities
                let remainingCities = Array.from({length: numCities - 1}, (_, j) => j + 1);
                while (remainingCities.length > 0) {
                    const randomIndex = Math.floor(Math.random() * remainingCities.length);
                    solution.push(remainingCities[randomIndex]);
                    remainingCities.splice(randomIndex, 1);
                }
                
                const distance = calculateTotalDistance(solution);
                solutions[i] = {
                    route: solution,
                    fitness: 1 / distance,
                    distance: distance
                };
                
                abandonmentCounter[i] = 0;
            }
        }
        
        // Update best solution
        for (let i = 0; i < solutions.length; i++) {
            if (solutions[i].fitness > bestSolution.fitness) {
                bestSolution = {...solutions[i]};
            }
        }
        
        // Track best distance for convergence
        convergenceData.push(bestSolution.distance);
        
        if (iteration % 10 === 0) {
            console.log(`Iteration ${iteration}: Best distance = ${bestSolution.distance}`);
        }
    }
    
    return {
        bestRoute: bestSolution.route,
        iterations: maxIterations
    };
}

// Solve TSP using Genetic Algorithm
function solveWithGA(populationSize, maxGenerations, mutationRate, crossoverRate) {
    // Initialize population
    let population = [];
    const numCities = cities.length;
    
    // Generate initial population with random permutations
    for (let i = 0; i < populationSize; i++) {
        let individual = [0]; // Start with depot
        
        // Generate random permutation for remaining cities
        let remainingCities = Array.from({length: numCities - 1}, (_, j) => j + 1);
        while (remainingCities.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingCities.length);
            individual.push(remainingCities[randomIndex]);
            remainingCities.splice(randomIndex, 1);
        }
        
        const distance = calculateTotalDistance(individual);
        population.push({
            route: individual,
            fitness: 1 / distance,
            distance: distance
        });
    }
    
    let bestIndividual = {...population[0]};
    
    // Find initial best individual
    for (let i = 1; i < population.length; i++) {
        if (population[i].fitness > bestIndividual.fitness) {
            bestIndividual = {...population[i]};
        }
    }
    
    // Track initial best distance for convergence
    convergenceData.push(bestIndividual.distance);
    console.log("Initial best distance (GA):", bestIndividual.distance);
    
    // Main GA loop
    for (let generation = 0; generation < maxGenerations; generation++) {
        // Selection (tournament selection)
        const tournamentSize = 3;
        let newPopulation = [];
        
        while (newPopulation.length < populationSize) {
            // Select parents through tournament selection
            const parent1 = tournamentSelection(population, tournamentSize);
            const parent2 = tournamentSelection(population, tournamentSize);
            
            let child1, child2;
            
            // Crossover
            if (Math.random() < crossoverRate) {
                [child1, child2] = orderCrossover(parent1.route, parent2.route);
            } else {
                child1 = parent1.route.slice();
                child2 = parent2.route.slice();
            }
            
            // Mutation
            if (Math.random() < mutationRate) {
                swapMutation(child1);
            }
            
            if (Math.random() < mutationRate) {
                swapMutation(child2);
            }
            
            // Add children to new population
            const distance1 = calculateTotalDistance(child1);
            newPopulation.push({
                route: child1,
                fitness: 1 / distance1,
                distance: distance1
            });
            
            if (newPopulation.length < populationSize) {
                const distance2 = calculateTotalDistance(child2);
                newPopulation.push({
                    route: child2,
                    fitness: 1 / distance2,
                    distance: distance2
                });
            }
        }
        
        // Replace old population
        population = newPopulation;
        
        // Update best individual
        for (let i = 0; i < population.length; i++) {
            if (population[i].fitness > bestIndividual.fitness) {
                bestIndividual = {...population[i]};
            }
        }
        
        // Track best distance for convergence
        convergenceData.push(bestIndividual.distance);
        
        if (generation % 10 === 0) {
            console.log(`Generation ${generation}: Best distance = ${bestIndividual.distance}`);
        }
    }
    
    return {
        bestRoute: bestIndividual.route,
        generations: maxGenerations
    };
}

// Tournament selection for GA
function tournamentSelection(population, tournamentSize) {
    let tournament = [];
    
    // Randomly select individuals for the tournament
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
    }
    
    // Find the best individual in the tournament
    let best = tournament[0];
    for (let i = 1; i < tournament.length; i++) {
        if (tournament[i].fitness > best.fitness) {
            best = tournament[i];
        }
    }
    
    return best;
}

// Order crossover for GA
function orderCrossover(parent1, parent2) {
    const length = parent1.length;
    
    // Select crossover points
    const start = 1 + Math.floor(Math.random() * (length - 2));
    const end = start + 1 + Math.floor(Math.random() * (length - start - 1));
    
    // Create offspring
    const offspring1 = Array(length).fill(null);
    const offspring2 = Array(length).fill(null);
    
    // Copy depot (first position is always depot)
    offspring1[0] = parent1[0];
    offspring2[0] = parent2[0];
    
    // Copy middle section from parent to offspring
    for (let i = start; i <= end; i++) {
        offspring1[i] = parent1[i];
        offspring2[i] = parent2[i];
    }
    
    // Fill the remaining positions
    fillRemaining(parent2, offspring1, start, end);
    fillRemaining(parent1, offspring2, start, end);
    
    return [offspring1, offspring2];
}

// Helper function for order crossover
function fillRemaining(parent, offspring, start, end) {
    const length = parent.length;
    
    // Create a set of cities already in the offspring
    const existingCities = new Set();
    for (let i = 0; i < length; i++) {
        if (offspring[i] !== null) {
            existingCities.add(offspring[i]);
        }
    }
    
    // Fill remaining positions from parent
    let parentIdx = 1; // Start after depot
    
    for (let i = 1; i < length; i++) {
        if (i >= start && i <= end) continue; // Skip the middle section
        
        // Find the next city from parent that's not already in offspring
        while (existingCities.has(parent[parentIdx])) {
            parentIdx = (parentIdx + 1) % length;
            if (parentIdx === 0) parentIdx = 1; // Skip depot
        }
        
        offspring[i] = parent[parentIdx];
        existingCities.add(parent[parentIdx]);
        parentIdx = (parentIdx + 1) % length;
        if (parentIdx === 0) parentIdx = 1; // Skip depot
    }
}

// Swap mutation for GA
function swapMutation(route) {
    // Select two random positions to swap (excluding depot)
    const pos1 = 1 + Math.floor(Math.random() * (route.length - 1));
    let pos2 = 1 + Math.floor(Math.random() * (route.length - 1));
    while (pos2 === pos1) {
        pos2 = 1 + Math.floor(Math.random() * (route.length - 1));
    }
    
    // Swap the cities
    [route[pos1], route[pos2]] = [route[pos2], route[pos1]];
}

// Solve TSP using Hybrid ABC/GA
function solveWithHybrid(populationSize, maxIterations, limit, mutationRate, crossoverRate, abcPhase, gaPhase) {
    const numCities = cities.length;
    let population = [];
    let abandonmentCounter = Array(populationSize).fill(0);
    
    // Initialize population with random solutions
    for (let i = 0; i < populationSize; i++) {
        let solution = [0]; // Start with depot
        
        // Generate random permutation for remaining cities
        let remainingCities = Array.from({length: numCities - 1}, (_, j) => j + 1);
        while (remainingCities.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingCities.length);
            solution.push(remainingCities[randomIndex]);
remainingCities.splice(randomIndex, 1);
        }
        
        const distance = calculateTotalDistance(solution);
        population.push({
            route: solution,
            fitness: 1 / distance,
            distance: distance
        });
    }
    
    let bestSolution = {...population[0]};
    
    // Find initial best solution
    for (let i = 1; i < population.length; i++) {
        if (population[i].fitness > bestSolution.fitness) {
            bestSolution = {...population[i]};
        }
    }
    
    // Track initial best distance for convergence
    convergenceData.push(bestSolution.distance);
    console.log("Initial best distance (Hybrid):", bestSolution.distance);
    
    // Main hybrid algorithm loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Alternate between ABC and GA phases
        if (iteration % (abcPhase + gaPhase) < abcPhase) {
            // ABC Phase
            
            // Employed bee phase
            for (let i = 0; i < populationSize; i++) {
                const currentSolution = population[i].route.slice();
                
                // Select two random positions to swap (excluding depot)
                const pos1 = 1 + Math.floor(Math.random() * (numCities - 1));
                let pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                while (pos2 === pos1) {
                    pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                }
                
                // Create neighbor by swapping
                const neighborSolution = currentSolution.slice();
                [neighborSolution[pos1], neighborSolution[pos2]] = [neighborSolution[pos2], neighborSolution[pos1]];
                
                const neighborDistance = calculateTotalDistance(neighborSolution);
                const neighborFitness = 1 / neighborDistance;
                
                // Greedy selection
                if (neighborFitness > population[i].fitness) {
                    population[i].route = neighborSolution;
                    population[i].fitness = neighborFitness;
                    population[i].distance = neighborDistance;
                    abandonmentCounter[i] = 0;
                } else {
                    abandonmentCounter[i]++;
                }
            }
            
            // Calculate probabilities for onlooker bee phase
            const totalFitness = population.reduce((sum, s) => sum + s.fitness, 0);
            const probabilities = population.map(s => s.fitness / totalFitness);
            
            // Onlooker bee phase
            let t = 0;
            let i = 0;
            
            while (t < populationSize) {
                if (Math.random() < probabilities[i]) {
                    t++;
                    
                    const currentSolution = population[i].route.slice();
                    
                    // Select two random positions to swap (excluding depot)
                    const pos1 = 1 + Math.floor(Math.random() * (numCities - 1));
                    let pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                    while (pos2 === pos1) {
                        pos2 = 1 + Math.floor(Math.random() * (numCities - 1));
                    }
                    
                    // Create neighbor by swapping
                    const neighborSolution = currentSolution.slice();
                    [neighborSolution[pos1], neighborSolution[pos2]] = [neighborSolution[pos2], neighborSolution[pos1]];
                    
                    const neighborDistance = calculateTotalDistance(neighborSolution);
                    const neighborFitness = 1 / neighborDistance;
                    
                    // Greedy selection
                    if (neighborFitness > population[i].fitness) {
                        population[i].route = neighborSolution;
                        population[i].fitness = neighborFitness;
                        population[i].distance = neighborDistance;
                        abandonmentCounter[i] = 0;
                    } else {
                        abandonmentCounter[i]++;
                    }
                }
                
                i = (i + 1) % populationSize;
            }
            
            // Scout bee phase
            for (let i = 0; i < populationSize; i++) {
                if (abandonmentCounter[i] >= limit) {
                    let solution = [0]; // Start with depot
                    
                    // Generate random permutation for remaining cities
                    let remainingCities = Array.from({length: numCities - 1}, (_, j) => j + 1);
                    while (remainingCities.length > 0) {
                        const randomIndex = Math.floor(Math.random() * remainingCities.length);
                        solution.push(remainingCities[randomIndex]);
                        remainingCities.splice(randomIndex, 1);
                    }
                    
                    const distance = calculateTotalDistance(solution);
                    population[i] = {
                        route: solution,
                        fitness: 1 / distance,
                        distance: distance
                    };
                    
                    abandonmentCounter[i] = 0;
                }
            }
        } else {
            // GA Phase
            
            // Selection (tournament selection)
            const tournamentSize = 3;
            let newPopulation = [];
            
            while (newPopulation.length < populationSize) {
                // Select parents through tournament selection
                const parent1 = tournamentSelection(population, tournamentSize);
                const parent2 = tournamentSelection(population, tournamentSize);
                
                let child1, child2;
                
                // Crossover
                if (Math.random() < crossoverRate) {
                    [child1, child2] = orderCrossover(parent1.route, parent2.route);
                } else {
                    child1 = parent1.route.slice();
                    child2 = parent2.route.slice();
                }
                
                // Mutation
                if (Math.random() < mutationRate) {
                    swapMutation(child1);
                }
                
                if (Math.random() < mutationRate) {
                    swapMutation(child2);
                }
                
                // Add children to new population
                const distance1 = calculateTotalDistance(child1);
                newPopulation.push({
                    route: child1,
                    fitness: 1 / distance1,
                    distance: distance1
                });
                
                if (newPopulation.length < populationSize) {
                    const distance2 = calculateTotalDistance(child2);
                    newPopulation.push({
                        route: child2,
                        fitness: 1 / distance2,
                        distance: distance2
                    });
                }
            }
            
            // Replace old population and reset abandonment counters
            population = newPopulation;
            abandonmentCounter = Array(populationSize).fill(0);
        }
        
        // Update best solution
        for (let i = 0; i < population.length; i++) {
            if (population[i].fitness > bestSolution.fitness) {
                bestSolution = {...population[i]};
            }
        }
        
        // Track best distance for convergence
        convergenceData.push(bestSolution.distance);
        
        if (iteration % 10 === 0) {
            console.log(`Iteration ${iteration} (Hybrid): Best distance = ${bestSolution.distance}`);
        }
    }
    
    return {
        bestRoute: bestSolution.route,
        iterations: maxIterations
    };
}

// Draw algorithm comparison chart
function drawComparisonChart() {
    const container = document.getElementById('comparison-chart');
    
    // Check if the element exists
    if (!container) {
        console.error("Cannot find comparison-chart element");
        return;
    }
    
    // Find or create canvas element
    let ctx = container.querySelector('canvas');
    if (!ctx) {
        // Create a canvas element
        ctx = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(ctx);
    }
    
    // Destroy previous chart if it exists
    if (window.comparisonChart) {
        window.comparisonChart.destroy();
    }
    
    try {
        // Create the chart
        window.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: algorithmComparisonData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return value ? `Distance: ${value.toFixed(2)}` : 'No data';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Distance'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
        console.log("Comparison chart created successfully");
    } catch (error) {
        console.error("Error creating comparison chart:", error);
    }
}

// Draw convergence chart using Chart.js
function drawConvergenceChart() {
    if (convergenceData.length === 0) {
        console.warn("No convergence data to display");
        return;
    }
    
    const container = document.getElementById('convergence-chart');
    
    // Check if the element exists
    if (!container) {
        console.error("Cannot find convergence-chart element");
        return;
    }
    
    // Find or create canvas element
    let ctx = container.querySelector('canvas');
    if (!ctx) {
        // Create a canvas element
        ctx = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(ctx);
    }
    
    // Ensure we're getting valid data
    console.log("Convergence data:", convergenceData);
    
    // Destroy previous chart if it exists
    if (window.convergenceChart) {
        window.convergenceChart.destroy();
    }
    
    // Prepare labels and data
    const labels = Array.from({length: convergenceData.length}, (_, i) => i);
    
    // Ensure data is numeric and valid
    const sanitizedData = convergenceData.map(value => {
        // Check if value is valid number
        if (isNaN(value) || value === Infinity || value === -Infinity) {
            console.warn("Invalid convergence value:", value);
            return 0;
        }
        return value;
    });
    
    try {
        // Create the chart
        window.convergenceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Path Distance',
                    data: sanitizedData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Distance: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Distance'
                        },
                        min: Math.min(...sanitizedData.filter(v => v > 0)) * 0.98 || 0
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Iteration'
                        }
                    }
                }
            }
        });
        
        // Log success
        console.log("Convergence chart created successfully");
    } catch (error) {
        console.error("Error creating convergence chart:", error);
    }
}

// Animate the path visualization
function visualizePath() {
    if (isVisualizing || bestRoute.length === 0) return;
    
    isVisualizing = true;
    stopBtn.disabled = false;
    visualizeBtn.disabled = true;
    
    // Clear previous route
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    
    // Update markers to highlight current path
    updateCityMarkers();
    
    let currentIdx = 0;
    const visitedCities = [bestRoute[0]];
    
    // Add info overlay to map
    const infoOverlay = L.control({position: 'bottomright'});
    infoOverlay.onAdd = function() {
        const div = L.DomUtil.create('div', 'info-overlay');
        div.innerHTML = `<p>Visiting: <span id="current-city">${cities[bestRoute[0]].name}</span></p>
                         <p>Next: <span id="next-city">${cities[bestRoute[1]].name}</span></p>`;
        return div;
    };
    infoOverlay.addTo(map);
    
    // Animation function
    function animate() {
        if (currentIdx < bestRoute.length - 1) {
            currentIdx++;
            visitedCities.push(bestRoute[currentIdx]);
            
            // Update the current city info
            document.getElementById('current-city').textContent = cities[bestRoute[currentIdx]].name;
            if (currentIdx < bestRoute.length - 1) {
                document.getElementById('next-city').textContent = cities[bestRoute[currentIdx + 1]].name;
            } else {
                document.getElementById('next-city').textContent = cities[bestRoute[0]].name;
            }
            
            // Highlight current city marker
            cityMarkers.forEach(marker => {
                map.removeLayer(marker);
            });
            cityMarkers = [];
            
            cities.forEach((city, idx) => {
                const isCurrentCity = (city.id === bestRoute[currentIdx]);
                
                const markerIcon = L.divIcon({
                    className: `custom-marker-icon ${city.isDepot ? 'depot' : ''} ${isCurrentCity ? 'current' : ''}`,
                    html: `<div style="width: 10px; height: 10px;"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5]
                });
                
                const marker = L.marker([city.lat, city.lng], { icon: markerIcon });
                
                if (showLabels) {
                    marker.bindTooltip(city.name, {
                        permanent: true,
                        direction: 'top',
                        offset: [0, -5]
                    });
                }
                
                marker.addTo(map);
                cityMarkers.push(marker);
            });
            
            // Draw route so far
            const routePoints = visitedCities.map(cityId => [cities[cityId].lat, cities[cityId].lng]);
            
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            
            routeLayer = L.polyline(routePoints, {
                color: '#3498db',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);
            
            // Show future path as dotted line
            if (currentIdx < bestRoute.length - 1) {
                const remainingPoints = bestRoute.slice(currentIdx).map(cityId => [cities[cityId].lat, cities[cityId].lng]);
                remainingPoints.push([cities[bestRoute[0]].lat, cities[bestRoute[0]].lng]); // Back to start
                
                const futurePath = L.polyline(remainingPoints, {
                    color: '#e74c3c',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 5',
                    lineJoin: 'round'
                }).addTo(map);
                
                // Add to routeLayer group
                if (!routeLayer._layers) {
                    const tempRouteLayer = routeLayer;
                    routeLayer = L.layerGroup([tempRouteLayer, futurePath]);
                } else {
                    routeLayer.addLayer(futurePath);
                }
            }
            
            // Schedule next step
            animationId = setTimeout(animate, 800);
        } else {
            // Draw final connection back to depot
            const completeRoute = [...visitedCities, bestRoute[0]];
            const routePoints = completeRoute.map(cityId => [cities[cityId].lat, cities[cityId].lng]);
            
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            
            routeLayer = L.polyline(routePoints, {
                color: '#3498db',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);
            
            // Update info overlay
            document.getElementById('current-city').textContent = cities[bestRoute[0]].name;
            document.getElementById('next-city').textContent = 'Complete';
            
            // Reset visualization state
            isVisualizing = false;
            visualizeBtn.disabled = false;
            stopBtn.disabled = true;
            
            // Remove info overlay after delay
            setTimeout(() => {
                map.removeControl(infoOverlay);
                updateCityMarkers();
            }, 2000);
        }
    }
    
    // Start animation
    animate();
}

// Stop visualization
function stopVisualization() {
    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }
    
    isVisualizing = false;
    visualizeBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Remove info overlay
    document.querySelectorAll('.info-overlay').forEach(el => el.remove());
    
    // Redraw complete route
    if (bestRoute.length > 0) {
        updateCityMarkers();
        drawRoute(bestRoute, '#3498db', 4, 0.8);
    }
}

// Add solution to history table
function addToSolutionHistory(algorithm, numCities, distance, time, improvement) {
    const historyEntry = {
        id: solutionHistory.length + 1,
        algorithm: algorithm,
        numCities: numCities,
        distance: distance,
        time: time,
        improvement: improvement
    };
    
    solutionHistory.push(historyEntry);
    
    // Update history table
    const historyTable = document.getElementById('history-table').getElementsByTagName('tbody')[0];
    const row = historyTable.insertRow();
    
    // Add cells
    const idCell = row.insertCell(0);
    const algorithmCell = row.insertCell(1);
    const citiesCell = row.insertCell(2);
    const distanceCell = row.insertCell(3);
    const timeCell = row.insertCell(4);
    const improvementCell = row.insertCell(5);
    
    // Set cell values
    idCell.textContent = historyEntry.id;
    algorithmCell.textContent = getAlgorithmName(historyEntry.algorithm);
    citiesCell.textContent = historyEntry.numCities;
    distanceCell.textContent = historyEntry.distance.toFixed(2);
    timeCell.textContent = historyEntry.time.toFixed(2);
    improvementCell.textContent = historyEntry.improvement.toFixed(2) + '%';
    
    // Highlight row based on algorithm
    if (historyEntry.algorithm === 'abc') {
        row.className = 'table-primary';
    } else if (historyEntry.algorithm === 'ga') {
        row.className = 'table-success';
    } else {
        row.className = 'table-danger';
    }
}

// Get algorithm full name
function getAlgorithmName(algorithm) {
    switch(algorithm) {
        case 'abc': return 'Artificial Bee Colony';
        case 'ga': return 'Genetic Algorithm';
        case 'hybrid': return 'Hybrid ABC/GA';
        default: return algorithm;
    }
}

// Update algorithm comparison chart
function updateComparisonChart(algorithm, distance) {
    // Add to comparison data
    const runLabel = `Run ${algorithmComparisonData.labels.length + 1}`;
    
    // If this is a new run, add a label
    if (!algorithmComparisonData.labels.includes(runLabel)) {
        algorithmComparisonData.labels.push(runLabel);
        
        // Add placeholder data for all algorithms
        algorithmComparisonData.datasets.forEach(dataset => {
            dataset.data.push(null);
        });
    }
    
    // Update the specific algorithm's data
    const datasetIndex = algorithm === 'abc' ? 0 : algorithm === 'ga' ? 1 : 2;
    algorithmComparisonData.datasets[datasetIndex].data[algorithmComparisonData.labels.length - 1] = distance;
    
    // Draw comparison chart
    drawComparisonChart();
}

// Initialize the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Display the correct algorithm parameters
        if (algorithmSelect.value === 'abc') {
            abcParamsDiv.style.display = 'block';
            gaParamsDiv.style.display = 'none';
            hybridParamsDiv.style.display = 'none';
        } else if (algorithmSelect.value === 'ga') {
            abcParamsDiv.style.display = 'none';
            gaParamsDiv.style.display = 'block';
            hybridParamsDiv.style.display = 'none';
        } else { // hybrid
            abcParamsDiv.style.display = 'none';
            gaParamsDiv.style.display = 'none';
            hybridParamsDiv.style.display = 'block';
        }
        
        // Initialize the map
        initMap();
    });
}