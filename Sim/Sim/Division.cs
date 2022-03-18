using System;
using System.Collections.Generic;
using System.Linq;

namespace Sim
{
    public class Division
    {
        public Division(List<Battalion> battalions)
        {
            Battalions = battalions;
        }
        
        public List<Battalion> Battalions { get; }

        /// <summary>
        /// Soft and hard attack give the number of attacks against a defending division
        /// </summary>
        public double HardAttack()
        {
            return 0;
        }

        public double SoftAttack()
        {
            return Battalions.Sum(x => x.GetSoftAttack(new List<Modifier>()));
        }

        /// <summary>
        /// The hardness stat of the defending division determines the proportion of soft and hard attacks the division
        /// receives. For example, a division with 100% hardness receives hard attacks and none of the soft attacks and
        /// a division unit with 25% hardness would receive 25% of the hard attacks and 75% of the soft attacks
        /// </summary>
        public double Hardness()
        {
            return Battalions.Sum(x => x.GetHardness(new List<Modifier>()));
        }

        /// <summary>
        /// The attacker's breakthrough values are used to determine how many defenses each of the attackers' units has.
        /// This is compared to the defenders' units hard and soft attacks to evaluate damage done to the attackers'
        /// units.
        ///
        /// The defender's Defense values are used to determine how many defenses each of the defenders' units has.
        /// This is compared to attackers' units hard and soft attacks to evaluate the damage done to the defenders'
        /// units.
        /// </summary>
        public double Defence()
        {
            return Battalions.Sum(x => x.GetDefence(new List<Modifier>()));
        }

        public override string ToString()
        {
            return $"{nameof(HardAttack)}: {HardAttack()} / {MaxHardAttack()}, " +
                   $"{nameof(SoftAttack)}: {SoftAttack()} / {MaxSoftAttack()}, " +
                   $"{nameof(Hardness)}: {Hardness()} / {MaxHardness()}, " +
                   $"{nameof(Defence)}: {Defence()} / {MaxDefence()}, " +
                   $"{nameof(Breakthrough)}: {Breakthrough()} / {MaxBreakthrough()}, " +
                   $"{nameof(Hp)}: {Hp()} / {MaxHp()}, " +
                   $"{nameof(Organization)}: {Organization()} / {MaxOrganization()}, " +
                   $"{nameof(Piercing)}: {Piercing()} / {MaxPiercing()}, " +
                   $"{nameof(Manpower)}: {Manpower()} / {MaxManpower()}";
        }

        public void FillEquipment()
        {
            foreach (var battalion in Battalions)
            {
                battalion.FillEquipment();
            }
        }

        public double MaxHp()
        {
            return Battalions.Sum(x => x.Hp);
        }
        
        public double MaxDefence()
        {
            return Battalions.Sum(x => x.GetMaxDefence(new List<Modifier>()));
        }

        public double MaxHardness()
        {
            return Battalions.Sum(x => x.GetMaxHardness(new List<Modifier>()));
        }

        public double MaxSoftAttack()
        {
            return Battalions.Sum(x => x.GetMaxSoftAttack(new List<Modifier>()));
        }

        public double MaxHardAttack()
        {
            return Battalions.Sum(x => x.GetMaxHardAttack(new List<Modifier>()));
        }

        public double MaxBreakthrough()
        {
            return Battalions.Sum(x => x.GetMaxBreakthrough(new List<Modifier>()));
        }
        
        public double Breakthrough()
        {
            return Battalions.Sum(x => x.GetBreakthrough(new List<Modifier>()));
        }

        public double Hp()
        {
            return Battalions.Sum(x => x.Hp);
        }

        public double MaxOrganization()
        {
            return Battalions.Sum(x => x.GetMaxOrganization(new List<Modifier>()));
        }
        
        public double Organization()
        {
            return Battalions.Sum(x => x.GetOrganization(new List<Modifier>()));
        }

        public double MaxPiercing()
        {
            return Battalions.Sum(x => x.GetMaxPiercing(new List<Modifier>()));
        }
        
        public double Piercing()
        {
            return Battalions.Sum(x => x.GetPiercing(new List<Modifier>()));
        }

        public double MaxManpower()
        {
            return Battalions.Sum(x => x.BaseManpower);
        }

        public double Manpower()
        {
            return Battalions.Sum(x => x.Manpower);
        }

        public double MaxArmor()
        {
            return Battalions.Sum(x => x.GetMaxArmor(new List<Modifier>()));
        }

        public double Armor()
        {
            return Battalions.Sum(x => x.GetArmor(new List<Modifier>()));
        }
        
        // TODO: Implement strength
        public double GetStrength()
        {
            return .9;
        }

        public void DoDamage(Damage damage)
        {
            // HealthPoints -= damage.DamageToHp;
            // Organization -= damage.DamageToOrganization;
        }

        public bool IsDead()
        {
            return Hp() <= 0;
        }
        
        public void Attack(Division defender)
        {
            // In damage dealing, the number of attacks is round(hardness modified attack / 10) and the number of
            // defences is round(defence / 10)
            var softAttack = defender.Hardness() * SoftAttack();
            var hardAttack = defender.Hardness() * HardAttack();
            var combinedAttack = softAttack + hardAttack;
            var numberOfAttacks = Math.Round(combinedAttack / 10);
            var numberOfDefences = Math.Round(defender.Defence() / 10);

            var totalDamage = new Damage(0, 0);
            while (numberOfAttacks > 0)
            {
                numberOfAttacks--;
                var damage = DoAttack(defender, numberOfDefences);
                if (damage != null)
                {
                    totalDamage.Add(damage);
                }
                
                // After each attack, the defending unit removes one defence (if it has some left)
                if (numberOfDefences > 0)
                {
                    numberOfDefences--;
                }
            }
            
            // The damage done to a unit's HP reduces its manpower and equipment proportion by HP loss percentage, in
            // addition to equipment loss from attrition. The fighting strength of the unit is the minimum between the
            // ratios of manpower and equipment IC. A unit's damage output is scaled by its fighting strength. The
            // scaling is rounded to multiples of 10%, e.g., for strength less than 100% but greater or equal to 90%,
            // the damage output is scaled by 90%. Note that damage done to a unit's HP does not change the other
            // stats of the unit before the combat is finished.
            
            totalDamage.AddModifier(Math.Max(GetStrength(), .90));
            defender.DoDamage(totalDamage);
            Collector.Add(totalDamage);
            
            
            
            
            
            
            
            
            
            
            

            // Each attack has the potential to be a hit (causes HP and organization damage) or a miss (no effect on HP
            // and organization). After each attack, the defending unit removes one defense (if it has some left). The
            // chance of being hit depends on whether the defender has any defences left. A unit with defenses left has
            // a 10% chance of being hit (90% chance of defending against a hit). A defending unit without any defences
            // has a 40% chance of being hit (its chance of defending against a hit has gone down to 60%)

            // For each hit, the amount of possible damage done is random; a "die" is used to randomly choose the amount
            // of damage done. For HP damage, the die size is 2 and for organization damage, it is 4. The exact amount
            // of damage done to HP and organization per hit is calculated by multiplying the obtained die rolls with
            // damage modifiers (0.05 base modifier, tactics attack modifiers, and -50% when the target's armor is
            // greater than the opponent's piercing). Other modifiers affect the number of attacks, thus the number of
            // hits, but not the amount of resulting damage per hit.

            // When armored units are in combat against targets with insufficient piercing, the organization dice size
            // is increased to 6, representing the ability of the armored unit to move more freely under fire, obtain
            // better positioning and thus deal more damage. This means an unpierced armored unit on average does 3.5
            // organization damage per hit instead of 2.5, or 40% more damage per hit.

            // The damage done to a unit's HP reduces its manpower and equipment proportion by HP loss percentage, in
            // addition to equipment loss from attrition. The fighting strength of the unit is the minimum between the
            // ratios of manpower and equipment IC. A unit's damage output is scaled by its fighting strength. The
            // scaling is rounded to multiples of 10%, e.g., for strength less than 100% but greater or equal to 90%,
            // the damage output is scaled by 90%. Note that damage done to a unit's HP does not change the other
            // stats of the unit before the combat is finished.

            // To summarize the above with an example: an armored division with 1000 soft attack vs an infantry division
            // with 500 defences.
            // * 50 attacks against defence; 50 attacks against no defence
            // * 50 attacks have 1 - 90% = 10% chance of hitting; 50 attacks have 1 - 60% = 40 chance of hitting
            // On average, the infantry division is hit 50 * 0.1 + 50 * 0.4 = 25 times
            // For 25 organization dice rolls, (1 + 6) / 2 = 3.5 per roll is expected
            // The armored division is damaged to slightly less than 100% strength and so has a 90% damage scaling
            // factor
            // In total, the armored division is expected to deal 25 * 3.5 * 90% * 0.053 = 4.2 damage per hour. For a
            // regular infantry division with 50-60 organization, the combat is expected to finish in about half a day

            // When more than one division participates from one side, they can combine their attack value to overcome
            // the defence of the opposition. For example, two divisions with 100 attacks each pull their attacks versus
            // single division with 150 defences. In this situation 150 attacks will be considered "blocked" and have a
            // 0.1 chance of hitting, while 50 attacks will be "unblocked" and have 0.4 chance of hitting.
        }
        
        private Damage? DoAttack(Division defender, double liveDefence)
        {
            // A unit with defences left has a 10% chance of being hit (90% chance of defending against a hit). A
            // defending unit without any defences has a 40% chance of being hit (its chance of defending against a hit
            // has gone down to 60%).
            var chanceOfHit = liveDefence == 0 ? .40 : .10;
            if (!Dice.Hit(chanceOfHit))
            {
                return null;
            }
            
            
            // For each hit, the amount of possible damage done is random; a "die" is used to randomly choose the amount
            // of damage done
            
            // For HP damage, the die size is 2
            var damageToHp = Dice.Roll(2);
            
            // For organization damage, it is 4.
            var organizationDiceSize = 4;
            
            // When armored units are in combat against targets with insufficient piercing, the organization dice size
            // is increased to 6, representing the ability of the armored unit to move more freely under fire, obtain
            // better positioning and thus deal more damage.
            // TODO: Figure out what the "insufficient piercing" is
            if (defender.Piercing() < Armor())
            {
                organizationDiceSize = 6;
            }
            
            var damageToOrganization = Dice.Roll(organizationDiceSize);
            
            // The exact amount of damage done to HP and organization per hit is calculated by multiplying the obtained
            // die rolls with damage modifiers

            var damage = new Damage(damageToHp, damageToOrganization);
            // 0.05 base modifier
            var baseModifier = 0.053;
            damage.AddModifier(baseModifier);
            
            // TODO: tactics attack modifiers
            // TODO: -50% when the target's armor is greater than the opponent's piercing
            
            Collector.AddHit();
            Collector.AddDamageToHp(damageToHp);
            Collector.AddDamageToOrg(damageToOrganization);

            return damage;
        }
    }
}