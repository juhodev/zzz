export enum StreamState {
	IDLE = 'idle',
	REVERSED_LOCAL = 'reversed (local)',
	REVERSED_REMOTE = 'reversed (remote)',
	OPEN = 'open',
	HALF_CLOSED_LOCAL = 'half-closed (local)',
	HALF_CLOSED_REMOTE = 'half-closed (remote)',
	CLOSED = 'closed',
}
