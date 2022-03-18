using System.Collections.Generic;

namespace Sim
{
    public static class BattalionManager
    {
        public static Battalion InfantryBattalion = new(
            Battalion.Type.Infantry,
            "Infantry battalion",
            1000,
            0.5,
            0.06,
            1.5,
            25,
            0.5,
            0,
            new Dictionary<int, double>
            {
                { EquipmentManager.Karabiner98k.Id, 100 },
            });
    }
}