import { DataNode } from './types';
import DependencyGraph from './dependencyGraph';

class Resolver {
	private dataNodes: Map<string, DataNode>;

	constructor() {
		this.dataNodes = new Map<string, DataNode>();

		this.dataNodes.set('sales', { name: 'sales', dependsOn: [] });
		this.dataNodes.set('revenue', { name: 'revenue', dependsOn: [] });
		this.dataNodes.set('forecasts', { name: 'forecasts', dependsOn: [] });
		this.dataNodes.set('unit_price_forecast', { name: 'unit_price_forecast', dependsOn: [] });
		this.dataNodes.set(
			'forecast_revenue',
			{
				name: 'forecast_revenue',
				dependsOn: [this.dataNodes.get('forecasts'), this.dataNodes.get('unit_price_forecast')],
			}
		);
	}

	addDataNode(node: string, dependsOn: string[]) {
		const newNode: DataNode = {
			name: node,
			dependsOn: [],
		};

		for (const parent of dependsOn) {
			const node: DataNode = this.dataNodes.get(parent);

			newNode.dependsOn.push(node);
		}

		this.dataNodes.set(node, newNode);
	}

	resolve(dataWanted: string[]): DependencyGraph {
		const nodes: DataNode[] = this.createDataNodes(dataWanted);
		const graph: DependencyGraph = new DependencyGraph(nodes);
		graph.create();

		const depth: number = graph.getDepth();
		console.log('depth', depth);
		for (let i = 0; i < depth; i++) {
			const nodes: DataNode[] = graph.getLevel(i);
			console.log(nodes.map(x => x.name));
		}

		debugger;

		return graph;
	}

	private createDataNodes(dataWanted: string[]): DataNode[] {
		const nodes: DataNode[] = [];
		for (const data of dataWanted) {
			if (!this.dataNodes.has(data)) {
				console.log(`Data node doesn't exist (${data})`);
				continue;
			}

			nodes.push(this.dataNodes.get(data));
		}

		return nodes;
	}
};

export default Resolver;
