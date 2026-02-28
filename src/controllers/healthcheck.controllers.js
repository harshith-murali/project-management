import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
// const healthCheck = (req, res) => {
//   try {
//     res.status(200).json(new ApiResponse(200, "Server is healthy"));
//   } catch (error) {
//     console.error("Error in health check: ", error);
//     const response = new ApiResponse(500, "Internal Server Error");
//     res.status(500).json(response);
//   }
// };

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "Server is healthy"));
});

export default healthCheck;
