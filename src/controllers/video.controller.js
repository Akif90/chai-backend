import mongoose, { Mongoose, Schema, isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = _id,
    sortType = 1,
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  console.log(userId, query);
  const videos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $match: {
        title: {
          $regex: query,
          $options: "i",
        },
      },
    },
    {
      $sort: {
        sortBy: sortType,
        _id: 1,
      },
    },
    {
      $skip: page * limit,
    },
    { $limit: limit },
  ]);

  if (!videos) {
    throw new ApiError(400, "Not Video found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "Searched videos fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  //Modification because of POSTMAN
  const data = JSON.parse(req.body.data);
  const { title, description } = data;

  const user = req.user;

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError("400", "Upload resources please");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const duration = video.duration;

  const newVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration,
    title,
    description,
    owner: user._id,
  });

  if (!newVideo)
    return res.status(400).json(new ApiError(400, "Error while uploading"));

  return res.status(200).json(new ApiResponse(200, { newVideo }, "Published"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by
  const { videoId } = req.params;
  if (!videoId) return res.json(new ApiError(400, "No video Id found"));
  const video = await Video.findById(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Feteched video successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;
  if (!title && !thumbnailLocalPath && !description && !videoId) {
    return res.json(new ApiError(400, "No resources to update"));
  }
  const video = await Video.findById(videoId);
  if (title) video.title = title;
  if (description) video.description = description;
  if (thumbnailLocalPath) {
    const prevThumbnailURL = video.thumbnail;
    const publicID = prevThumbnailURL.split("/").slice(-1)[0].split(".")[0];
    await deleteFromCloudinary(publicID);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    video.thumbnail = thumbnail.url;
  }
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  if (!videoId) return res.json(new ApiError(400, "NO videoId found"));

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const thumbnailURL = video.thumbnail;
  const videoURL = video.videoFile;
  const thumbnailPublicID = thumbnailURL.split("/").slice(-1)[0].split(".")[0];
  const videoPublicID = videoURL.split("/").slice(-1)[0].split(".")[0];
  await deleteFromCloudinary(thumbnailPublicID);
  await deleteFromCloudinary(videoPublicID);
  await Video.deleteOne({ _id: videoId });

  return res.json(new ApiResponse(200, {}, "Delete Operation successful "));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "No video found");
  }

  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Toggled Publish Status"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
