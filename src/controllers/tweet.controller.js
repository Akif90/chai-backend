import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const user = req.user;
  const { content } = req.body;
  console.log(req.user);
  if (!content) {
    throw new ApiError(400, "No content available");
  }
  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });

  return res.status(200).json(new ApiResponse(200, { tweet }, "Tweet Created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const tweets = await Tweet.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { tweets }, "Tweets Fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet Modified"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  await Tweet.deleteOne({ _id: tweetId });
  return res.status(200).json(new ApiResponse(200, {}, "Tweet Deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
