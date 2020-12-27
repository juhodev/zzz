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


class Network:
    def __init__(self, neat):
        self.nodes = []
        self.connections = []
        self.neat = neat

    def get_connections_from_node(self, node):
        connections_from_node = [
            con for con in self.connections if con.in_node.id == node.id]
        return connections_from_node

    def insert_node(self, node, connection):
        # TODO: muista et samassa generationissa uudet connection samat innovationit
        # TODO: One of these should get the old connection weight, figure out which
        connection.enabled = False
        new_connection_in = Connection(
            self.neat.innovation_counter, connection.in_node, node, 1, True)
        self.neat.innovation_counter += 1
        new_connection_out = Connection(
            self.neat.innovation_counter, node, connection.out_node, 1, True)
        self.connections.append(new_connection_in)
        self.connections.append(new_connection_out)
        self.neat.current_gen_mutations.append(
            new_connection_in)
        self.neat.current_gen_mutations.append(
            new_connection_out)

    def insert_connection(self, in_node, out_node):
        connection = Connection(
            self.neat.innovation_counter, in_node, out_node, 1, True)
        self.neat.innovation_counter += 1
        self.connections.append(connection)
        self.neat.current_gen_mutations.append(connection)

    def append_connection(self, connection, create_nodes=False):
        self.connections.append(connection)
        if create_nodes:
            # if create_nodes is set to true this'll create the nodes
            # from the connection if they don't already exist
            in_node = connection.in_node.clone()
            out_node = connection.out_node.clone()

            has_in_node = [n for n in self.nodes if n.id == in_node.id]
            if not len(has_in_node) > 0:
                self.nodes.append(in_node)

            has_out_node = [n for n in self.nodes if n.id == out_node.id]
            if not len(has_out_node) > 0:
                self.nodes.append(out_node)

    def find_unconnected_nodes(self):
        pairs = []
        for n in self.nodes:
            for x in self.nodes:
                if n.id == x.id:
                    continue

                filtered_connections = [c for c in self.connections if (
                    c.in_node.id == n.id and c.out_node.id == x.id) or (c.in_node.id == x.id and c.out_node.id == n.id)]

                if len(filtered_connections) > 0:
                    continue

                same_pairs = [p for p in pairs if (p[0].id == n.id and p[1].id == x.id) or (
                    p[0].id == x.id and p[1].id == n.id)]
                if len(same_pairs):
                    continue

                pairs.append([n, x])

        return pairs


class Species:
    def __init__(self, neat):
        self.genomes = []
        self.age = 0
        self.last_improvement = 0
        self.max_fitness_reached = 0
        self.neat = neat
        self.expected_offspring = 0
        return

    def reproduce(self):
        for _ in range(self.expected_offspring):
            mut_rand = random.random()
            offspring = None

            if mut_rand < self.neat.config['mutate_only_chance']:
                rand_parent = self.select_random_genome()
                offspring = rand_parent.clone()
                offspring.gen = self.neat.population.gen + 1
                offspring.mutate()
            else:
                # TODO: add a random chance to mate with an outside species parent
                a_parent = self.select_random_genome()
                b_parent = self.select_random_genome()
                offspring = self.neat.crossover(a_parent, b_parent)
                offspring.gen = self.neat.population.gen + 1

                offspring_mut_chance = random.random()
                if offspring_mut_chance < self.neat.config['offspring_mutate_chance']:
                    offspring.mutate()

            self.neat.population.add_genome(offspring)

    def select_random_genome(self):
        return self.genomes[math.floor(random.random() * len(self.genomes))]

    def get_representitive(self):
        return self.genomes[0]

    def remove_genome(self, genome):
        for i in range(len(self.genomes)):
            g = self.genomes[i]
            # right now I don't have a good way to match genomes so this'll do
            if g.fitness == genome.fitness:
                self.genomes.pop(i)
                break

    def count_offspring(self, skim):
        i_expected_offspring = None
        f_expected_offspring = None
        skim_i = None

        expected_offspring = 0
        for g in self.genomes:
            i_expected_offspring = math.floor(g.number_of_expected_offspring)
            f_expected_offspring = math.fmod(
                g.number_of_expected_offspring, 1.0)
            expected_offspring += i_expected_offspring

            if skim > 1.0:
                skim_i = math.floor(skim)
                expected_offspring += skim_i
                skim -= skim_i

        self.expected_offspring = expected_offspring
        return skim_i

    def adjust_fitness(self):
        age_debt = (self.age - self.last_improvement) - \
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

        number_of_parents = math.floor(
            self.neat.config['survival_threshold'] * len(self.genomes)) + 1

        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if i < number_of_parents:
                g.mark_for_death = False
            else:
                g.mark_for_death = True

    def _sort_by_fitness(self, elem):
        return elem.fitness


class Genome:
    def __init__(self, created_gen, neat):
        self.network = Network(neat)
        self.fitness = 0
        self.neat = neat
        self.species = None
        self.original_fitness = 0
        self.number_of_expected_offspring = 0
        self.mark_for_death = False  # rip
        self.create_gen = created_gen

    def weight_mutation(self):
        rand = random.random()
        con = self.network.connections[math.floor(
            len(self.network.connections) * random.random())]

        if rand < .90:
            # 90% chance of being uniformly perturbed
            max_mutation = abs(con.weight)
            new_weight = max_mutation + \
                (random.random() * max_mutation * 2 - max_mutation)
            con.weight = new_weight

        else:
            # 10% chance of being assigned a new random value
            new_weight = random.random() * 4 - 2  # random weight between 2 and -2
            con.weight = new_weight

    def connection_mutation(self):
        pairs = self.network.find_unconnected_nodes()
        rand = random.random()
        random_pair = pairs[math.floor(len(pairs) * rand)]
        self.network.insert_connection(random_pair[0], random_pair[1])

    def node_mutation(self):
        rand = random.random()
        con = self.network.connections[math.floor(
            len(self.network.connections) * rand)]

        self.network.insert_node(Node(self.neat.node_counter), con)

    def modified_sigmoid(self, x):
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


class Connection:
    def __init__(self, innovation, in_node, out_node, weight, enabled):
        self.innovation = innovation
        self.in_node = in_node
        self.out_node = out_node
        self.weight = weight
        self.enabled = enabled

    def clone(self):
        return Connection(self.innovation, self.in_node.clone(), self.out_node.clone(), self.weight, self.enabled)


class Node:
    def __init__(self, id, value=0):
        self.id = id
        self.value = value

    def clone(self):
        return Node(self.id, self.value)


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
