import "./App.css";
import { useEffect, useState } from "react";
import { read, utils, writeFile } from "xlsx";

export default function App() {
  let [data, setData] = useState([]);
  let [path, setPath] = useState("");
  let [proxy, setProxy] = useState("");
  let run = () => {
    data.filter(i => i.status == "pending").length > 0 && window.electron.ipcRenderer.sendMessage("ipc", { data, proxy });
  };
  let exportData = () => {
    let wb = utils.book_new();
    let ws = utils.json_to_sheet(data.map((i: any) => ({
      phone: i?.phone?.toString(),
      status: i?.status || "",
    })));
    utils.book_append_sheet(wb, ws)
    return writeFile(wb, ('CaiDatDiem.' + 'xlsx'));
  };
  useEffect(() => {
    const subscription = window.electron.ipcRenderer.on("ipc", (msg) => {
      setData(msg)
    });
    return () => subscription();
  }, []);

  
  return (
    <div className="Container">
      <div className="InputContainer">
        <input
          hidden
          id="inputFile"
          onChange={async (e) => {
            let file = e.target.files[0];
            setPath(file.path);
            let reader = new FileReader();
            reader.onload = async (ev) => {
              let wb = read(ev.target.result, { type: "binary" });
              const sheet1 = wb.Sheets[wb.SheetNames[0]];
              let data = utils.sheet_to_json(sheet1);
              setData(
                data.map((i: any) => ({
                  phone: i?.phone?.toString(),
                  status: "pending",
                  name: i?.name || "",
                  ava: i?.ava || "",
                }))
              );
            };
            reader.readAsBinaryString(file);
          }}
          type="file"
          accept=".xlsx, .csv"
        />
        <label id="inputFileLabel" htmlFor="inputFile">
          {!!path ? path : "Click to select file"}
        </label>
        <button style={{background: "red", color: "yellow", marginLeft: "auto"}} onClick={run}>run</button>
        <button style={{background: "green", color: "yellow"}} onClick={exportData}>export result</button>
      </div>
      <div style={{
        marginTop: 10
      }}>
        <label htmlFor="inputProxy">Nhập proxy: </label>
        <input style={{
          fontSize: 18,
          width: 300
        }} type="text" id="inputProxy" onChange={e => setProxy(e.target.value)} />
      </div>
      <div style={{marginTop: 10}}>
        { `Scanned: ${data.filter(i => i.status != "pending").length}/${data.length}`}
      </div>
      <div className="rsCon">
        {data
          .filter((item) => item.status != "pending")
          .map((item, idx) => {
            if (item.status == "unknown") {
              item.ava = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/2560px-Question_Mark.svg.png"
            }
            if (item.status == "block") {
              item.ava = "https://www.pngitem.com/pimgs/m/599-5998799_block-icon-clipart-hd-png-download.png"
            }
            return <Item
              key={idx}
              name={item.name}
              phone={item.phone}
              ava={item.ava}
              status={item.status}
            />
          })}
      </div>
    </div>
  );
}

const Item = ({ name, ava, phone, status }) => {
  return (
    <div className="rsItem">
      <span>{name || "unknown"}</span>
      <span>{phone}</span>
      <img style={{objectFit: "contain"}} width="80" height="80"  src={ava} alt="" />
      <span style={{textTransform: "uppercase"}}>{status}</span>
    </div>
  );
};
