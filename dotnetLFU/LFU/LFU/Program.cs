using System;

namespace LFU
{
    class Program
    {
        static void Main(string[] args)
        {
            var cache = new LFUCache(3);
            cache.Insert("test1", "joo1");
            cache.Insert("test2", "joo2");
            cache.Insert("test3", "joo3");

            // If this line didn't exist then `test3` would be removed from cache when `test4` is inserted but because
            // this line exists `test3` gets pumped up in the frequency list and `test2` will get removed.
            cache.Get("test3");


            cache.Insert("test4", "joo4");

            Console.WriteLine(cache.Get("test1"));
            Console.WriteLine(cache.Get("test2"));
            Console.WriteLine(cache.Get("test3"));
            Console.WriteLine(cache.Get("test4"));
        }
    }
}