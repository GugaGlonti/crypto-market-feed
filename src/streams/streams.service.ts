import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class StreamsService implements OnModuleDestroy {
  private readonly logger = new Logger(StreamsService.name);
  private readonly failedEventReads: Record<string, any[]> = {};
  private sockets: Record<string, WebSocket> = {};

  public registerStream<E>(
    socketId: string,
    url: string,
    handler: (data: E) => void,
  ): void {
    const ws = new WebSocket(url);
    this.sockets[socketId] = ws;

    ws.onopen = () =>
      this.logger.log(`WebSocket with ID: ${socketId} established`);
    ws.onclose = () => this.logger.log(`WebSocket with ID: ${socketId} closed`);

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        handler(JSON.parse(event.data) as E);
      } catch {
        this.addFailedEventRead(socketId, event.data);
      }
    };
  }

  public addFailedEventRead(socketId: string, eventData: any): void {
    this.logger.debug(`Adding failed event read for socket ID: ${socketId}`);
    this.failedEventReads[socketId] = this.failedEventReads[socketId] || [];
    this.failedEventReads[socketId].push(eventData);
  }

  public unregisterStream(name: string): void {
    const ws = this.sockets[name];
    if (ws) {
      ws.close();
      delete this.sockets[name];
    }
  }

  public onModuleDestroy() {
    for (const name in this.sockets) {
      this.unregisterStream(name);
    }
  }
}
