class InnovationLogger:
    def __init__(self):
        self.changes = []

    def has(self, connection):
        has_connection = [c for c in self.changes if c.out_node.id ==
                          connection.out_node.id and c.in_node == connection.in_node.id]
        con_innovation = - \
            1 if len(has_connection) == 0 else has_connection[0].innovation
        return len(has_connection) == 0, con_innovation
