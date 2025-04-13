import fs from "fs";
import { ApiError } from "./ApiError.js";
// import { ApiHandler } from "./ApiHandler.js";

const cleanupFiles = (file) => {
  fs.unlink(file, (err) => {
    if (err) new ApiError(500, `Failed to delete ${file}:`, err);
  });
};

export { cleanupFiles };
