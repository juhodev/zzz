using System.Collections.Generic;
using System.Linq;

namespace Sim
{
    public class Battalion
    {
        public enum Type
        {
            Infantry = 0,
        }
        
        public Battalion(
            Type type,
            string name,
            double manpower,
            double weight,
            double supplyUsage,
            double suppression,
            double hp,
            double combatWidth,
            double organization,
            Dictionary<int, double> baseEquipment)
        {
            BattalionType = type;
            Name = name;
            CurrentEquipment = new Dictionary<int, double>();
            BaseEquipment = baseEquipment;
            BaseManpower = manpower;
            Manpower = 0;
            Weight = weight;
            SupplyUsage = supplyUsage;
            Suppression = suppression;
            Hp = hp;
            CombatWidth = combatWidth;
            BaseOrganization = organization;
        }

        public void FillEquipment()
        {
            foreach (var kvp in BaseEquipment)
            {
                CurrentEquipment[kvp.Key] = kvp.Value;
            }
        }
        
        public Type BattalionType { get; }

        public double GetMaxSoftAttack(List<Modifier> modifiers)
        {
            return CountSoftAttack(BaseEquipment, modifiers);
        }

        public double GetMaxOrganization(List<Modifier> modifiers)
        {
            return BaseOrganization;
        }

        public double GetMaxBreakthrough(List<Modifier> modifiers)
        {
            return CountBreakthrough(BaseEquipment, modifiers);
        }

        public double GetMaxDefence(List<Modifier> modifiers)
        {
            return CountDefence(BaseEquipment, modifiers);
        }

        public double GetMaxPiercing(List<Modifier> modifiers)
        {
            return CountPiercing(BaseEquipment, modifiers);
        }

        public double GetSoftAttack(List<Modifier> modifiers)
        {
            return CountSoftAttack(CurrentEquipment, modifiers);
        }

        public double GetOrganization(List<Modifier> modifiers)
        {
            return CountOrganization(modifiers);
        }

        public double GetBreakthrough(List<Modifier> modifiers)
        {
            return CountBreakthrough(CurrentEquipment, modifiers);
        }

        public double GetDefence(List<Modifier> modifiers)
        {
            return CountDefence(CurrentEquipment, modifiers);
        }

        public double GetPiercing(List<Modifier> modifiers)
        {
            return CountPiercing(CurrentEquipment, modifiers);
        }

        public double GetMaxArmor(List<Modifier> modifiers)
        {
            return CountArmor(BaseEquipment, modifiers);
        }

        public double GetArmor(List<Modifier> modifiers)
        {
            return CountArmor(CurrentEquipment, modifiers);
        }
        
        public double GetMaxHardness(List<Modifier> modifiers)
        {
            return CountHardness(BaseEquipment, modifiers);
        }

        public double GetHardness(List<Modifier> modifiers)
        {
            return CountHardness(CurrentEquipment, modifiers);
        }

        public double GetMaxHardAttack(List<Modifier> modifiers)
        {
            return CountHardAttack(BaseEquipment, modifiers);
        }
        
        public string Name { get; }
        
        public double BaseOrganization { get; }
        
        public double BaseManpower { get; }
        
        public double Manpower { get; }
        
        public double Weight { get; }
        
        public double SupplyUsage { get; }
        
        public double Suppression { get; }
        
        public double Hp { get; }
        
        public double CombatWidth { get; }
        
        public Dictionary<int, double> CurrentEquipment { get; }
        
        public Dictionary<int, double> BaseEquipment { get; }

        private double CountOrganization(List<Modifier> modifiers)
        {
            return ApplyModifiers(BaseOrganization, modifiers, Modifier.Type.Organization);
        }
        
        private double CountHardAttack(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.HardAttack * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.HardAttack);
        }
        
        private double CountHardness(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.Hardness * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.Hardness);
        }
        
        private double CountArmor(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.Armor * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.Armor);
        }
        
        private double CountPiercing(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.Piercing * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.Piercing);
        }
        
        private double CountDefence(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.Defence * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.Defence);
        }
        
        private double CountBreakthrough(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.Breakthrough * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.Breakthrough);
        }

        private double CountSoftAttack(Dictionary<int, double> equipmentInUse, List<Modifier> modifiers)
        {
            var amount = 0.0;
            foreach (var equipmentData in equipmentInUse)
            {
                var equipment = EquipmentManager.GetEquipment(equipmentData.Key);

                amount += equipment.SoftAttack * equipmentData.Value;
            }

            return ApplyModifiers(amount, modifiers, Modifier.Type.SoftAttack);
        }

        private double ApplyModifiers(double amount, List<Modifier> modifiers, Modifier.Type type)
        {
            foreach (var modifier in modifiers)
            {
                if (modifier.ToType == type)
                {
                    amount *= modifier.Amount;
                }
            }

            return amount;
        }
    }
}