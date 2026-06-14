type MessageHandler = (data: string) => void;
type StatusHandler = () => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private onMessageHandler: MessageHandler | null = null;
  private onOpenHandler: StatusHandler | null = null;
  private onCloseHandler: StatusHandler | null = null;

  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.onOpenHandler?.();
    this.ws.onclose = () => this.onCloseHandler?.();
    this.ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.onMessageHandler?.(event.data);
      }
    };
  }

  send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  onMessage(handler: MessageHandler): void {
    this.onMessageHandler = handler;
  }

  onOpen(handler: StatusHandler): void {
    this.onOpenHandler = handler;
  }

  onClose(handler: StatusHandler): void {
    this.onCloseHandler = handler;
  }
}
