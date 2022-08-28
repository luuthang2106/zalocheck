import puppeteer from "puppeteer";

export default async function handle({ data = [], proxy = "" }) {
  let rs = [];
  // socks5://svbk.duckdns.org:5001
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxy}`],
  });
  const page = await browser.newPage();

  await page.goto(
    "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F"
  );
  await page.waitForSelector('input[id="contact-search-input"]');
  for (let [index, item] of data.entries()) {
    if (item.status == "pending") {
        continue
    }
    await page.click('input[id="contact-search-input"]');
    await page.type('input[id="contact-search-input"]', item?.phone);
    await page.waitForTimeout(500);
    let rs = await page.evaluate(
      async ({ phone }) => {
        let name =
          document?.querySelector?.(
            "[id*='friend'] div.conv-item-title__name span"
          )?.textContent || "";
        let ava =
          document
            ?.querySelector?.(
              "[id*='friend'] > div.flx.flx-center.conv-item__avatar > div > img"
            )
            ?.getAttribute("src") || "";
        document.getElementById("contact-search-input").value = "";
        if (name == "") {
          let isRateLimit = document
            ?.querySelector?.(
              "#global_search_list > div > div:nth-child(2) > div > span"
            )
            ?.textContent?.includes("quá số lần cho phép");
          if (isRateLimit) {
            return {
              name: name,
              ava: ava,
              status: "pending",
              isRateLimit: true,
              phone: phone,
            };
          }
        }

        // Tài khoản bị khoá
        if (name == "Tài khoản bị khoá") {
          return {
            name: name,
            ava: ava,
            status: "block",
            phone: phone,
          };
        }
        // #global_search_list > div > div:nth-child(2) > div > span
        let unactive = document
          ?.querySelector?.(
            "#global_search_list > div > div:nth-child(2) > div > span"
          )
          ?.textContent?.includes("Số điện thoại chưa đăng ký");
        if (unactive) {
          return {
            name: name,
            ava: ava,
            status: "unknown",
            phone: phone,
          };
        }
        return {
          name: name,
          ava: ava,
          status: "live",
          phone: phone,
        };
      },
      { phone: item.phone }
    );
    if (rs.isRateLimit) {
      break;
    }
    data[index] = rs;
  }
  await browser.close();
  return data;
}
