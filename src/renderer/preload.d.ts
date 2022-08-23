import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, body: any): void;
        on(
          channel: string,
          func: (resp: any) => void
        ): (() => void) | undefined;
        once(channel: string, func: (resp: any) => void): void;
      };
    };
  }
}

export {};
