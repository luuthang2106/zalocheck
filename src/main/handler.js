import XLSX from 'xlsx'
import request from 'request'

export default async function handle(path = "", proxies = []) {
    const file = XLSX.readFile(path)
    const sheet1 = file.Sheets[file.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet1)
    let count = 0
    while (count < data.length) {
        let index = 0,
            stop = false
        while (index < proxies.length - 1) {
            // if ()
        }
    }

    return "ccc"
}