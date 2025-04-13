import Event from "../models/Event.model.js";

export const EventLogger = async (EventTitle, description, req) => {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "49.37.26.138"; // Example IP for India
  }

  const apiUrl = `https://ipinfo.io/${ip}/json`;
  const response = await fetch(apiUrl);
  const data = await response.json(); // returns country, city, region, lat, lon, etc.
  // console.log(data);
  if (!data) {
    console.log(500, "IP data not found");
  }

  if (data) {
    const event = await Event.create({
      event: EventTitle,
      location: `${data.city}, ${data.region}, ${data.country}`,
      date: new Date().toISOString(),
      description: description,
      ClientDetails: {
        IP: ip,
        network: data.org,
        postal: data.postal,
        timezone: data.timezone,
      },
    });

    if (!event) {
      console.log(500, "Event creation failed");
    }

    console.log(200, "Event created successfully");
  }
};
