import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, body: any) {
      ipcRenderer.send(channel, body);
    },
    on(channel: Channels, func: (resp: any) => void) {
      const subscription = (_event: IpcRendererEvent, resp: any) => func(resp);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (resp: any) => void) {
      ipcRenderer.once(channel, (_event, resp) => func(resp));
    },
  },
});
