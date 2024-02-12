import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const user = req.user;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Resource not found");
  }
  let like = await Like.findOne({
    video: videoId,
    likedBy: user._id,
  });
  if (!like) {
    like = await Like.create({
      video: videoId,
      likedBy: user._id,
    });
  } else {
    like = await Like.deleteOne({
      _id: like._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { like }, "Like for video toggled"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Resource not found");
  }
  const user = req.user;
  let like = await Like.find({
    comment: commentId,
    likedBy: user._id,
  });
  if (!like) {
    like = await Like.create({
      comment: commentId,
      likedBy: user._id,
    });
  } else {
    like = await Like.deleteOne({
      _id: like._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { like }, "Like for comment toggled"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Resource not found");
  }
  const user = req.user;
  let like = await Like.find({
    tweet: tweetId,
    likedBy: user._id,
  });
  if (!like) {
    like = await Like.create({
      tweet: tweetId,
      likedBy: user._id,
    });
  } else {
    like = await Like.deleteOne({
      _id: like._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { like }, "Like for tweet toggled"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user;
  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "video",
        localField: "video",
        foreignField: "_id",
        as: "Video List",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "All liked videos fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
