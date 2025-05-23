# TSP Solver: Hybrid Metaheuristic Approach

![TSP Solver Banner](https://img.shields.io/badge/TSP%20Solver-Hybrid%20ABC%2FGA-blue)

An interactive web-based application for solving the Traveling Salesman Problem using a hybrid approach combining Artificial Bee Colony and Genetic Algorithms.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Algorithms](#algorithms)
  - [Artificial Bee Colony](#artificial-bee-colony-abc)
  - [Genetic Algorithm](#genetic-algorithm-ga)
  - [Hybrid Approach](#hybrid-abcga-approach)
- [Mathematical Foundations](#mathematical-foundations)
- [Implementation Details](#implementation-details)
- [Visualization](#visualization)
- [Installation and Usage](#installation-and-usage)
- [Project Structure](#project-structure)
- [Performance Analysis](#performance-analysis)
- [Future Improvements](#future-improvements)
- [References](#references)

## Overview

The Traveling Salesman Problem (TSP) is a classic combinatorial optimization challenge where the goal is to find the shortest possible route that visits each city exactly once and returns to the origin city. This NP-hard problem has numerous real-world applications in logistics, circuit design, DNA sequencing, and more.

This project implements and visualizes multiple metaheuristic approaches to solving TSP instances, with a special focus on a hybrid algorithm that combines the strengths of Artificial Bee Colony (ABC) and Genetic Algorithms (GA).

## Features

- **Interactive Map Interface**: Visualize cities and routes on a real-world map
- **Multiple Algorithm Support**: Choose between ABC, GA, or the Hybrid approach
- **Customizable Parameters**: Fine-tune algorithm parameters for optimal performance
- **Real-Time Visualization**: Watch the solution evolve through iterations
- **Comprehensive Analytics**: Track convergence, execution time, and solution quality
- **Predefined Datasets**: Test with major city sets from different countries
- **Custom City Selection**: Create your own problem instances
- **Performance Comparison**: Compare algorithms side-by-side
- **Solution History**: Keep track of past runs for benchmarking

## Algorithms

### Artificial Bee Colony (ABC)

The ABC algorithm is a swarm-based metaheuristic inspired by the foraging behavior of honey bees. It consists of three essential components:

1. **Employed Bees**: Each employed bee is assigned to a food source (potential solution) and explores its neighborhood to find better solutions.

2. **Onlooker Bees**: These bees probabilistically select food sources based on their nectar amount (solution quality) and perform local search.

3. **Scout Bees**: When a food source is exhausted (not improved after a certain number of attempts), it is abandoned, and the employed bee becomes a scout, searching for new food sources.

#### Implementation Details:

```javascript
// Core ABC Algorithm
function solveWithABC(colonySize, maxIterations, limit) {
    // Initialize random solutions
    // For each iteration:
    //   1. Employed bee phase: Local search around current solutions
    //   2. Calculate solution qualities and selection probabilities
    //   3. Onlooker bee phase: Local search with probability-based selection
    //   4. Scout bee phase: Replace abandoned solutions with new random ones
    //   5. Update best solution found so far
}
```

#### Parameters:
- **Colony Size**: Total number of employed and onlooker bees
- **Max Iterations**: Number of algorithm iterations
- **Limit**: Maximum number of attempts before abandoning a solution

### Genetic Algorithm (GA)

GA is an evolutionary algorithm that mimics natural selection to evolve better solutions over generations.

1. **Selection**: Parents are chosen for reproduction based on their fitness (tournament selection is implemented)

2. **Crossover**: New solutions (offspring) are created by combining parts of parent solutions (Order Crossover)

3. **Mutation**: Random changes in offspring maintain population diversity (Swap Mutation)

#### Implementation Details:

```javascript
// Core GA Algorithm
function solveWithGA(populationSize, maxGenerations, mutationRate, crossoverRate) {
    // Initialize random population
    // For each generation:
    //   1. Tournament selection to pick parents
    //   2. Crossover to create offspring
    //   3. Mutation to maintain diversity
    //   4. Replace old population with new one
    //   5. Update best solution found so far
}
```

#### Parameters:
- **Population Size**: Number of solution candidates
- **Max Generations**: Number of evolutionary cycles
- **Mutation Rate**: Probability of mutation occurring
- **Crossover Rate**: Probability of crossover occurring

### Hybrid ABC/GA Approach

The hybrid approach alternates between ABC and GA phases to leverage the strengths of both algorithms:

1. **Exploration**: ABC excels at broadly exploring the search space
2. **Exploitation**: GA efficiently exploits promising regions through crossover

This combination helps overcome potential local optima traps and improves solution quality.

#### Implementation Details:

```javascript
// Core Hybrid Algorithm
function solveWithHybrid(populationSize, maxIterations, limit, mutationRate, 
                          crossoverRate, abcPhase, gaPhase) {
    // Initialize random solutions
    // For each iteration:
    //   If in ABC phase:
    //     Run employed, onlooker, and scout bee operations
    //   If in GA phase:
    //     Run selection, crossover, and mutation operations
    //   Update best solution found so far
}
```

#### Parameters:
- **Population Size**: Number of solution candidates
- **Max Iterations**: Total iterations for both phases
- **Limit**: Maximum attempts before abandoning a solution in ABC
- **Mutation Rate**: Probability of mutation in GA
- **Crossover Rate**: Probability of crossover in GA
- **ABC Phase Length**: Number of iterations in each ABC phase
- **GA Phase Length**: Number of iterations in each GA phase

## Mathematical Foundations

### Distance Calculation

For random coordinates:
#
