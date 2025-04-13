import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeUrl(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Select all <p> tags
    const paragraphs = [];
    $("p")
      .slice(0, 6)
      .each((i, elem) => {
        paragraphs.push($(elem).text().trim());
      });

    return paragraphs;
    // console.log(paragraphs);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
