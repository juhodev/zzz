namespace Sim
{
    public class Damage
    {
        public Damage(double damageToHp, double damageToOrganization)
        {
            DamageToHp = damageToHp;
            DamageToOrganization = damageToOrganization;
        }
        
        public double DamageToHp { get; set; }
        
        public double DamageToOrganization { get; set; }

        public void AddModifier(double modifier)
        {
            DamageToHp *= modifier;
            DamageToOrganization *= modifier;
        }

        public void Add(Damage damage)
        {
            DamageToHp += damage.DamageToHp;
            DamageToOrganization += damage.DamageToOrganization;
        }
    }
}