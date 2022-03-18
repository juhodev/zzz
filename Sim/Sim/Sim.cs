using System;
using System.Collections.Generic;

namespace Sim
{
    public class Sim
    {
        public static void Run(int rounds, int hours)
        {
            for (var i = 0; i < rounds; i++)
            {
                Collector.StartSession($"Round {i}");
                var attacker = new Division(new List<Battalion>
                {
                    BattalionManager.InfantryBattalion,
                    BattalionManager.InfantryBattalion,
                });
                
                var defender = new Division(new List<Battalion>
                {
                    BattalionManager.InfantryBattalion,
                });
                
                attacker.FillEquipment();
                defender.FillEquipment();
                Console.WriteLine(attacker.ToString());

                // for (int j = 0; j < hours; j++)
                // {
                //     attacker.Attack(defender);
                //     if (!defender.IsDead())
                //     {
                //         continue;
                //     }
                //
                //     Collector.DeadOnHour(j);
                //     break;
                // }

                Collector.EndSession();
            }
            
            Console.WriteLine(Collector.DataStr());
            Collector.Save();
        }
    }
}