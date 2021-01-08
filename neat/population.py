from species import Species


class Population:
    def __init__(self, neat):
        self.neat = neat
        self.genomes = []
        self.species = []
        self.gen = 0

    def add_genome(self, g):
        for s in self.species:
            rep = s.get_representitive()
            if g.distance(rep) < self.neat.config['distance_threshold']:
                g.species = s
                s.genomes.append(g)
                self.genomes.append(g)
                return

        new_species = Species(self.neat)
        g.species = new_species
        new_species.genomes.append(g)
        self.genomes.append(g)
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

        # I think I want to rewrite this part because I understand exactly none of it
        skim = 0
        total_expected = 0
        for s in self.species:
            skim = s.count_offspring(skim)
            total_expected = s.expected_offspring

        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if g.marked_for_death:
                g.species.remove_genome(g)
                self.genomes.pop(i)
                i -= 1

        for s in self.species:
            s.reproduce()

        # TODO: rewrite this
        for i in range(len(self.genomes)):
            g = self.genomes[i]
            if g.created_gen == self.gen:
                g.species.remove_genome[g]
                self.genomes.pop(i)
                i -= 1

        for i in range(len(self.species)):
            s = self.species[i]
            if len(s.genomes) == 0:
                self.species.pop(i)
                i -= 1

    def _sort_species_key(self, elem):
        return elem.max_fitness_reached
