# import gym

# env = gym.make('CartPole-v0')

# for i_episode in range(20):
#     observation = env.reset()
#     for t in range(100):
#         env.render()
#         print(observation)
#         action = env.action_space.sample()
#         observation, reward, done, info = env.step(action)
#         if done:
#             print("Episode finished after {} timesteps".format(t+1))
#             break
# env.close()
import random
import math


class NEAT:
    def __init__(self):
        self.innovation_counter = 0
        self.node_counter = 0
        self.current_gen_mutations = []
        self.config = {
            'c1': 1.0,
            'c2': 1.0,
            'c3': .4,
            'distance_threshold': 3
        }
        self.population = Population(self)

    def combine_mutation(self):

    def crossover(self, a_genome, b_genome):
        more_fit = -1
        same_fitness = a_genome.fitness == b_genome.fitness
        if not same_fitness:
            if a_genome.fitness > b_genome.fitness:
                more_fit = 0
            else:
                more_fit = 1

        a_highest = max(map(lambda x: x.innovation, a_genome.network.connections)) if len(
            a_genome.network.connections) > 0 else 0
        b_highest = max(map(lambda x: x.innovation, b_genome.network.connections)) if len(
            b_genome.network.connections) > 0 else 0
        highest = max(a_highest, b_highest)

        offspring = Genome(self, self.population.gen)

        for i in range(highest + 1):
            a_connection = [
                c for c in a_genome.network.connections if c.innovation == i]
            b_connection = [
                c for c in b_genome.network.connections if c.innovation == i]

            if len(a_connection) > 0 and len(b_connection) > 0:
                if same_fitness:
                    # pick randomly
                    rand = random.random()
                    if rand < .5:
                        offspring.network.append_connection(
                            a_connection.clone(), True)
                    else:
                        offspring.network.append_connection(
                            b_connection.clone(), True)

                else:
                    # pick from the more fit parent
                    more_fit_con = a_connection[0] if more_fit == 0 else b_connection[0]
                    offspring.network.append_connection(more_fit_con.clone())

    # def explicit_sharing_function(self, species, genome):
    #     total_sh = 0
    #     for g in species.genomes:
    #         distance = self.distance(genome, g)
    #         sh = self.sh(distance)
    #         total_sh += sh

    #     return genome.fitness / total_sh

    def sh(self, distance):
        return 0 if distance > self.config['distance_threshold'] else 1

    def mutate(self, genome):
        weight_rand = random.random()
        # 80 percent change of a connection having it's weights mutated
        if weight_rand < .8:
            genome.weight_mutation()

        connection_rand = random.random()
        # probability of a new link mutation was 0.05
        if connection_rand < .05:
            genome.connection_mutation()

        node_rand = random.random()
        # the probability of adding a new node was 0.03
        if node_rand < .03:
            genome.node_mutation()


class Population:
    def __init__(self, neat):
        self.neat = neat
        self.genomes = []
        self.species = []
        self.gen = 0

    def speciate(self):
        for g in self.genomes:
            if len(self.species) == 0:
                new_species = Species(self.neat)
                new_species.genomes.append(g)
                self.species.append(new_species)
                continue

            for s in self.species:
                rep = s.get_representitive()
                if g.distance(rep) < self.neat.config['distance_threshold']:
                    g.species = s
                    break

            new_species = Species(self.neat)
            new_species.genomes.append(g)
            self.species.append(new_species)

    def add_genome(self, g):
        if len(self.species) == 0:
            new_species = Species(self.neat)
            g.species = new_species
            new_species.genomes.append(g)
            self.species.append(new_species)
            return

        for s in self.species:
            rep = s.get_representitive()
            if g.distance(rep) < self.neat.config['distance_threshold']:
                g.species = s
                s.genomes.append(g)
                return

        new_species = Species(self.neat)
        g.species = new_species
        new_species.genomes.append(g)
        self.species.append(new_species)

    def update(self):
        self.species.sort(key=self._sort_species_key, reverse=True)

        for s in self.species:
            s.adjust_fitness()

        total_fitness = 0
        for g in self.genomes:
            total_fitness += g.fitness

        avg_fitness = total_fitness / len(self.genomes)

        for g in self.genomes:
            g.number_of_expected_offspring = g.fitness / avg_fitness

        skim = 0
        total_expected = 0

        for s in self.species:
            skim = s.count_offspring(skim)
            total_expected = s.expected_offspring

        # might need to make up for lost precision in here by adding one offspring to the best species

        # kill all the genomes marked for death
        # rip
        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if g.mark_for_death:
                g.species.remove_genome(g)
                self.genomes.pop(i)
                i -= 1

        for s in self.species:
            s.reproduce()

        for i in range(len(self.genomes)):
            g = self.genomes[g]
            if g.created_gen == self.gen:
                g.species.remove_genome(g)
                self.genomes.pop(i)
                i -= 1

        for i in range(len(self.species)):
            s = self.species[i]
            if len(s.genomes) == 0:
                self.species.pop(i)
                i -= 1

        # TODO: remove all the connection changes

    def _sort_species_key(self, elem):
        return elem.max_fitness_reached

# neat = NEAT()

# a_genome = Genome(neat)
# a_genome.network.nodes.append(Node(0, 1))
# a_genome.network.nodes.append(Node(1, 1))
# a_genome.network.nodes.append(Node(2, 1))
# a_genome.network.connections.append(
#     Connection(0, Node(0, 0), Node(1, 0), 1, True))
# a_genome.network.connections.append(
#     Connection(1, Node(0, 0), Node(2, 0), 1, True))

# b_genome = Genome(neat)
# b_genome.network.nodes.append(Node(0, 1))
# b_genome.network.connections.append(
#     Connection(3, Node(0, 1), Node(1, 1), .5, True))

# distance = neat.distance(a_genome, b_genome)
# print('distance {}'.format(distance))

# e, d, average_weight_difference = neat._calculate_excess_and_disjoint_nodes(
#     [
#         Connection(0, Node(0, 10), Node(1, 10), 1, True),
#         Connection(2, Node(0, 10), Node(0, 10), 1, True),
#         Connection(3, Node(0, 10), Node(1, 10), 1.05, True)
#     ],
#     [
#         Connection(1, Node(0, 10), Node(1, 10), 1, True),
#         Connection(3, Node(0, 10), Node(1, 10), .95, True)
#     ],
# )

# print("excess {}, disjoint {}, weight difference {}".format(
#     e, d, average_weight_difference))

# network = Network(neat)
# network.nodes.append(Node(0, 123))
# network.nodes.append(Node(1, 542))

# network.connections.append(Connection(0, Node(0, 123), Node(1, 542), 1, True))
# connections_from_node = network.get_connections_from_node(Node(0, 123))
# print('connections from node', list(
#     map(lambda x: x.innovation, connections_from_node)))
# unconnected_nodes = network.find_unconnected_nodes()
# print('unconnected nodes', list(
#     map(lambda x: [x[0].id, x[1].id], unconnected_nodes)))
