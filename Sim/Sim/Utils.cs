using System.Collections.Generic;
using System.Linq;

namespace Sim
{
    public class Utils
    {
        public static string ListToString(List<double> list)
        {
            return string.Join(", ", list.Select(x => x.ToString("N")));
        }
    }
}