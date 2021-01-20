using System.Collections.Generic;

namespace LFU
{
    public class LFUCache
    {
        private readonly Dictionary<string, ListNode> _lookup;
        private readonly LinkedList _frequencyList;
        private readonly uint _maxSize;
        private uint _size;

        public LFUCache(uint maxSize)
        {
            this._lookup = new Dictionary<string, ListNode>();
            this._size = 0;
            this._maxSize = maxSize;
            this._frequencyList = new LinkedList();
        }

        public void Insert(string key, string value)
        {
            if (this._size >= this._maxSize)
            {
                this.RemoveLeastUsed();
            }

            // If this would exceed the _maxSize then remove the least used element
            this._size++;
            if (this._frequencyList.Size == 0)
            {
                CreateFrequencyNode(key, value, 1, null);
                return;
            }

            var node = new ListNode(key, value, _frequencyList.Head);
            ((LinkedList) _frequencyList.Head.Value).InsertHead(node);
            this._lookup.Add(key, node);
        }

        public string Get(string key)
        {
            if (!this._lookup.ContainsKey(key))
            {
                return null;
            }

            var node = this._lookup[key];
            var parent = node.Parent;
            Increment(node, parent);
            return (string) node.Value;
        }

        private void Increment(ListNode node, ListNode parent)
        {
            var nextNode = parent.Next;

            ((LinkedList) parent.Value).Remove(node);
            if (nextNode == null || uint.Parse(nextNode.Key) != uint.Parse(parent.Key) + 1)
            {
                CreateFrequencyNode(node.Key, node.Value, uint.Parse(parent.Key) + 1, parent);
            }
            else
            {
                var n = new ListNode(node.Key, node.Value, nextNode);
                if (this._lookup.ContainsKey(node.Key))
                {
                    this._lookup.Remove(node.Key);
                }

                this._lookup.Add(node.Key, n);
                ((LinkedList) nextNode.Value).InsertHead(n);
            }
        }

        private void RemoveLeastUsed()
        {
            var leastUsedNode = this._frequencyList.Head;
            var head = ((LinkedList) leastUsedNode.Value).Head;
            ((LinkedList) leastUsedNode.Value).Remove(head);
            this._lookup.Remove(head.Key);
            this._size--;
        }

        private void CreateFrequencyNode(string key, object value, uint frequency, ListNode oldParent)
        {
            var frequencyNode = new ListNode(frequency.ToString(), new LinkedList());
            var listNode = new ListNode(key, value, frequencyNode);
            ((LinkedList) frequencyNode.Value).InsertHead(listNode);
            if (this._lookup.ContainsKey(key))
            {
                this._lookup.Remove(key);
            }

            this._lookup.Add(key, listNode);
            if (oldParent == null)
            {
                this._frequencyList.InsertHead(frequencyNode);
            }
            else
            {
                oldParent.Next = frequencyNode;
            }
        }
    }
}