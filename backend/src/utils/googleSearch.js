import axios from "axios";

export async function googleSearch(query) {
  try {
    if (!query) {
      console.log("No query found");
      return "No query found";
    }

    const googleURL = `https://www.googleapis.com/customsearch/v1?key=${
      process.env.WEB_SEARCH_GOOGLE_API_KEY
    }&cx=${process.env.SEARCH_INGINE_ID}&q=${encodeURIComponent(query)}`;

    const response = await axios.get(googleURL);

    const results = response.data.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    const linksToIgnore = [
      "youtube.com",
      "instagram.com",
      "x.com",
      "facebook.com",
    ];

    // ✅ Filter out unwanted domains
    const filteredResults = results.filter((result) => {
      const url = new URL(result.link);
      return !linksToIgnore.some((domain) => url.hostname.includes(domain));
    });

    // ✅ Return top 5 filtered results
    return filteredResults.slice(0, 3);
  } catch (error) {
    console.error("Search error:", error.response?.data || error.message);
    return [];
  }
}