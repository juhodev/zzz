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

    def distance(self, a_genome, b_genome):
        a_connections = a_genome.network.connections
        b_connections = b_genome.network.connections
        excess_count, disjoint_count, weight_difference = self._calculate_excess_and_disjoint_nodes(
            a_connections, b_connections)

        print('distance excess {}, disjoint {}, weight difference {}'.format(
            excess_count, disjoint_count, weight_difference))

        n_factor = max(len(a_connections), len(b_connections))
        if len(a_connections) < 20 and len(b_connections):
            n_factor = 1

        distance = self.config['c1'] * excess_count / n_factor + self.config['c2'] * \
            disjoint_count / n_factor + self.config['c3'] * weight_difference

        return distance

    def explicit_sharing_function(self, species, genome):
        total_sh = 0
        for g in species.genomes:
            distance = self.distance(genome, g)
            sh = self.sh(distance)
            total_sh += sh

        return genome.fitness / total_sh

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
    def __init__(self):
        self.genomes = []

    # def is_compatible(self, genome):


class Genome:
    def __init__(self, neat):
        self.network = Network(neat)
        self.fitness = 0
        self.neat = neat

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


class Connection:
    def __init__(self, innovation, in_node, out_node, weight, enabled):
        self.innovation = innovation
        self.in_node = in_node
        self.out_node = out_node
        self.weight = weight
        self.enabled = enabled


class Node:
    def __init__(self, id, value=0):
        self.id = id
        self.value = value


neat = NEAT()

a_genome = Genome(neat)
a_genome.network.nodes.append(Node(0, 1))
a_genome.network.nodes.append(Node(1, 1))
a_genome.network.nodes.append(Node(2, 1))
a_genome.network.connections.append(
    Connection(0, Node(0, 0), Node(1, 0), 1, True))
a_genome.network.connections.append(
    Connection(1, Node(0, 0), Node(2, 0), 1, True))

b_genome = Genome(neat)
b_genome.network.nodes.append(Node(0, 1))
b_genome.network.connections.append(
    Connection(3, Node(0, 1), Node(1, 1), .5, True))

distance = neat.distance(a_genome, b_genome)
print('distance {}'.format(distance))

e, d, average_weight_difference = neat._calculate_excess_and_disjoint_nodes(
    [
        Connection(0, Node(0, 10), Node(1, 10), 1, True),
        Connection(2, Node(0, 10), Node(0, 10), 1, True),
        Connection(3, Node(0, 10), Node(1, 10), 1.05, True)
    ],
    [
        Connection(1, Node(0, 10), Node(1, 10), 1, True),
        Connection(3, Node(0, 10), Node(1, 10), .95, True)
    ],
)

print("excess {}, disjoint {}, weight difference {}".format(
    e, d, average_weight_difference))

network = Network(neat)
network.nodes.append(Node(0, 123))
network.nodes.append(Node(1, 542))

network.connections.append(Connection(0, Node(0, 123), Node(1, 542), 1, True))
connections_from_node = network.get_connections_from_node(Node(0, 123))
print('connections from node', list(
    map(lambda x: x.innovation, connections_from_node)))
unconnected_nodes = network.find_unconnected_nodes()
print('unconnected nodes', list(
    map(lambda x: [x[0].id, x[1].id], unconnected_nodes)))
