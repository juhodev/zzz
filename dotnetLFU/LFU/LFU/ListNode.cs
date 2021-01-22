using System;

namespace LFU
{
    public class ListNode
    {
        private ListNode _next, _prev;

        public ListNode(string key, object value)
        {
            this.Key = key;
            this.Value = value;
        }

        public ListNode(string key, object value, ListNode parent)
        {
            this.Key = key;
            this.Value = value;
            this.Parent = parent;
        }

        public string Key { get; }

        public object Value { get; }

        public ListNode Parent { get; }

        public ListNode Next
        {
            get => _next;
            set => _next = value;
        }

        public ListNode Prev
        {
            get => _prev;
            set => _prev = value;
        }
    }
}