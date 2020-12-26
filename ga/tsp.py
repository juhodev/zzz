import random
import math
import matplotlib.pyplot as plt

mutation_rate = 0.1
elitism_count = 1
parent_pick_type = 'tournament'
sim_population_size = 250


class City:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def distance_to(self, city):
        return math.sqrt((math.pow(city.x - self.x, 2) + math.pow(city.y - self.y, 2)))


class Route:
    def __init__(self):
        self.cities = []

    def init(self, route_size=10):
        for _ in range(route_size):
            # the cities will be on a field of 1000x1000
            x = random.random() * 1000
            y = random.random() * 1000
            self.cities.append(City(x, y))

    def swap(self, a, b):
        self.cities[a], self.cities[b] = self.cities[b], self.cities[a]

    def get_route_length(self):
        total_length = 0
        for i in range(len(self.cities) - 1):
            curr_city = self.cities[i]
            next_city = self.cities[i + 1]
            total_length += curr_city.distance_to(next_city)

        total_length += self.cities[len(self.cities) -
                                    1].distance_to(self.cities[0])

        return total_length


def sort_genomes(val):
    return val.get_fitness()


class GA:
    def __init__(self, gen_limit=1000000):
        self.genomes = []
        self.gen = 0
        self.gen_limit = gen_limit
        self.route_length_history = []

    def init(self, population_size=50, cities=None):
        route = Route()

        if cities == None:
            route.init(25)
        else:
            route.cities = cities

        for _ in range(population_size):
            genome = Genome(route)
            self.genomes.append(genome)

    def evolve(self):
        new_genomes = []
        elitism_count = 0

        if elitism_count > 0:
            self.genomes.sort(key=sort_genomes, reverse=True)
            for _ in range(elitism_count):
                fittest_genome = self.genomes.pop()
                new_genomes.append(Genome(fittest_genome.route))

        for _ in range(len(self.genomes) - elitism_count):
            if parent_pick_type == 'random':
                # minus the elitism count because we don't want to grow our population
                a_random_parent = self.genomes[math.floor(
                    random.random() * len(self.genomes))]
                b_random_parent = self.genomes[math.floor(
                    random.random() * len(self.genomes))]

                offspring = self._crossover(a_random_parent, b_random_parent)
                offspring.mutate()
                new_genomes.append(offspring)
            else:
                a_parent = self._tournament_selection()
                b_parent = self._tournament_selection()
                offspring = self._crossover(a_parent, b_parent)
                offspring.mutate()
                new_genomes.append(offspring)

        self.gen += 1
        self.genomes = new_genomes
        avg_length = self._get_avg_route_length()
        self.route_length_history.append(avg_length)
        print('Average route length {}'.format(avg_length))
        if self.gen == self.gen_limit:
            plt.plot(self.route_length_history)
            plt.show()
        else:
            self.evolve()

    def _tournament_selection(self):
        tournament = []
        tournament_size = 8
        for _ in range(tournament_size):
            rand_genome = self.genomes[math.floor(
                random.random() * len(self.genomes))]
            tournament.append(rand_genome)

        second_round = []
        x = 0
        for i in range(math.floor(tournament_size/2)):
            a, b = tournament[x], tournament[x+1]
            better = self._tournament_diff(a, b)
            second_round.append(better)
            x += 2

        final_round = []
        x = 0
        for i in range(math.floor(tournament_size / 2 / 2)):
            a, b = second_round[x], second_round[x+1]
            better = self._tournament_diff(a, b)
            final_round.append(better)
            x += 2

        best = self._tournament_diff(final_round[0], final_round[1])
        return best

    def _tournament_diff(self, a_genome, b_genome):
        # return the better genome
        a_fit, b_fit = a_genome.get_fitness(), b_genome.get_fitness()
        if a_fit == b_fit:
            return a_genome if random.random() < .5 else b_genome

        return a_genome if a_fit > b_fit else b_genome

    def _get_avg_route_length(self):
        total = 0
        for genome in self.genomes:
            total += genome.route.get_route_length()

        return total / len(self.genomes)

    def _crossover(self, a_parent, b_parent):
        # I think for now I want to do single point crossover but the more fit parent should always contribute more
        a_fit = a_parent.get_fitness()
        b_fit = b_parent.get_fitness()

        offspring = Genome(Route())

        # for now lets get the first x cities from the more fit parent and the rest from the less fit
        middle = math.floor(len(a_parent.route.cities) / 2)
        rand = math.floor(random.random() * middle)
        cities_from_more_fit = middle + rand

        for i in range(cities_from_more_fit):
            if a_fit > b_fit:
                offspring.route.cities.append(a_parent.route.cities[i])
            else:
                offspring.route.cities.append(b_parent.route.cities[i])

        if a_fit < b_fit:
            for city in a_parent.route.cities:
                already_in_offspring = [
                    c for c in offspring.route.cities if (c.x == city.x and c.y == city.y)]
                # if the city already isn't in the offspring then I can add it
                if len(already_in_offspring) == 0:
                    offspring.route.cities.append(city)
                    continue
        else:
            for city in b_parent.route.cities:
                already_in_offspring = [
                    c for c in offspring.route.cities if (c.x == city.x and c.y == city.y)]
                # if the city already isn't in the offspring then I can add it
                if len(already_in_offspring) == 0:
                    offspring.route.cities.append(city)
                    continue
        return offspring

    def _find_most_fit_genome(self):
        most_fit = None
        fitness = -1
        for genome in self.genomes:
            if genome.get_fitness() > fitness:
                fitness = genome.get_fitness()
                most_fit = genome

        return most_fit


class Genome:
    def __init__(self, route=None):
        self.route = route
        self.cached_route_length = None

    def init(self, route_size=10):
        self.route = Route()
        self.route.init(route_size)

    # the fitness can be the route length collapsed between 0 and 1
    def get_fitness(self):
        route_length = None
        if self.cached_route_length != None:
            route_length = self.cached_route_length
        else:
            route_length = self.route.get_route_length()
            self.cached_route_length = route_length

        return 1 / route_length

    def mutate(self):
        for i in range(len(self.route.cities)):
            rand = random.random()
            if rand < mutation_rate:
                random_city_index = math.floor(
                    random.random() * len(self.route.cities))

                self.route.swap(i, random_city_index)


# a_city = City(0, 0)
# b_city = City(5, 5)
# print('distance', a_city.distance_to(b_city))

# for i in range(10):
#     route = Route()
#     route.init()
#     print(route.get_route_length())


fixed_route = [City(872, 685), City(583, 627), City(934, 844), City(523, 760), City(995, 292), City(57, 889), City(820, 84), City(14, 743), City(845, 637), City(828, 165), City(203, 98), City(546, 761), City(
    108, 238), City(966, 643), City(808, 636), City(701, 639), City(704, 200), City(529, 517), City(909, 45), City(613, 538), City(154, 381), City(506, 926), City(79, 340), City(525, 215), City(132, 138)]


ga = GA(400)
ga.init(population_size=sim_population_size, cities=fixed_route)
ga.evolve()
