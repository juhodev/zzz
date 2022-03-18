using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;

namespace Sim
{
    public class Collector
    {
        private static readonly List<Damage> DamageHistory = new();
        private static readonly List<CollectorSession> SessionHistory = new();

        private static CollectorSession? currentSession;

        public static void Add(Damage damage)
        {
            DamageHistory.Add(damage);   
        }

        public static void StartSession(string name)
        {
            currentSession = new CollectorSession(name);
        }

        public static void AddHit()
        {
            if (currentSession == null)
            {
                return;
            }

            currentSession.Hits++;
        }

        public static void AddDamageToHp(double damage)
        {
            currentSession?.DamageDoneToHp.Add(damage);
        }

        public static void AddDamageToOrg(double damage)
        {
            currentSession?.DamageDoneToOrg.Add(damage);
        }

        public static void DeadOnHour(int hour)
        {
            if (currentSession == null)
            {
                return;
            }

            currentSession.DeadOnHour = hour;
        }

        public static void EndSession()
        {
            if (currentSession != null)
            {
                SessionHistory.Add(currentSession);
            }

            currentSession = null;
        }

        public static void Save()
        {
            var damagePlot = new ScottPlot.Plot(1400, 800);
            damagePlot.AddScatter(GetX(DamageHistory.Count), DamageHistory.Select(x => x.DamageToHp).ToArray());
            damagePlot.SetAxisLimitsY(0, DamageHistory.Max(x => x.DamageToHp));
            damagePlot.SaveFig("damage.png");

            var sessionDamagePlot = new ScottPlot.Plot(1400, 800);
            foreach (var session in SessionHistory)
            {
                sessionDamagePlot.AddScatter(GetX(session.DamageDoneToHp.Count), session.DamageDoneToHp.ToArray());
            }

            sessionDamagePlot.SetAxisLimitsY(0, DamageHistory.Max(x => x.DamageToHp));
            sessionDamagePlot.SaveFig("session_damage.png");
        }

        public static string DataStr()
        {
            var strBuilder = new StringBuilder();
            strBuilder.Append(
                $"Damage to HP:          {string.Join(", ", DamageHistory.Select(x => x.DamageToHp.ToString("N")))}\n" + 
                $"Damage to org:         {string.Join(", ", DamageHistory.Select(x => x.DamageToOrganization.ToString("N")))}\n" +
                $"Average damage to HP:  {DamageHistory.Sum(x => x.DamageToHp) / DamageHistory.Count}\n" +
                $"Average damage to org: {DamageHistory.Sum(x => x.DamageToOrganization) / DamageHistory.Count}\n" +
                $"\n" +
                $"Number of hits: {string.Join(", ", SessionHistory.Select(x => x.Hits))}\n");

            strBuilder.AppendLine();
            
            foreach (var session in SessionHistory)
            {
                strBuilder.Append(session.Name.PadRight(3));
                strBuilder.AppendLine();
                strBuilder.Append($"Dead on hour: {session.DeadOnHour}\n");
                strBuilder.Append($"Damage to HP:  {Utils.ListToString(session.DamageDoneToHp)}\n");
                strBuilder.Append($"Damage to org: {Utils.ListToString(session.DamageDoneToOrg)}\n");
                strBuilder.AppendLine();
            }
            
            return strBuilder.ToString();
        }

        private static double[] GetX(int count)
        {
            var x = new List<double>();
            for (var i = 0.0; i < count; i++)
            {
                x.Add(i);
            }

            return x.ToArray();
        }
    }
}