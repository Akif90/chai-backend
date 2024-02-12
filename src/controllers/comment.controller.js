import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 0, limit = 10 } = req.query;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No video found");
  }
  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: page * 10,
    },
    {
      $limit: limit,
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments },
        "Comments for the video fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const user = req.user;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "No Video found");
  }

  const comment = await Comment.create({
    content,
    video: video._id,
    owner: user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "No Comment found");
  }
  comment.content = content;
  await comment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment modified"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "No Comment found");
  }
  await Comment.deleteOne(commentId);
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
