using System;

namespace Sim
{
    public class Dice
    {
        private static readonly Random random = new();

        public static double Roll(int size)
        {
            return 1 + random.NextDouble() * (size - 1);
        }

        public static bool Hit(double chanceOfBeingHit)
        {
            return random.NextDouble() < chanceOfBeingHit;
        }
    }
}