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
