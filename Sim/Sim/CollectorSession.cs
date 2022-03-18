using System.Collections.Generic;

namespace Sim
{
    public class CollectorSession
    {
        public CollectorSession(string name)
        {
            Name = name;
            Hits = 0;
            DamageDoneToHp = new List<double>();
            DamageDoneToOrg = new List<double>();
            DeadOnHour = -1;
        }
        
        public string Name { get; }

        public int Hits { get; set; }
        
        public List<double> DamageDoneToHp { get; }
        
        public List<double> DamageDoneToOrg { get; }
        
        public int DeadOnHour { get; set; }
    }
}