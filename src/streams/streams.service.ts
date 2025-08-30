import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class StreamsService implements OnModuleDestroy {
  private readonly logger = new Logger(StreamsService.name);

  private sockets: Record<string, WebSocket> = {};
  private intentionalCloses = new Set<string>();
  private reconnectAttempts: Record<string, number> = {};

  onModuleDestroy() {
    for (const name in this.sockets) this.unregisterStream(name);
  }

  public registerStream<E>(
    socketId: string,
    url: string,
    handler: (data: E) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.logger.log(`Connecting WebSocket with ID: ${socketId}`);
      this.sockets[socketId] = new WebSocket(url);

      this.sockets[socketId].onopen = () => {
        this.logger.log(`WebSocket with ID: ${socketId} established`);
        this.reconnectAttempts[socketId] = 0;
        resolve();
      };

      this.sockets[socketId].onmessage = (event: MessageEvent<string>) =>
        handler(JSON.parse(event.data) as E);

      this.sockets[socketId].onclose = () => {
        this.logger.log(`WebSocket with ID: ${socketId} closed`);
        if (!this.intentionalCloses.has(socketId))
          void this.reconnect(socketId, url, handler);
        else this.intentionalCloses.delete(socketId);
      };
    });
  }

  public unregisterStream(name: string): void {
    const ws = this.sockets[name];
    if (ws) {
      this.logger.log(`Unregistering WebSocket with ID: ${name}`);
      this.intentionalCloses.add(name);
      ws.close();
      delete this.sockets[name];
    }
  }

  private reconnect<E>(
    socketId: string,
    url: string,
    handler: (data: E) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve) => {
      const attempt = (this.reconnectAttempts[socketId] || 0) + 1;
      this.reconnectAttempts[socketId] = attempt;

      const delay = Math.min(1000 * 2 ** attempt, 30000);
      this.logger.warn(
        `Reconnecting WebSocket with ID: ${socketId} in ${delay / 1000}s (attempt ${attempt})`,
      );

      setTimeout(
        () => resolve(this.registerStream(socketId, url, handler)),
        delay,
      );
    });
  }
}
