import math
import random


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


class NearestNeighbour:
    def __init__(self, route):
        self.route = route
        self.new_route = Route()

    def process(self):
        city = self.route.cities.pop()
        self.new_route.cities.append(city)
        while len(self.route.cities) > 0:
            nearest, index = self.find_nearest_neighbour(city)
            self.route.cities.pop(index)
            self.new_route.cities.append(nearest)
            city = nearest

        print('done!')

    def find_nearest_neighbour(self, city):
        nearest = None
        distance = 999999999
        nearest_index = -1
        for i in range(len(self.route.cities)):
            c = self.route.cities[i]
            dist = city.distance_to(c)
            if dist < distance:
                nearest = c
                distance = dist
                index = i
        return nearest, nearest_index


fixed_route = [City(872, 685), City(583, 627), City(934, 844), City(523, 760), City(995, 292), City(57, 889), City(820, 84), City(14, 743), City(845, 637), City(828, 165), City(203, 98), City(546, 761), City(
    108, 238), City(966, 643), City(808, 636), City(701, 639), City(704, 200), City(529, 517), City(909, 45), City(613, 538), City(154, 381), City(506, 926), City(79, 340), City(525, 215), City(132, 138)]

route = Route()
route.cities = fixed_route

nearest_neighbour = NearestNeighbour(route)
nearest_neighbour.process()
distance = nearest_neighbour.new_route.get_route_length()
print('route distance {}'.format(distance))
