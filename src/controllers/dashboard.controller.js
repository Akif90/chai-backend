import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const user = req.user;

  const stats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
        pipeline: [
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
            },
          },
          {
            $project: {
              count: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "Videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "Likes",
              pipeline: [
                {
                  $group: {
                    _id: null,
                    likesCount: {
                      $count: {},
                    },
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $count: {},
              },
              totalViews: {
                $sum: "$views",
              },
              totalLikes: {
                $sum: {
                  $size: "$Likes",
                },
              },
            },
          },
          {
            $project: {
              count: 1,
              totalViews: 1,
              totalLikes: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        Videos: {
          $first: "$Videos",
        },
        Subscribers: {
          $first: "$Subscribers",
        },
      },
    },
    {
      $project: {
        Videos: 1,
        Subscribers: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, { stats }, "Stats fetched for the channel"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const user = req.user;
  const videos = await Video.find({
    owner: user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "All videos fetched"));
});

export { getChannelStats, getChannelVideos };
