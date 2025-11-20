import path from "path";

// models
import VoterList from "../models/voterDB/VoterList.model.js";
import OTP from "./../models/voterDB/otp.model.js";
import Admin from "./../models/voterDB/admin.model.js";
import Candidate from "../models/ballotDB/candidate.model.js";
import { Voter } from "./../models/voterDB/voter.model.js";
import { AdminApprovalRequest } from "../models/auditDB/adminApprovalRequest.model.js";
import CandidateWorks from "../models/ballotDB/CandidateWorks.model.js";

// utils
import { ApiError } from "./../utils/system/ApiError.js";
import { ApiResponse } from "./../utils/system/ApiResponse.js";
import { ApiHandler } from "./../utils/system/ApiHandler.js";
import { verifyFaces } from "../utils/third_party/faceApiService.js";
import { sendOTP } from "./../utils/third_party/SendSMS.js";
import { uploadToCloudinary } from "../utils/third_party/CloudinaryUpload.js";
import { cleanupFiles } from "./../utils/system/fileCleanup.js";
import { appendAudit } from "../utils/database/EventLogger.js";
import { webSearch } from "../utils/third_party/web_search.js";

export const registerVoter = ApiHandler(async function (req, res) {
  const file = req.file.path;
  const voterId = req.body.voterId;
  const otp = req.body.otp;

  if (!voterId || !otp || !file) {
    throw new ApiError(400, "All fields are required");
  }

  const voterInVoterList = await VoterList.compareVoterId(voterId);
  if (!voterInVoterList) {
    throw new ApiError(400, "You are not in the voterlist");
  }

  const isOtpValid = await OTP.findOne({
    phone: voterInVoterList.phone,
    seen: false,
  });
  if (!isOtpValid || !isOtpValid.compareOTP(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }
  isOtpValid.seen = true;
  await isOtpValid.save();
  try {
    // Photo verification
    const inputImage = path.resolve(voterInVoterList.image);
    const filePath = path.resolve(file);
    const result = await verifyFaces(inputImage, filePath);
    if (!result.verified) {
      throw new ApiError(400, "Face verification failed", result.reason);
    }

    const voter = await Voter.create({
      voterId,
      name: voterInVoterList.voters[0].name,
      constituency: voterInVoterList.constituency,
      age: voterInVoterList.voters[0].age,
      phone: voterInVoterList.voters[0].phone,
      email: voterInVoterList.voters[0].email,
      image: voterInVoterList.voters[0].image,
      aadhaarID: voterInVoterList.voters[0].aadhaarID,
      address: voterInVoterList.voters[0].address,
      verified: true,
    });

    if (!voter) {
      throw new ApiError(500, "Voter registration failed");
    }

    event_payload = {
      voterId,
      email: voter.email,
      constituency: voter.constituency,
      age: voter.age,
      phone: voter.phone,
      address: voter.address,
    };
    metadata = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      location: req.headers["x-forwarded-for"],
      browser: req.headers["user-agent"],
      time: new Date().toISOString(),
      os: req.headers["os"],
    };
    await appendAudit("Voter logged in", event_payload, metadata);

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
    console.log("❌ Voter registration failed:", err);
    throw new ApiError(500, "Voter registration failed", err);
  } finally {
    cleanupFiles(file);
  }
});

export const getCurrentVoter = ApiHandler(async function (req, res) {
  if (!req.user) {
    throw new ApiError(404, "Voter not found");
  }
  res.json(new ApiResponse(200, req.user, "Voter found successfully"));
});

export const SendUserOTP = ApiHandler(async function (req, res) {
  const { voterId } = req.body;

  if (!voterId) {
    throw new ApiError(400, "Voter ID is required");
  }

  const voter = await VoterList.compareVoterId(voterId);

  if (!voter || voter.voters.length > 0) {
    throw new ApiError(404, "Voter not found");
  }

  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const code = generateOTP();
  const result = await sendOTP(voter.voters[0].phone, code);

  if (!result) {
    throw new ApiError(500, "OTP could not be sent");
  }

  const otp = await OTP.create({ phone: voter.phone, otp: code });

  console.log(otp);
  res.json(new ApiResponse(200, "OTP sent successfully"));
});

export const addAdmin = ApiHandler(async function (req, res) {
  // check for approval request
  const { constituency } = req.body;
  const approvalRequest = await AdminApprovalRequest.findOne({
    constituency,
    request: "addAdmin",
    status: "approved",
    requestedBy: req.user._id,
  });
  if (!approvalRequest) {
    throw new ApiError(
      400,
      "No pending approval request for this constituency"
    );
  }

  const { email, age, phone, address, name } = req.body;
  const image = req.file.path;

  if (
    !name ||
    !email ||
    !image ||
    !constituency ||
    !phone ||
    !age ||
    !address
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // TODO: phone number validation
  if (phone.length !== 10) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }

  if (age < 18) {
    throw new ApiError(400, "Age must be at least 18");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin with this email already exists");
  }

  const localImagePath = path.resolve(image);
  const imageUrl = await uploadToCloudinary(localImagePath);
  if (!imageUrl) {
    throw new ApiError(500, "Image upload failed");
  }

  const admin = await Admin.create({
    name,
    constituency,
    age,
    phone,
    email,
    image: imageUrl,
    address,
    verified: false,
  });

  if (!admin) {
    throw new ApiError(500, "Admin registration failed");
  }
  event_payload = {
    name: admin.name,
    constituency: admin.constituency,
    age: admin.age,
    phone: admin.phone,
    email: admin.email,
    image: admin.image,
    address: admin.address,
    verified: admin.verified,
  };
  metadata = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    addedby: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Admin registered", event_payload, metadata);
  res.json(new ApiResponse(200, admin, "Admin registered successfully"));
});

export const getAllAdmins = ApiHandler(async function (req, res) {
  const { constituency } = req.params;
  const admins = await Admin.find({ constituency });
  if (!admins) {
    throw new ApiError(404, "Admin not found");
  }
  res.json(new ApiResponse(200, admins, "Admin found successfully"));
});

export const getByIdAdmin = ApiHandler(async function (req, res) {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "id is required");
  }
  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  res.json(new ApiResponse(200, admin, "Admin found successfully"));
});

export const deleteAdminById = ApiHandler(async function (req, res) {
  // Approve the deletion request
  const approvalRequest = await AdminApprovalRequest.findOne({
    _id: id,
    request: "removeAdmin",
    status: "approved",
    requestedBy: req.user._id,
  });
  if (!approvalRequest) {
    throw new ApiError(
      400,
      "No pending approval request for this constituency"
    );
  }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "id is required");
  }
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  event_payload = {
    name: admin.name,
    constituency: admin.constituency,
    age: admin.age,
    phone: admin.phone,
    email: admin.email,
    image: admin.image,
    address: admin.address,
  };
  metadata = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    deletedby: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Admin deleted", event_payload, metadata);
  res.json(new ApiResponse(200, "Admin deleted successfully"));
});

export const verifyAdmin = ApiHandler(async function (req, res) {
  const { email, otp } = req.body;
  const file = req.file.path;
  // find the opt that is given by the admin in database then find the admin from the id in otp
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const otpFromDB = await OTP.findOne({ phone: admin.phone });
  if (!otpFromDB) {
    throw new ApiError(400, "OTP not found");
  }

  if (!otpFromDB.compareOtp(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  const filePath = path.resolve(file);
  const result = await verifyFaces(admin.image, filePath);

  if (!result.verified) {
    throw new ApiError(400, "Face verification failed", result.reason);
  }

  admin.verified = true;
  await admin.save();

  const accessToken = await admin.generateAccessToken();

  event_payload = {
    name: admin.name,
    constituency: admin.constituency,
    age: admin.age,
    phone: admin.phone,
    email: admin.email,
    image: admin.image,
    address: admin.address,
  };
  metadata = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    time: new Date().toISOString(),
    verifiedby: req.user._id,
  };
  await appendAudit("Admin verified", event_payload, metadata);
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

  const admin = await Admin.findOne({ email });

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

export const GetCandidateWorks = ApiHandler(async (req, res) => {
  const { constituency, name, candidateCode } = req.body;

  if (!constituency || !name || !candidateCode) {
    throw new ApiError(
      400,
      "Constituency, name, and candidate code are required"
    );
  }

  const candidate = await Candidate.findOne({
    constituency,
    name,
    candidateCode,
  });
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  const cachedWork = await CandidateWorks.findOne({
    candidateID: candidate._id,
  });
  if (cachedWork) {
    return res.json(cachedWork.works);
  }

  const works = webSearch("Tell works done by " + name + " in " + constituency);
  await CandidateWorks.create({ candidateID: candidate._id, works });
  res.json(works);
});

export const addVotersInVoterlist = ApiHandler(async (req, res) => {
  // approval request is required
  const approvalRequest = await AdminApprovalRequest.findOne({
    status: "approved",
    request: "addVoter",
    requestedBy: req.user._id,
  });
  if (!approvalRequest) {
    throw new ApiError(
      400,
      "No pending approval request for this constituency"
    );
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(req.file.path, "utf-8"));
  } catch {
    return res.status(400).json({ message: "Invalid JSON format" });
  }

  const { election, constituency, voters } = data;

  if (
    !election ||
    !constituency ||
    !Array.isArray(voters) ||
    voters.length === 0
  ) {
    return res
      .status(400)
      .json({
        message: "Election, constituency, and voters array are required",
      });
  }

  // Validate voter fields
  for (const [index, voter] of voters.entries()) {
    const requiredFields = [
      "name",
      "age",
      "image",
      "address",
      "phone",
      "email",
      "aadhaarID",
    ];
    for (const field of requiredFields) {
      if (!voter[field]) {
        return res.status(400).json({
          message: `Voter at index ${index} is missing required field: ${field}`,
          voter,
        });
      }
    }
    // Assign a temporary voterId if missing
    if (!voter.voterId) voter.voterId = crypto.randomUUID();
  }

  // Check duplicate Aadhaar in DB
  const aadhaarList = voters.map((v) => v.aadhaarID);
  const existingVoters = await VoterList.findOne({
    "voters.aadhaarID": { $in: aadhaarList },
  });

  if (existingVoters) {
    return res.status(400).json({
      message: "Duplicate Aadhaar numbers found in database",
      voters: existingVoters.voters.filter((v) =>
        aadhaarList.includes(v.aadhaarID)
      ),
    });
  }

  // Save voters
  const voterListDoc = new VoterList({ election, constituency, voters });
  const savedData = await voterListDoc.save();

  res.json(new ApiResponse(200, savedData, "Voters added successfully"));
});
export const getVotersByElection = ApiHandler(async (req, res) => {
  const { electionID } = req.params;
  const voters = await VoterList.findOne({ election: electionID });
  if (!voters) {
    throw new ApiError(404, "Voters not found");
  }
  res.json(new ApiResponse(200, voters.length, "Votes found successfully"));
});
