import './App.css';
import { useEffect, useState } from 'react';

export default function App() {
  let [file, setFile] = useState(null);
  let run = () => {
    file && window.electron.ipcRenderer.sendMessage('ipc', { path: file.path });
  };

  useEffect(() => {
    const subscription = window.electron.ipcRenderer.on('ipc', (msg) => {
      console.log(msg);
    });
    return () => subscription();
  }, []);
  return (
    <div className="Container">
      <div className="InputContainer">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          accept=".xlsx, .csv"
        />
        <button onClick={run}>run</button>
        <button>export result</button>
      </div>
    </div>
  );
}
