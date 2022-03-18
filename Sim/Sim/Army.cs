using System.Collections.Generic;

namespace Sim
{
    public class Army
    {
        public Army()
        {
            Divisions = new List<Division>();
        }
        
        public List<Division> Divisions { get; }
    }
}