export type DataNode = {
	name: string;
	dependsOn: DataNode[];
}

export type GraphNode = {
	data: DataNode;
	connections: GraphNode[];
	level?: number;
};
