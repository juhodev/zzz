class Network:
    def __init__(self, neat):
        self.nodes = []
        self.connections = []
        self.neat = neat

    def get_connections_from_node(self, node):
        connections_from_node = [
            c for c in self.connections if c.in_node.id == node.id]
        return connections_from_node

    def insert_node(self, node, connection):
        connection.enabled = False

        new_connection_in = Connection(
            self.neat.innovation_counter, connection.in_node, node, 1, True)
        has_connection_in, in_con_id = self.neat.logger.has(new_connection_in)
        if has_connection_in:
            new_connection_in.innovation = in_con_id
        else:
            self.neat.logger.add(new_connection_in)
            self.neat.innovation_counter += 1

        new_connection_out = Connection(
            self.neat.innovation_counter, node, connection.out_node, 1, True)
        has_connection_out, out_con_id = self.neat.logger.has(
            new_connection_out)
        if has_connection_out:
            new_connection_out.innovation = out_con_id
        else:
            self.neat.logger.add(new_connection_out)
            self.neat.innovation_counter += 1

        self.connections.append(new_connection_in)
        self.connections.append(new_connection_out)
        self.nodes.append(node)

    def insert_connection(self, in_node, out_node):
        connection = Connection(
            self.neat.innovation_counter, in_node, out_node, 1, True)
        has_connection, con_id = self.neat.logger.has(connection)
        if has_connection:
            connection.innovation = con_id
        else:
            self.neat.innovation_counter += 1
        self.connections.append(connection)

    def append_connection(self, connection, create_nodes=False):
        has_connection, con_id = self.neat.logger.has(connection)
        if has_connection:
            connection.innovation = con_id
        else:
            self.neat.logger.add(connection)

        self.connections.append(connection)

        if create_nodes:
            # if create_nodes is set to true this'll create the nodes
            # from the connection if they don't already exist
            in_node = connection.in_node.clone()
            out_node = connection.out_node.clone()

            has_in_node = [n for n in self.nodes if n.id == in_node.id]
            if not len(has_in_node) > 0:
                self.nodes.append(in_node)

            has_out_node = [n for n in self.nodes if n.id == out_node.id]
            if not len(has_out_node) > 0:
                self.nodes.append(out_node)

    def find_unconnected_nodes(self):
        pairs = []
        for n in self.nodes:
            for x in self.nodes:
                if n.id == x.id:
                    continue

                filtered_connections = [c for c in self.connections if (
                    c.in_node.id == n.id and c.out_node.id == x.id) or (c.in_node.id == x.id and c.out_node.id == n.id)]

                if len(filtered_connections) > 0:
                    continue

                same_pairs = [p for p in pairs if (p[0].id == n.id and p[1].id == x.id) or (
                    p[0].id == x.id and p[1].id == n.id)]
                if len(same_pairs):
                    continue

                pairs.append([n, x])

        return pairs


class Connection:
    def __init__(self, innovation, in_node, out_node, weight, enabled):
        self.innovation = innovation
        self.in_node = in_node
        self.out_node = out_node
        self.weight = weight
        self.enabled = enabled

    def clone(self):
        return Connection(self.innovation, self.in_node.clone(), self.out_node.clone(), self.weight, self.enabled)


class Node:
    def __init__(self, id, value=0):
        self.id = id
        self.value = value

    def clone(self):
        return Node(self.id, self.value)
