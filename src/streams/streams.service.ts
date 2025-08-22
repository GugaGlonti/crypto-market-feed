import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class StreamsService implements OnModuleDestroy {
  private sockets: Record<string, WebSocket> = {};

  public registerStream<E>(
    socketId: string,
    url: string,
    handler: (data: E) => void,
  ): void {
    const ws = new WebSocket(url);

    ws.addEventListener('message', (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as E;
      handler(data);
    });

    this.sockets[socketId] = ws;
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
