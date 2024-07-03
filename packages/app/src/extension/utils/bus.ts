import { BusEventName, bus, BroadcastToUIMethod } from 'src/utils/bus';

export const bgBusEmit = (
	event: BusEventName,
	args: { method: BroadcastToUIMethod; params: any }
) => {
	bus.emit(event, args);
};
