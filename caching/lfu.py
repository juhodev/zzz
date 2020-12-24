class Node:
    def __init__(self, key, value, parent=None):
        self.key = key
        self.value = value
        self.parent = parent
        self.next = None
        self.prev = None
        self.children = LinkedList()


class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def insert_head(self, node):
        self.size += 1
        if self.head == None:
            self.head = node
        else:
            tmp = self.head
            self.head = node
            node.next = tmp
            tmp.prev = self.head

    def remove(self, n):
        if n.prev == None:
            self.head = n.next
            if self.head != None:
                self.head.prev = None
            return

        n.prev.next = n.next
        if n.next != None:
            n.next.prev = n.prev
        self.size -= 1


class LFU:
    def __init__(self, max_size=1024):
        self.lookup = {}
        self.frequency_list = LinkedList()
        self.max_size = max_size
        self.size = 0

    def insert(self, key, value):
        if self.size >= self.max_size:
            self._remove_least_used()
        self.size += 1
        print('insert', key)
        # when the first element is added, a single element in the hash map
        # is created which points to this new element (by its key) and new
        # frequency node with a value of 1 is added to the frequency list
        if self.frequency_list.size == 0:
            self._create_frequency_node(key, value, 1)
        else:
            n = Node(key, value, self.frequency_list.head)
            self.frequency_list.head.children.insert_head(n)
            self.lookup[key] = n

    def get(self, key):
        if self.lookup.get(key) == None:
            return None

        n = self.lookup.get(key)
        parent = n.parent
        self._increment(n, parent)
        return n.value

    def _increment(self, node, current_parent):
        next_node = current_parent.next
        current_parent.children.remove(node)
        if next_node == None or next_node.value != current_parent.value+1:
            self._create_frequency_node(
                node.key, node.value, current_parent.value+1, current_parent)
        else:
            n = Node(node.key, node.value, next_node)
            self.lookup[node.key] = n
            next_node.children.insert_head(n)

    def _create_frequency_node(self, key, node_value, frequency, old_parent=None):
        frequency_node = Node('frequency-node', frequency)
        list_node = Node(key, node_value, frequency_node)
        frequency_node.children.insert_head(list_node)

        self.lookup[key] = list_node
        if old_parent == None:
            self.frequency_list.insert_head(frequency_node)
        else:
            old_parent.next = frequency_node

    def _remove_least_used(self):
        least_used_node = self.frequency_list.head
        head = least_used_node.children.head
        least_used_node.children.remove(head)
        self.lookup[head.key] = None
        print('remove', head.key)

        self.size -= 1


lfu = LFU(3)
lfu.insert('key one', 15)
lfu.insert('key two', 213215)
lfu.insert('key three', 1225)
lfu.get('key three')
lfu.get('key two')
lfu.insert('key four', 0x225)
lfu.insert('key five', 'asdasdasmdmkl')
print('---- GET ----')
print('key one =', lfu.get('key one'))
print('key two =', lfu.get('key two'))
print('key three =', lfu.get('key three'))
print('key four =', lfu.get('key four'))
print('key five =', lfu.get('key five'))
print('not_in_cache =', lfu.get('not_in_cache'))
