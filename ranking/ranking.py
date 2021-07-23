import math
import matplotlib.pyplot as plt
import random


class Player:
    def __init__(self, id, skill, rating=1500):
        self.id = id
        self.rating = rating
        self.elo_rating_history = []
        self.wins = 0
        self.skill = skill
        self.g_rating = 1500
        self.g_rd = 350
        self.g_vol = .06

# ELO STUFF STARTS FROM HERE


def elo_cacl_estimate(a_rating, b_rating):
    return 1 / (1 + math.pow(10, (b_rating - a_rating)/400))


def elo_calc_rating(a, a_estimate, a_points):
    return a.rating + elo_get_k(a.rating)*(a_points - a_estimate)


def elo_get_k(rating):
    if rating < 2100:
        return 32
    elif rating >= 2100 and rating < 2400:
        return 24
    else:
        return 16

# ELO STUFF STOPS HERE

def calc_team_average(players):
    total = 0
    for x in players:
        total += x.rating

    return total / len(players)


max_skill = 100
players = []
for i in range(10):
    p = Player(i, math.floor(random.random() * min(12, max_skill)))
    max_skill -= p.skill
    players.append(p)


def play_game(players, game_num):
    if game_num % 20 == 0:
        random.shuffle(players)

    team_one = players[:5]
    team_two = players[5:]

    team_one_average = calc_team_average(team_one)
    team_two_average = calc_team_average(team_two)

    team_one_skill = 0
    team_two_skill = 0
    total_skill = 0
    for p in team_one:
        team_one_skill += p.skill
        total_skill += p.skill

    for p in team_two:
        team_two_skill += p.skill
        total_skill += p.skill

    team_one_chance = team_one_skill / total_skill

    estimates = {}
    for p in team_one:
        estimate = elo_cacl_estimate(p.rating, team_two_average)
        estimates[p.id] = estimate

    for p in team_two:
        estimate = elo_cacl_estimate(p.rating, team_one_average)
        estimates[p.id] = estimate

    print('team one: {}\tteam two: {}'.format(
        team_one_chance, 1 - team_one_chance))

    rand = random.random()
    print(rand)
    if rand < team_one_chance:
        # team one wins
        for p in team_one:
            p.elo_rating_history.append(p.rating)
            p.rating = elo_calc_rating(p, estimates[p.id], 1)
            p.wins += 1

        for p in team_two:
            p.elo_rating_history.append(p.rating)
            p.rating = elo_calc_rating(p, estimates[p.id], 0)
    else:
        # team two wins
        for p in team_one:
            p.elo_rating_history.append(p.rating)
            p.rating = elo_calc_rating(p, estimates[p.id], 0)
            p.wins += 1

        for p in team_two:
            p.elo_rating_history.append(p.rating)
            p.rating = elo_calc_rating(p, estimates[p.id], 1)


for i in range(100):
    play_game(players, i)

for p in players:
    plt.plot(p.elo_rating_history, label='player {}'.format(p.id))
    print('player {} (skill {})\t {} wins ({} rating)'.format(
        p.id, p.skill, p.wins, p.rating))

plt.legend()
plt.show()
