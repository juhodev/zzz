namespace Sim
{
    public class Equipment
    {
        public Equipment(
            int id,
            string name,
            double defence,
            double breakthrough,
            double softAttack,
            double hardAttack,
            double armor,
            double hardness,
            double maxSpeed,
            double piercing,
            double reliability,
            double productionCost)
        {
            Id = id;
            Name = name;
            Defence = defence;
            Breakthrough = breakthrough;
            SoftAttack = softAttack;
            HardAttack = hardAttack;
            Armor = armor;
            Hardness = hardness;
            MaxSpeed = maxSpeed;
            Piercing = piercing;
            Reliability = reliability;
            ProductionCost = productionCost;
            Amount = 0;
        }
        
        public int Id { get; }
        
        public string Name { get; }
        
        public double Defence { get; }
        
        public double Breakthrough { get; }
        
        public double SoftAttack { get; }
        
        public double HardAttack { get; }
        
        public double Armor { get; }
        
        public double Hardness { get; }
        
        public double MaxSpeed { get; }
        
        public double Piercing { get; }
        
        public double Reliability { get; }
        
        public double ProductionCost { get; }
        
        public double Amount { get; set; }
    }
}