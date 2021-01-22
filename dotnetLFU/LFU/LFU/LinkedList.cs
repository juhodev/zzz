namespace LFU
{
    public class LinkedList
    {
        private ListNode _head;
        private uint _size;

        public LinkedList()
        {
            this._size = 0;
        }

        public void InsertHead(ListNode node)
        {
            this._size++;
            if (this._head == null)
            {
                this._head = node;
                return;
            }

            var temp = this._head;
            this._head = node;
            node.Next = temp;
            temp.Prev = this._head;
        }

        public void Remove(ListNode node)
        {
            // If the previous node is null then the `node` must be the head node
            if (node.Prev == null)
            {
                this._head = node.Next;
                if (this._head != null)
                {
                    // The head node can't have a previous value (and it's the one I'm currently removing)
                    this._head.Prev = null;
                }

                this._size = 1;
                return;
            }

            node.Prev.Next = node.Next;
            if (node.Next != null)
            {
                node.Next.Prev = node.Prev;
            }

            this._size--;
        }

        public uint Size => _size;
        public ListNode Head => _head;
    }
}