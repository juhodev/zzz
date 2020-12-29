import math
from random import random


class Species:
    def __init__(self, neat):
        self.neat = neat
        self.genomes = []
        self.age = 0
        self.last_improvement = 0
        self.max_fitness_reached = 0
        self.expected_offspring = 0

    def select_random_genome(self):
        return self.genomes[math.floor(random() * len(self.genomes))]

    def get_representitive(self):
        return self.select_random_genome()

    def remove_genome(self, genome):
        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if g.fitness == genome.fitness:
                self.genomes.pop(i)
                break

    def count_offspring(self, skim):
        i_expected_offspring = 0
        f_expected_offspring = 0
        skim_i = 0
        expected_offspring = 0

        for g in self.genomes:
            i_expected_offspring = math.floor(g.number_of_expected_offspring)
            f_expected_offspring = math.fmod(
                g.number_of_expected_offspring, 1.0)
            expected_offspring += i_expected_offspring

            if skim > 1:
                skim_i = math.floor(skim)
                expected_offspring += skim_i
                skim -= skim_i

        self.expected_offspring = expected_offspring
        return skim_i

    def adjust_fitness(self):
        age_debt = self.age - self.last_improvement - \
            self.neat.config['dropoff_rate']

        for g in self.genomes:
            g.original_fitness = g.fitness

            if age_debt > 1:
                g.fitness = g.fitness * .01

            if self.age <= 10:
                g.fitness = g.fitness * self.neat.config['age_significance']

            if g.fitness < 0:
                g.fitness = 0.00001

            g.fitness = g.fitness / len(self.genomes)

        self.genomes.sort(key=self._sort_by_fitness, reverse=True)

        best_genome = self.genomes[0]
        if best_genome.original_fitness > self.max_fitness_reached:
            self.max_fitness_reached = best_genome.original_fitness
            self.last_improvement = self.age

        num_of_parents = math.floor(
            self.neat.config['survival_threshold'] * len(self.genomes)) + 1

        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if i < num_of_parents:
                g.mark_for_death = False
            else:
                g.mark_for_death = True

    def _sort_by_fitness(self, elem):
        return elem.fitness
