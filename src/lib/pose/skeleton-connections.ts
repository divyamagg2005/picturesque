import type { ReferenceLandmarkName } from "@/types";

export type PoseConnection = readonly [ReferenceLandmarkName, ReferenceLandmarkName];

export const POSE_CONNECTIONS: readonly PoseConnection[] = [
  ["left_eye_inner", "left_eye"],
  ["left_eye", "left_eye_outer"],
  ["right_eye_inner", "right_eye"],
  ["right_eye", "right_eye_outer"],
  ["left_eye_outer", "left_ear"],
  ["right_eye_outer", "right_ear"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["left_wrist", "left_pinky"],
  ["left_wrist", "left_index"],
  ["left_wrist", "left_thumb"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["right_wrist", "right_pinky"],
  ["right_wrist", "right_index"],
  ["right_wrist", "right_thumb"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  ["left_heel", "left_foot_index"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
  ["right_heel", "right_foot_index"],
];