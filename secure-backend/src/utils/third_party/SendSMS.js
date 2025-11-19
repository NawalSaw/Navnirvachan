import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_ACCOUNT_TOKEN;
const sender_phone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendOTP = async (phone, otp) => {
  if (!phone || !otp) {
    return false;
  }
  try {
    const message = await client.messages.create({
      from: sender_phone,
      to: phone,
      body: `Your OTP from Navnirvachan is ${otp}`,
    })
    console.log(message);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/*
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
    from: "+15017122661",
    to: "+15558675310",
  });

  console.log(message.body);
}

createMessage(); **/