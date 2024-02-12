import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;

  const user = req.user;

  if (!name || !description || !user) {
    throw new ApiError(400, "Missing Fields");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist Created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "No user found");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { playlists }, "Playlist Fetched succesfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "No playlist found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "No playlist found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "No video found");
  }

  playlist.videos.push(video._id);
  await playlist.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Video added to the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "No playlist found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "No video found");
  }

  playlist.videos = playlist.videos.filter(
    (curr) => toString(curr) != toString(video._id)
  );
  console.log(playlist.videos);
  playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "Video removed from the playlist")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "No playlist found");
  }

  await Playlist.deleteOne({ _id: playlistId });

  return res.status(200).json(new ApiError(200, {}, "Playlist Deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId || (!name && !description)) {
    throw new ApiError(400, "Details required");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "No Playlist Found");
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist Modified"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
