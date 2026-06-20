import { getWsBaseUrl } from "@/infrastructure/http/client";
import { WebSocketClient } from "./WebSocketClient";
import type { HostServerEvent, PingEvent, PongMessage } from "./types";

type HostEventHandler = (event: HostServerEvent) => void;

export class HostWebSocketClient {
  private readonly client: WebSocketClient;
  private token: string | null = null;
  private onEventHandler: HostEventHandler | null = null;
  private externalOpenHandler: (() => void) | null = null;

  constructor() {
    this.client = new WebSocketClient();
  }

  connect(roomID: string, token: string): void {
    this.token = token;
    const url = `${getWsBaseUrl()}/ws/rooms/${roomID}/host`;

    this.client.onOpen(() => {
      const auth = JSON.stringify({ type: "auth", token: this.token });
      this.client.send(auth);
      this.externalOpenHandler?.();
    });

    this.client.onMessage((data) => {
      try {
        const event = JSON.parse(data) as HostServerEvent;
        if (event.type === "ping") {
          const pong: PongMessage = {
            type: "pong",
            serverTimestamp: (event as PingEvent).serverTimestamp,
            clientTimestamp: Date.now(),
          };
          this.client.send(JSON.stringify(pong));
        }
        this.onEventHandler?.(event);
      } catch {
        // JSONパース失敗は無視
      }
    });

    this.client.connect(url);
  }

  onEvent(handler: HostEventHandler): void {
    this.onEventHandler = handler;
  }

  onOpen(handler: () => void): void {
    this.externalOpenHandler = handler;
  }

  onClose(handler: () => void): void {
    this.client.onClose(handler);
  }

  disconnect(): void {
    this.client.disconnect();
  }
}
