using System.Collections.Generic;

namespace Sim
{
    public static class EquipmentManager
    {
        public static readonly Dictionary<string, List<Modifier>> Modifiers = new();

        public static void AddModifierToCountry(string country, Modifier modifier)
        {
            if (!Modifiers.TryGetValue(country, out var countryModifiers))
            {
                countryModifiers = new List<Modifier>();
            }
            
            countryModifiers.Add(modifier);
        }

        public static Equipment GetEquipment(int id)
        {
            if (AllEquipment.TryGetValue(id, out var e))
            {
                return e;
            }

            return null;
        }
        
        public static Equipment Gewehr98 = new(
            0,
            "Gewehr 98",
            20,
            2,
            3,
            0.5,
            0,
            0,
            4,
            1,
            0.9,
            0.43);
        
        public static Equipment Karabiner98k = new(
            1,
            "Karabiner 98k",
            22,
            3,
            6,
            1,
            0,
            0,
            4,
            4,
            0.9,
            0.5);
        
        public static readonly Dictionary<int, Equipment> AllEquipment = new()
        {
            { 0, Gewehr98 },
            { 1, Karabiner98k },
        };
    }
}