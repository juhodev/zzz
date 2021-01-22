class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.next = None
        self.prev = None


class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0

    def insert_head(self, node):
        self.size += 1
        if self.head == None:
            self.head = node
            self.tail = node
        else:
            tmp = self.head
            self.head = node
            node.next = tmp
            tmp.prev = self.head

    def remove(self, node):
        # if the node doesn't have a previous node then it's the head node
        if node.prev == None:
            self.head = node.next_node
            self.size -= 1
            if self.head != None:
                self.head.prev = None
            return

        # if the node doesn't have a next node then it's the tail node
        if node.next == None:
            self.tail = node.prev
            self.size -= 1
            if self.tail != None:
                self.tail.next = None
            return

        node.prev.next = node.next
        if node.next != None:
            node.next.prev = node.prev
        self.size -= 1


class LRU:
    def __init__(self, max_size=1024):
        self.lookup = {}
        self.list = LinkedList()
        self.max_size = max_size
        self.size = 0

    def insert(self, key, value):
        if self.size + 1 > self.max_size:
            self._remove_least_used()

        node = Node(key, value)
        self.lookup[key] = node
        self.list.insert_head(node)
        self.size += 1

    def get(self, key):
        node = self.lookup.get(key)
        if node == None:
            return None

        self._update(key)
        return node.value

    def _update(self, key):
        node = self.lookup.get(key)
        self.list.remove(node)
        self.list.insert_head(node)

    def _remove_least_used(self):
        tail_node = self.list.tail
        self.list.remove(tail_node)
        self.lookup[tail_node.key] = None
        self.size -= 1


lru = LRU(3)
lru.insert('key one', 15)
lru.insert('key two', 213215)
lru.insert('key three', 1225)
lru.get('key one')
lru.insert('key four', 0x225)
lru.insert('key five', 'asdasdasmdmkl')
print('---- GET ----')
print('key one =', lru.get('key one'))
print('key two =', lru.get('key two'))
print('key three =', lru.get('key three'))
print('key four =', lru.get('key four'))
print('key five =', lru.get('key five'))
print('not_in_cache =', lru.get('not_in_cache'))
