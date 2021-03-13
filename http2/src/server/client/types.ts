export enum StreamState {
	IDLE = 'idle',
	RESERVED_LOCAL = 'reserved (local)',
	RESERVED_REMOTE = 'reserved (remote)',
	OPEN = 'open',
	HALF_CLOSED_LOCAL = 'half-closed (local)',
	HALF_CLOSED_REMOTE = 'half-closed (remote)',
	CLOSED = 'closed',
}
