import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const user = req.user;
  const { channelId } = req.params;
  let subscription = await Subscription.findOne({
    subscriber: user._id,
    channel: channelId,
  });
  let flag = 0;
  if (!subscription) {
    flag = 1;
    subscription = await Subscription.create({
      subscriber: user._id,
      channel: channelId,
    });
  } else {
    await Subscription.findOneAndDelete({
      subscriber: user._id,
      channel: channelId,
    });
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscription },
        `User ${flag === 1 ? "Subscribed" : "Unsuscribed"}`
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.find(
    {
      channel: channelId,
    },
    "subscriber"
  ).populate("subscriber", "fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribers }, "Fetched list of subscribers"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const channelList = await Subscription.find(
    {
      subscriber: subscriberId,
    },
    "channel"
  ).populate("channel", "fullName");

  const result = channelList.map((channel) => {
    return channel.channel;
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { result }, "Fetched Channel Lists"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
