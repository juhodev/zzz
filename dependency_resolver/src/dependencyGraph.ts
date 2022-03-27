import { DataNode, GraphNode } from "./types";

class DependencyGraph {
	private nodes: DataNode[];

	private root: GraphNode;
	private lookup: Map<string, GraphNode>;

	constructor(nodes: DataNode[]) {
		this.nodes = nodes;

		this.root = {
			data: {
				name: 'root',
				dependsOn: [],
			},
			level: 0,
			connections: [],
		};
		this.lookup = new Map();
		this.lookup.set('root', this.root);
	}

	create() {
		for (const node of this.nodes) {
			this.add(node);
		}
	}

	getLevel(level: number): DataNode[] {
		const nodesOnLevel: DataNode[] = [];

		for (const node of this.lookup) {
			if (node[1].level === level) {
				nodesOnLevel.push(node[1].data);
			}
		}

		return nodesOnLevel;
	}

	getDepth(): number {
		if (this.lookup.size === 0) {
			return 0;
		}

		for (let i = 0; i < 9999; i++) {
			if (this.getLevel(i).length === 0) {
				return i;
			}
		}

		return -1;
	}

	private add(node: DataNode) {
		this.createNode(node);
	}

	private createNode(node: DataNode): GraphNode {
		if (this.lookup.has(node.name)) {
			return this.lookup.get(node.name);
		}

		const newNode: GraphNode = {
			data: node,
			connections: [],
		};

		if (node.dependsOn.length === 0) {
			newNode.level = 1;
			this.root.connections.push(newNode);
		}

		for (const parent of node.dependsOn) {
			const parentNode: GraphNode = this.createNode(parent);

			newNode.level = parentNode.level + 1;
			parentNode.connections.push(newNode);
		}

		this.lookup.set(node.name, newNode);
		return newNode;
	}
};

export default DependencyGraph;
