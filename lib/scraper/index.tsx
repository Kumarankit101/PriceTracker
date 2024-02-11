// import { url } from "inspector";
import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(productUrl: string) {
  if (!productUrl) return;

  // BrightData Proxy Config

  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_c49d6ad2-zone-unblocker:qei6z0ao6tt6 -k https://lumtest.com/myip.json
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (10000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    // Fetch Amazon Page
    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_c49d6ad2-zone-unblocker:qei6z0ao6tt6 -k https://lumtest.com/myip.json
    const respone = await axios.get(productUrl, options);
    const $ = cheerio.load(respone.data);

    //Extract the info
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

    const description = extractDescription($);

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

      const data = {
        productUrl,
        currency: currency || '$',
        image: imageUrls[0],
        title,
        currentPrice: Number(currentPrice) || Number(originalPrice),
        originalPrice: Number(originalPrice) || Number(currentPrice),
        priceHistory: [],
        discountRate: Number(discountRate),
        category: 'category',
        reviewsCount:100,
        stars: 4.5,
        isOutOfStock: outOfStock,
        description,
        lowestPrice: Number(currentPrice) || Number(originalPrice),
        highestPrice: Number(originalPrice) || Number(currentPrice),
        averagePrice: Number(currentPrice) || Number(originalPrice),
      }

    //   console.log(data)

      return data
  } catch (error: any) {
    throw new Error(`Failed to Scrape product: ${error.message}`);
  }
}
