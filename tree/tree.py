class Tree:
    def __init__(self):
        self.root = Node(0)
        self.lookup = {}
        self.lookup[0] = self.root

    def add(self, n, parent_id):
        x = self.lookup[parent_id]

        if x != None:
            x.add_child(n)
            self.lookup[n.id] = n
        # self.find_and_add(self.root, parent_id, n)

    def find_and_add(self, current, parent_id, n):
        if current.id == parent_id:
            self.lookup[current.id] = current
            current.add_child(n)
            return

        for child in current.children:
            self.find_and_add(child, parent_id, n)

    def calculate_sum(self, n, tab=''):
        child_sum = 0
        for x in n.children:
            child_sum += self.calculate_sum(x, tab + '\t')

        ret = n.id + child_sum
        print(tab + str(n.id) + "(" + str(ret) + ")")
        return ret

    def print_node(self, n, tab=''):
        print(tab + str(n.id))
        for x in n.children:
            self.print_node(x, tab + '\t')


class Node:
    def __init__(self, id):
        self.id = id
        self.children = []

    def add_child(self, n):
        self.children.append(n)


tree = Tree()
tree.add(Node(1), 0)
tree.add(Node(2), 0)
tree.add(Node(3), 1)
tree.add(Node(4), 1)
tree.add(Node(5), 3)
tree.add(Node(6), 3)
tree.add(Node(7), 3)
tree.calculate_sum(tree.root)
