import { BroadcastToUIMethod, bus } from 'src/utils/bus';

export const bexFrontBusOn = (
	event: BroadcastToUIMethod,
	block: (...args: any[]) => void
) => {
	bus.on(event, block);
};