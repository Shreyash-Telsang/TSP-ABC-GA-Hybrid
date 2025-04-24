import matplotlib.pyplot as plt

# Number of cities (X-axis)
cities = [10, 20, 30, 40, 50]

# Dummy execution times for each algorithm (Y-axis)
time_abc = [0.5, 1.2, 2.8, 5.4, 9.0]
time_genetic = [0.3, 0.8, 1.9, 3.2, 5.6]
time_hybrid = [0.2, 0.5, 1.1, 2.0, 3.8]

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(cities, time_abc, marker='o', label='ABC Algorithm')
plt.plot(cities, time_genetic, marker='s', label='Genetic Algorithm')
plt.plot(cities, time_hybrid, marker='^', label='Hybrid Algorithm')

# Adding labels and title
plt.xlabel('Number of Cities')
plt.ylabel('Execution Time (seconds)')
plt.title('Time Complexity Comparison of TSP Algorithms')
plt.legend()
plt.grid(True)

# Show the plot
plt.tight_layout()
plt.show()
