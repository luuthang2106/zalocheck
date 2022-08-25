import XLSX from 'xlsx'
import request from 'request-promise'
import { HttpsProxyAgent } from 'https-proxy-agent'
import Socks5ProxyAgent from 'socks5-https-client/lib/Agent'
import utf8 from 'utf8'

export default async function handle(path = "", proxies = [{}]) {
    const file = XLSX.readFile(path)
    const sheet1 = file.Sheets[file.SheetNames[0]]
    let data = XLSX.utils.sheet_to_json(sheet1)
    let result = []
    data = data.map(i => i.phone)
    proxies = proxies.map(i => ({...i, readyTime: new Date() }))
    let index = 0
    while (true) {
        if (data.length == 0) {
            break
        }
        if (Date.now() > proxies[index].readyTime.getTime()) {
            let phone = data[0]
            let options = {
                method: "GET",
                uri: `https://zalo.me/${phone}`,
                encoding: null,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
                },
                agent: new HttpsProxyAgent("http://svbk.duckdns.org:4207")
            }
            try {
                let resp = await request(options)
                if (!resp.includes("line-form g-recaptcha")) {
                    console.log(resp)
                    resp = utf8.encode(resp)
                    console.log(resp)
                    let str = resp.match(/<b>(.*?)<\/b>/g)
                    data = data.slice(1)
                    result = [...result, { phone: phone, name: "", status: "" }];
                } else {
                    console.log(resp)
                    var decoder = new TextDecoder('utf-5')
                    console.log(decoder.decode(resp))
                }
                data = []
            } catch (error) {
                console.log("err", error)
                data = []
            }
        }
        if (index == proxies.length - 1) {
            index = 0
        } else {
            index++
        }
    }

    return "ccc"
}