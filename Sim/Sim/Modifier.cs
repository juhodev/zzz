namespace Sim
{
    public class Modifier
    {
        public enum Type
        {
            SoftAttack = 0,
            HardAttack = 1,
            Organization = 2,
            Breakthrough = 3,
            Defence = 4,
            Piercing = 5,
            Armor = 6,
            Hardness = 7,
        }
        
        public Modifier(Type type, string name, double amount)
        {
            ToType = type;
            Name = name;
            ToType = type;
            Amount = amount;
        }
        
        public string Name { get; }
        
        public Type ToType { get; }
        
        public double Amount { get; }
    }
}