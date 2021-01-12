from network import Network, Node
from random import random
import math


class Genome:
    def __init__(self, neat, created_gen):
        self.neat = neat
        self.network = Network(neat)
        self.fitness = 0
        self.species = None
        self.original_fitness = 0
        self.num_of_expected_offspring = 0
        self.marked_for_death = False
        self.created_gen = created_gen

    def weight_mutation(self):
        con = self.network.connections[math.floor(
            len(self.network.connections) * random())]

        if random() < .9:
            # 90% chance of being uniformly perturbed
            max_mutation = abs(con.weight)
            new_weight = max_mutation + \
                (random() * (max_mutation * 2) - max_mutation)
            con.weight = new_weight
        else:
            # 10% chance of being assigned a new random value
            new_weight = random() * 4 - 2
            con.weight = new_weight

    def connection_mutation(self):
        pairs = self.network.find_unconnected_nodes()
        random_pair = pairs[math.floor(len(pairs) * random())]
        self.network.insert_connection(random_pair[0], random_pair[1])

    def node_mutation(self):
        con = self.network.connections[math.floor(
            len(self.network.connections) * random())]
        self.network.insert_node(Node(self.neat.node_counter), con)

    def sig(self, x):
        return 1 / 1 + math.pow(math.e, -4.9 * x)

    def distance(self, other_genome):
        own_connections = self.network.connections
        other_connections = other_genome.network.connections
        excess_count, disjoint_count, weight_difference = self._calculate_excess_and_disjoint_nodes(
            own_connections, other_connections)

        n_factor = max(len(own_connections), len(other_connections))
        if len(own_connections) < 20 and len(other_connections):
            n_factor = 1

        distance = self.neat.config['c1'] * excess_count / n_factor + self.neat.config['c2'] * \
            disjoint_count / n_factor + \
            self.neat.config['c3'] * weight_difference

        return distance

    def _calculate_excess_and_disjoint_nodes(self, a_connections, b_connections):
        a_highest = max(map(lambda x: x.innovation, a_connections)) if len(
            a_connections) > 0 else 0
        b_highest = max(map(lambda x: x.innovation, b_connections)) if len(
            b_connections) > 0 else 0
        highest = max(a_highest, b_highest)
        lower = min(a_highest, b_highest)

        matching_count = 0
        excess_count = 0
        disjoint_count = 0
        total_weight_difference = 0

        for i in range(highest + 1):
            a_connection = [c for c in a_connections if c.innovation == i]
            b_connection = [c for c in b_connections if c.innovation == i]

            if len(a_connection) == 0 and len(b_connection) == 0:
                continue

            if len(a_connection) == 0 or len(b_connection) == 0:
                if lower <= i:
                    disjoint_count += 1
                    continue
                else:
                    excess_count += 1
                    continue

            a_weight = a_connection[0].weight
            b_weight = b_connection[0].weight
            difference = abs(a_weight - b_weight)
            total_weight_difference += difference
            matching_count += 1

        average_weight_difference = 0
        if matching_count > 0:
            average_weight_difference = total_weight_difference / matching_count
        return excess_count, disjoint_count, average_weight_difference
