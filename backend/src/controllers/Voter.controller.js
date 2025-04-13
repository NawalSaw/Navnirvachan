import { ApiError } from "../utils/ApiError.js";
import { ApiHandler } from "../utils/ApiHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyFaces } from "../utils/faceApiService.js";
import { cleanupFiles } from "../utils/fileCleanup.js";
import Voter from "../models/voter.model.js";
import path from "path";
import { EventLogger } from "../utils/EventLogger.js";
import { googleSearch } from "../utils/googleSearch.js";
import { scrapeUrl } from "../utils/scrapeUrl.js";
import { llama } from "../utils/llama.js";
import Candidate from "../models/Cadidate.model.js";
import CandidateWorks from "../models/CandidateWorks.model.js";
import OTP from "../models/otp.model.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/CloudinaryUpload.js";
import { sendOTP } from '../utils/SendSMS.js';
import VoterList from "../Voterlist.json" with {type: "json"}
import Assembly from './../models/assembly.model.js';
import { fileURLToPath } from "url";

export const registerVoter = ApiHandler(async function (req, res) {
  const file = req.file.path;
  const aadhaarId = req.body.aadhaarId;
  const otp = req.body.otp;

  if (!aadhaarId) {
    throw new ApiError(400, "Aadhaar ID is required");
  }

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }
  
  if (!file) {
    throw new ApiError(400, "Please upload a image");
  }


  // TODO: Check if aadhaarId is valid if government permission granted in place of it
  const voterInVoterList = VoterList.find((voter) => voter.aadhaar === aadhaarId);

  if (!voterInVoterList) {
  throw new ApiError(400, "You are not in the voterlist");
  }

  console.log(voterInVoterList);
  const isOtpValid = await OTP.findOne({ otp, phone: voterInVoterList.phone });
  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  try {
    // Photo verification
    const inputImage = path.resolve(voterInVoterList.image);
    const filePath = path.resolve(file);
    const result = await verifyFaces(inputImage, filePath);
    if (!result.verified) {
      throw new ApiError(400, "Face verification failed", result.reason);
    }

    const localFilePath = path.resolve(file);
    const imageUrl = await uploadToCloudinary(localFilePath);

    if (!imageUrl) {
      throw new ApiError(500, "Image upload failed");
    }

    const voter = await Voter.create({
      name: voterInVoterList.name,
      image: imageUrl,
      permanentAddress: voterInVoterList.address,
      age: voterInVoterList.age,
      phone: voterInVoterList.phone,
      email: voterInVoterList.email,
      aadhaarID: aadhaarId,
    });

    if (!voter) {
      throw new ApiError(500, "Voter registration failed");
    }
    const token = await voter.generateAccessToken();
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json(new ApiResponse(200, voter, "Voter registered successfully"));
  } catch (err) {
    console.log("❌ User registration failed:", err);
    throw new ApiError(500, "User registration failed", err);
  } finally {
    cleanupFiles(file);
  }
});

export const getCurrentVoter = ApiHandler(async function (req, res) {
  const id = req.user._id;
  if (!id) {
    throw new ApiError(404, "Voter not found");
  }
  const voter = await Voter.findById(id).select("-aadhaarID -aadhaarIV");
  if (!voter) {
    throw new ApiError(404, "Voter not found in database");
  }
  res.json(new ApiResponse(200, voter, "Voter found successfully"));
});

export const SendUserOTP = ApiHandler(async function (req, res) {
  const { aadhaarID } = req.body;

  if (!aadhaarID) {
    throw new ApiError(400, "Aadhaar ID is required");
  }

  const voter = VoterList.find((voter) => voter.aadhaar === aadhaarID);

  if (!voter) {
    throw new ApiError(404, "Voter not found");
  }

  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const code = generateOTP();
  const result = await sendOTP(voter.phone, code);

  if (!result) {
    throw new ApiError(500, "OTP could not be sent");
  }

  const otp = await OTP.create({ phone: voter.phone, otp: code });

  console.log(otp);
  res.json(new ApiResponse(200, "OTP sent successfully"));
});

export const addAdmin = ApiHandler(async function (req, res) {
  const { name, email, permanentAddress, phone, age, WorkingAddress } = req.body;
  const image = req.file.path;

  if (!name || !email || !image || !permanentAddress || !phone || !age || !WorkingAddress) {
    throw new ApiError(400, "All fields are required");
  }
  // TODO: phone number validation
  if (phone.length !== 10) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }

  if (age < 18) {
    throw new ApiError(400, "Age must be at least 18");
  }

  const existingAdmin = await Voter.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin with this email already exists");
  }

  const localImagePath = path.resolve(image);
  const imageUrl = await uploadToCloudinary(localImagePath);
  if (!imageUrl) {
    throw new ApiError(500, "Image upload failed");
  }

  const admin = await Voter.create({
    name,
    email,
    image: imageUrl,
    permanentAddress,
    phone,
    age,
    isVerifiedAdmin: false,
    role: "admin",
    WorkingAddress: WorkingAddress
  });

  if (!admin) {
    throw new ApiError(500, "Admin registration failed");
  }

  await EventLogger("Admin registered", "Admin registered successfully", req);
  res.json(new ApiResponse(200, admin, "Admin registered successfully"));
});

export const getAllAdmins = ApiHandler(async function (req, res) {
  const admins = await Voter.find({ role: "admin" }).select("-aadhaarID -aadhaarIV");
  if (!admins) {
    throw new ApiError(404, "Admin not found");
  }
  res.json(new ApiResponse(200, admins, "Admin found successfully"));
})

export const getByIdAdmin = ApiHandler(async function (req, res) {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "id is required");
  }
  const admin = await Voter.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  res.json(new ApiResponse(200, admin, "Admin found successfully"));
});

export const deleteAdminById = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const admin = await Voter.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  if (admin.role !== "admin") {
    throw new ApiError(403, "You are not authorized to delete this voter");
  }

  await admin.deleteOne();
  await EventLogger("Admin deleted", "Admin deleted successfully", req);
  res.json(new ApiResponse(200, "Admin deleted successfully"));
});

export const verifyAdmin = ApiHandler(async function (req, res) {
  const { email, otp } = req.body;
  const file = req.file.path;
  // find the opt that is given by the admin in database then find the admin from the id in otp
  const admin = await Voter.findOne({ email });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const otpFromDB = await OTP.findOne({ phone: admin.phone });
  if (!otpFromDB) {
    throw new ApiError(400, "OTP not found");
  }

  if (otpFromDB.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  const filePath = path.resolve(file);
  const result = await verifyFaces(admin.image, filePath);
  
  if (!result.verified) {
    throw new ApiError(400, "Face verification failed", result.reason);
  }

  admin.isVerifiedAdmin = true;
  await admin.save();

  const accessToken = await admin.generateAccessToken();

  await EventLogger("Admin logged In", "Admin logged In successfully", req);
  res
    .cookie("token", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, admin, "Admin verified successfully"));
});

export const getOTP = ApiHandler(async function (req, res) {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const admin = await Voter.findOne({ email, role: "admin" });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }


  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const otp = generateOTP();

  const result = await sendOTP(admin.phone, otp);
  if (!result) {
    throw new ApiError(500, "OTP could not be sent");
  }

  await OTP.create({ phone: admin.phone, otp });
  res.json(new ApiResponse(200, "OTP sent successfully"));
});

// export const GetCandidateWorks = ApiHandler(async (req, res) => {
//   const results = await googleSearch("works done by narendra modi")

//   let paragraphsArray = [];

//   for (const result of results) {
//     const paragraphs = await scrapeUrl(result.link)
//     paragraphs.length > 0 && paragraphsArray.push(paragraphs)
//     console.log(result.link, paragraphs)
//   }

//   console.log(paragraphsArray)
//   res.json(paragraphsArray)
// })

// optimized way
// export const GetCandidateWorks = ApiHandler(async (req, res) => {
//   const { candidateName } = req.body;

//   if (!candidateName) {
//     throw new ApiError(400, "Candidate name is required");
//   }

//   const results = await googleSearch(
//     `works done by ${candidateName} in bullet points`
//   );

//   const scrapePromises = results.map(async (result) => {
//     const paragraphs = await scrapeUrl(result.link);
//     return paragraphs.length > 0 && paragraphs;
//   });

//   const paragraphsArray = await Promise.all(scrapePromises);
//   const filteredResults = paragraphsArray
//     .filter((p) => p && p.length > 0)
//     .flat();

//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders(); // Ensure headers are sent immediately

//   try {
//     const stream =
//       await llama(`list the works and development schemes in bullet points from:

//     ${filteredResults}`);

//     for await (const chunk of stream) {
//       res.write(`data: ${JSON.stringify(chunk.message.content)}\n\n`);
//       console.log(chunk.message.content);
//     }
// res.write("event: end\ndata: [DONE]\n\n");
//     res.end();
//   } catch (error) {
//     console.error("Streaming Error:", error);
//     res.write(`event: error\ndata: ${JSON.stringify(error)}\n\n`);
//     res.end();
//   }
// });

export const GetCandidateWorks = ApiHandler(async (req, res) => {
  const { location, candidateName } = req.body;

  if (!location || !candidateName) {
    throw new ApiError(400, "Candidate name and location are required");
  }

  const candidate = await Candidate.findOne({ location, name: candidateName });
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  const cachedWork = await CandidateWorks.findOne({
    candidateID: candidate._id,
  });
  if (cachedWork) {
    return res.json(cachedWork.works);
  }

  // Step 1: Get Google Search Results
  const searchResults = await googleSearch(`works done by ${candidateName}`);

  // Step 2: Scrape each result
  const scrapedData = await Promise.all(
    searchResults.map(async (result) => await scrapeUrl(result.link))
  );

  const flatParagraphs = scrapedData.flat().filter(Boolean);
  if (flatParagraphs.length === 0) {
    throw new ApiError(404, "No relevant data found from scraping.");
  }

  // Step 3: Prepare for Streaming Summary
  const STREAM_WINDOW_SIZE = 800;
  const attentionSink = "[SINK]";
  let finalSummary = "";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Send headers immediately

  try {
    for (let i = 0; i < flatParagraphs.length; i += STREAM_WINDOW_SIZE) {
      const chunk = flatParagraphs.slice(i, i + STREAM_WINDOW_SIZE);
      const chunkContext = chunk
        .map((para, idx) => `Source ${i + idx + 1}: ${para}`)
        .join("\n\n");

      const llamaPrompt = `
${attentionSink}
You are a helpful assistant. Summarize the candidate's works below in bullet points:
${chunkContext}
Focus only on the works, ignore unrelated content.
`;

      const chunkResponse = await llama(llamaPrompt);

      // Stream the response
      for await (const part of chunkResponse) {
        const content = part.message.content.trim();
        finalSummary += `${content} `;
        res.write(`data: ${JSON.stringify(content)}\n\n`);
      }
    }

    // Step 4: Finish the stream
    res.write(`event: end\ndata: [DONE]\n\n`);
    res.end();

    // Step 5: Save the generated summary
    await CandidateWorks.create({
      candidateID: candidate._id,
      works: finalSummary.trim(),
    });

    console.log("Final Summary Saved for:", candidateName);
  } catch (error) {
    console.error("Streaming Error:", error);
    res.write(`event: error\ndata: ${JSON.stringify(error.message)}\n\n`);
    res.end();
  }
});

export const addVotersInVoterlist = ApiHandler(async (req, res) => {
  console.log(req.file);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const VOTERLIST_FILE = path.join(__dirname, "Voterlist.json");

  // Ensure voterlist.json exists
  if (!fs.existsSync(VOTERLIST_FILE)) {
    fs.writeFileSync(VOTERLIST_FILE, "[]", "utf-8");
  }

  console.log(req.file);
  
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(req.file.path, "utf-8"));
  } catch (err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }

  // Ensure the uploaded data is an array
  if (!Array.isArray(data)) {
    return res.status(400).json({ message: "Uploaded JSON should be an array" });
  }

  // Validate each voter object
  for (const [index, voter] of data.entries()) {
    if (
      typeof voter !== "object" ||
      typeof voter.name !== "string" ||
      typeof voter.age !== "number" ||
      typeof voter.image !== "string" ||
      typeof voter.address !== "string" ||
      typeof voter.phone !== "string" ||
      typeof voter.email !== "string" ||
      typeof voter.aadhaar !== "string"
    ) {
      return res.status(400).json({
        message: `Invalid voter at index ${index}. Each voter must have: name, age, image, address, phone, email, aadhaar`,
        voter,
      });
    }
  }

  // Read existing voter list
  let voterlist = [];
  try {
    voterlist = JSON.parse(fs.readFileSync(VOTERLIST_FILE, "utf-8"));
    if (!Array.isArray(voterlist)) throw new Error();
  } catch {
    return res.status(500).json({ message: "voterlist.json is corrupted" });
  }

  // Append validated data
  voterlist.push(...data);
  fs.writeFileSync(VOTERLIST_FILE, JSON.stringify(voterlist, null, 4), "utf-8");

  // Remove uploaded file after processing
  fs.unlinkSync(req.file.path);

  res.json({
    message: "Voters added successfully",
    total_voters: voterlist.length,
  });
});

export const getVotersByElection = ApiHandler(async (req, res) => {
  // get the assembly from the assemblyID in the election
  // get the areas from the areasUnder in the assembly
  // get the voters from the area in the permanentAddress

  const { assemblyID } = req.params;

  const assembly = await Assembly.findById(assemblyID);
  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }

  const areas = assembly.areasUnder;
  const query = {
    $or: areas.map(area => ({
      permanentAddress: { $regex: `\\b${area}\\b`, $options: "i" }
    }))
  };

  const voters = await Voter.find(query)
  if (!voters) {
    throw new ApiError(404, "Voters not found");
  }
  res.json(new ApiResponse(200, voters.length, "Votes found successfully"));
});