// Main variables
let cities = [];
let bestRoute = [];
let isVisualizing = false;
let animationId = null;
let convergenceData = []; // To track progress for visualization
let showDistances = true; // New variable to control distance display

// DOM elements
const mapElement = document.getElementById('map');
const numCitiesInput = document.getElementById('num-cities');
const algorithmSelect = document.getElementById('algorithm');
const abcParamsDiv = document.getElementById('abc-params');
const gaParamsDiv = document.getElementById('ga-params');
const hybridParamsDiv = document.getElementById('hybrid-params');
const generateBtn = document.getElementById('generate-btn');
const solveBtn = document.getElementById('solve-btn');
const visualizeBtn = document.getElementById('visualize-btn');
const stopBtn = document.getElementById('stop-btn');
const distanceSpan = document.getElementById('distance');
const iterationsSpan = document.getElementById('iterations');
const timeSpan = document.getElementById('time');
const convergenceChart = document.getElementById('convergence-chart');

function measureExecutionTime(algorithm, numCities) {
    const start = performance.now();
  
    // Run your algorithm here (simulate for now)
    runAlgorithm(algorithm, numCities);
  
    const end = performance.now();
    return (end - start) / 1000; // time in seconds
}
  
function runAlgorithm(algorithm, numCities) {
    // Simulate different durations
    if (algorithm === 'abc') {
      for (let i = 0; i < numCities * 10000; i++) {} // simulate heavy work
    } else if (algorithm === 'genetic') {
      for (let i = 0; i < numCities * 5000; i++) {}
    } else if (algorithm === 'hybrid') {
      for (let i = 0; i < numCities * 3000; i++) {}
    }
}

function updateTimeComplexityGraph(algorithm) {
    const ctx = document.getElementById('timeComplexityChart').getContext('2d');
    const title = document.getElementById('graphTitle');
  
    let labels = ['10', '20', '30', '40', '50'];
    let data = [];
  
    labels.forEach(num => {
      const timeTaken = measureExecutionTime(algorithm, parseInt(num));
      data.push(timeTaken.toFixed(2));
    });
  
    title.innerText = `Time Complexity - ${algorithm.toUpperCase()} Algorithm`;
  
    if (timeChart) timeChart.destroy();
  
    timeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Execution Time (s)',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Execution Time (s)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Number of Cities'
            }
          }
        }
      }
    });
}
  
function handleAlgorithmChange(selected) {
    drawTSPPath(selected);
    updateTimeComplexityGraph(selected); // now with real-time data!
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

generateBtn.addEventListener('click', generateCities);
solveBtn.addEventListener('click', solveTSP);
visualizeBtn.addEventListener('click', visualizePath);
stopBtn.addEventListener('click', stopVisualization);

// Set default algorithm view
window.addEventListener('DOMContentLoaded', () => {
    // Show hybrid params by default
    abcParamsDiv.style.display = 'none';
    gaParamsDiv.style.display = 'none';
    hybridParamsDiv.style.display = 'block';
});

// Generate random cities
function generateCities() {
    stopVisualization();
    clearMap();
    
    const numCities = parseInt(numCitiesInput.value);
    cities = [];
    
    const mapWidth = mapElement.clientWidth;
    const mapHeight = mapElement.clientHeight;
    
    // Create a depot/starting point (first city)
    cities.push({
        id: 0,
        x: mapWidth / 2,
        y: mapHeight / 2,
        isDepot: true
    });
    
    // Generate random cities
    for (let i = 1; i < numCities; i++) {
        const x = Math.random() * (mapWidth - 40) + 20;
        const y = Math.random() * (mapHeight - 40) + 20;
        
        cities.push({
            id: i,
            x: x,
            y: y,
            isDepot: false
        });
    }
    
    renderCities();
    solveBtn.disabled = false;
    visualizeBtn.disabled = true;
    distanceSpan.textContent = '-';
    iterationsSpan.textContent = '-';
    timeSpan.textContent = '-';
    
    // Clear convergence chart
    convergenceChart.innerHTML = '';
}

// Render cities on the map
function renderCities() {
    clearMap();
    
    cities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'city';
        if (city.isDepot) {
            cityElement.classList.add('depot');
        }
        cityElement.style.left = `${city.x}px`;
        cityElement.style.top = `${city.y}px`;
        
        const labelElement = document.createElement('div');
        labelElement.className = 'city-label';
        labelElement.textContent = city.id;
        
        cityElement.appendChild(labelElement);
        mapElement.appendChild(cityElement);
    });
}

// Clear the map
function clearMap() {
    while (mapElement.firstChild) {
        mapElement.removeChild(mapElement.firstChild);
    }
}

// Calculate distance between two cities
function calculateDistance(city1, city2) {
    const dx = city1.x - city2.x;
    const dy = city1.y - city2.y;
    return Math.sqrt(dx * dx + dy * dy);
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

// Draw a line between two cities
function drawLine(city1, city2, color = 'black', width = 2) {
    const x1 = city1.x;
    const y1 = city1.y;
    const x2 = city2.x;
    const y2 = city2.y;
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    const line = document.createElement('div');
    line.className = 'path';
    line.style.width = `${length}px`;
    line.style.height = `${width}px`;
    line.style.backgroundColor = color;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    
    mapElement.appendChild(line);
    
    // Add distance label if showDistances is true
    if (showDistances) {
        const distance = calculateDistance(city1, city2);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        const distanceLabel = document.createElement('div');
        distanceLabel.className = 'distance-label';
        distanceLabel.textContent = distance.toFixed(1);
        distanceLabel.style.left = `${midX}px`;
        distanceLabel.style.top = `${midY}px`;
        
        // Offset the label a bit to avoid overlapping with the line
        const offsetX = Math.sin(angle * Math.PI / 180) * 10;
        const offsetY = -Math.cos(angle * Math.PI / 180) * 10;
        
        distanceLabel.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`;
        
        mapElement.appendChild(distanceLabel);
    }
}

// Draw the complete route
function drawRoute(route, color = 'black', width = 2) {
    for (let i = 0; i < route.length - 1; i++) {
        drawLine(cities[route[i]], cities[route[i + 1]], color, width);
    }
    
    // Draw line back to depot
    drawLine(cities[route[route.length - 1]], cities[route[0]], color, width);
}

// Solve TSP using the selected algorithm
function solveTSP() {
    if (cities.length < 3) {
        alert("Please generate at least 3 cities");
        return;
    }
    
    const algorithm = algorithmSelect.value;
    const startTime = performance.now();
    
    // Reset convergence data
    convergenceData = [];
    
    if (algorithm === 'abc') {
        const colonySize = parseInt(document.getElementById('abc-colony-size').value);
        const maxIterations = parseInt(document.getElementById('abc-max-iterations').value);
        const limit = parseInt(document.getElementById('abc-limit').value);
        
        const result = solveWithABC(colonySize, maxIterations, limit);
        bestRoute = result.bestRoute;
        
        iterationsSpan.textContent = result.iterations;
    } else if (algorithm === 'ga') {
        const populationSize = parseInt(document.getElementById('ga-population-size').value);
        const maxGenerations = parseInt(document.getElementById('ga-max-generations').value);
        const mutationRate = parseFloat(document.getElementById('ga-mutation-rate').value);
        const crossoverRate = parseFloat(document.getElementById('ga-crossover-rate').value);
        
        const result = solveWithGA(populationSize, maxGenerations, mutationRate, crossoverRate);
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
        
        const result = solveWithHybrid(populationSize, maxIterations, limit, mutationRate, crossoverRate, abcPhase, gaPhase);
        bestRoute = result.bestRoute;
        
        iterationsSpan.textContent = result.iterations;
    }
    
    const endTime = performance.now();
    timeSpan.textContent = (endTime - startTime).toFixed(2);
    
    // Add depot as starting point if not already there
    if (bestRoute[0] !== 0) {
        bestRoute = [0, ...bestRoute.filter(cityId => cityId !== 0)];
    }
    
    const totalDistance = calculateTotalDistance(bestRoute);
    distanceSpan.textContent = totalDistance.toFixed(2);
    
    // Clear previous route and draw the best route
    renderCities();
    drawRoute(bestRoute, '#4CAF50', 3);
    
    visualizeBtn.disabled = false;
    
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
        
        solutions.push({
            route: solution,
            fitness: 1 / calculateTotalDistance(solution)
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
    convergenceData.push(1 / bestSolution.fitness);
    
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
            
            const neighborFitness = 1 / calculateTotalDistance(neighborSolution);
            
            // Greedy selection
            if (neighborFitness > solutions[i].fitness) {
                solutions[i].route = neighborSolution;
                solutions[i].fitness = neighborFitness;
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
                
                const neighborFitness = 1 / calculateTotalDistance(neighborSolution);
                
                // Greedy selection
                if (neighborFitness > solutions[i].fitness) {
                    solutions[i].route = neighborSolution;
                    solutions[i].fitness = neighborFitness;
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
                
                solutions[i] = {
                    route: solution,
                    fitness: 1 / calculateTotalDistance(solution)
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
        convergenceData.push(1 / bestSolution.fitness);
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
        
        population.push({
            route: individual,
            fitness: 1 / calculateTotalDistance(individual)
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
    convergenceData.push(1 / bestIndividual.fitness);
    
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
            newPopulation.push({
                route: child1,
                fitness: 1 / calculateTotalDistance(child1)
            });
            
            if (newPopulation.length < populationSize) {
                newPopulation.push({
                    route: child2,
                    fitness: 1 / calculateTotalDistance(child2)
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
        convergenceData.push(1 / bestIndividual.fitness);
    }
    
    return {
        bestRoute: bestIndividual.route,
        generations: maxGenerations
    };
}

// Tournament selection for GA
function tournamentSelection(population, tournamentSize) {
    let tournament = [];
    
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
        current.fitness > best.fitness ? current : best, tournament[0]);
}

// Order crossover (OX) for GA
function orderCrossover(parent1, parent2) {
    const length = parent1.length;
    
    // Select random subsequence
    const start = 1 + Math.floor(Math.random() * (length - 2));
    const end = 1 + start + Math.floor(Math.random() * (length - start - 1));
    
    // Initialize offspring with depot at start
    const offspring1 = Array(length).fill(-1);
    const offspring2 = Array(length).fill(-1);
    
    offspring1[0] = 0;
    offspring2[0] = 0;
    
    // Copy subsequence from parents
    for (let i = start; i <= end; i++) {
        offspring1[i] = parent1[i];
        offspring2[i] = parent2[i];
    }
    
    // Fill remaining positions
    fillRemaining(parent2, offspring1, start, end);
    fillRemaining(parent1, offspring2, start, end);
    
    return [offspring1, offspring2];
}

// Helper function for order crossover
function fillRemaining(parent, offspring, start, end) {
    const length = parent.length;
    let position = 1;
    
    for (let i = 1; i < length; i++) {
        // Skip the subsequence that's already filled
        if (position >= start && position <= end) {
            position = end + 1;
        }
        
        // If we've reached the end, stop
        if (position >= length) {
            break;
        }
        
        // Find the next city from parent that's not already in offspring
        const nextCity = parent[i];
        if (!offspring.includes(nextCity)) {
            offspring[position] = nextCity;
            position++;
        }
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
    
    // Swap
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
        
        population.push({
            route: solution,
            fitness: 1 / calculateTotalDistance(solution)
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
    convergenceData.push(1 / bestSolution.fitness);
    
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
                
                const neighborFitness = 1 / calculateTotalDistance(neighborSolution);
                
                // Greedy selection
                if (neighborFitness > population[i].fitness) {
                    population[i].route = neighborSolution;
                    population[i].fitness = neighborFitness;
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
                    
                    const neighborFitness = 1 / calculateTotalDistance(neighborSolution);
                    
                    // Greedy selection
                    if (neighborFitness > population[i].fitness) {
                        population[i].route = neighborSolution;
                        population[i].fitness = neighborFitness;
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
                    
                    population[i] = {
                        route: solution,
                        fitness: 1 / calculateTotalDistance(solution)
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
                newPopulation.push({
                    route: child1,
                    fitness: 1 / calculateTotalDistance(child1)
                });
                
                if (newPopulation.length < populationSize) {
                    newPopulation.push({
                        route: child2,
                        fitness: 1 / calculateTotalDistance(child2)
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
        convergenceData.push(1 / bestSolution.fitness);
    }
    
    return {
        bestRoute: bestSolution.route,
        iterations: maxIterations
    };
}

// Draw convergence chart
function drawConvergenceChart() {
    if (convergenceData.length === 0) return;
    
    convergenceChart.innerHTML = '';
    
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = convergenceChart.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width + margin.left + margin.right);
    svg.setAttribute('height', height + margin.top + margin.bottom);
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);
    
    // Add X axis
    const xMax = convergenceData.length - 1;
    const xScale = (x) => (x / xMax) * width;
    
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${height})`);
    
    // X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', width);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('stroke', 'black');
    xAxis.appendChild(xAxisLine);
    
    // X axis ticks
    const xTickCount = Math.min(10, convergenceData.length);
    const xTickStep = Math.max(1, Math.floor(convergenceData.length / xTickCount));
    
    for (let i = 0; i <= convergenceData.length; i += xTickStep) {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', xScale(i));
        tick.setAttribute('y1', 0);
        tick.setAttribute('x2', xScale(i));
        tick.setAttribute('y2', 5);
        tick.setAttribute('stroke', 'black');
        xAxis.appendChild(tick);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', xScale(i));
        label.setAttribute('y', 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10px');
        label.textContent = i;
        xAxis.appendChild(label);
    }
    
    g.appendChild(xAxis);
    
    // Add X axis label
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', width / 2);
    xLabel.setAttribute('y', height + margin.bottom - 5);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.textContent = 'Iteration';
    g.appendChild(xLabel);
    
    // Add Y axis
    const yMin = Math.min(...convergenceData) * 0.9;
    const yMax = Math.max(...convergenceData) * 1.1;
    const yScale = (y) => height - ((y - yMin) / (yMax - yMin)) * height;
    
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', height);
    yAxisLine.setAttribute('stroke', 'black');
    yAxis.appendChild(yAxisLine);
    
    // Y axis ticks
    const yTickCount = 5;
    const yTickStep = (yMax - yMin) / yTickCount;
    
    for (let i = 0; i <= yTickCount; i++) {
        const value = yMin + i * yTickStep;
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', -5);
        tick.setAttribute('y1', yScale(value));
        tick.setAttribute('x2', 0);
        tick.setAttribute('y2', yScale(value));
        tick.setAttribute('stroke', 'black');
        yAxis.appendChild(tick);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', -10);
        label.setAttribute('y', yScale(value) + 3);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '10px');
        label.textContent = value.toFixed(1);
        yAxis.appendChild(label);
    }
    
    g.appendChild(yAxis);
    
    // Add Y axis label
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -height / 2);
    yLabel.setAttribute('y', -margin.left + 15);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.textContent = 'Distance';
    g.appendChild(yLabel);
    
    // Plot the data
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData = `M${xScale(0)},${yScale(convergenceData[0])}`;
    
    for (let i = 1; i < convergenceData.length; i++) {
        pathData += ` L${xScale(i)},${yScale(convergenceData[i])}`;
    }
    
    line.setAttribute('d', pathData);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#4CAF50');
    line.setAttribute('stroke-width', '2');
    g.appendChild(line);
    
    convergenceChart.appendChild(svg);
}

// Animate the path visualization
function visualizePath() {
    if (isVisualizing || bestRoute.length === 0) return;
    
    isVisualizing = true;
    stopBtn.disabled = false;
    visualizeBtn.disabled = true;
    
    // Clear previous visuals and render cities
    renderCities();
    
    let currentIdx = 0;
    const visitedCities = [bestRoute[0]];
    
    // Animation function
    function animate() {
        if (currentIdx < bestRoute.length - 1) {
            currentIdx++;
            visitedCities.push(bestRoute[currentIdx]);
            
            // Draw route so far
            for (let i = 0; i < visitedCities.length - 1; i++) {
                drawLine(cities[visitedCities[i]], cities[visitedCities[i + 1]], '#4CAF50', 3);
            }
            
            // Highlight current city
            const cityElement = document.createElement('div');
            cityElement.className = 'city current';
            cityElement.style.left = `${cities[bestRoute[currentIdx]].x}px`;
            cityElement.style.top = `${cities[bestRoute[currentIdx]].y}px`;
            
            const labelElement = document.createElement('div');
            labelElement.className = 'city-label';
            labelElement.textContent = bestRoute[currentIdx];
            
            cityElement.appendChild(labelElement);
            mapElement.appendChild(cityElement);
            
            // Schedule next step
            animationId = setTimeout(animate, 500);
        } else {
            // Draw final connection back to depot
            drawLine(cities[bestRoute[bestRoute.length - 1]], cities[bestRoute[0]], '#4CAF50', 3);
            
            isVisualizing = false;
            visualizeBtn.disabled = false;
            stopBtn.disabled = true;
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
    
    // Redraw complete route
    if (bestRoute.length > 0) {
        renderCities();
        drawRoute(bestRoute, '#4CAF50', 3);
    }
}