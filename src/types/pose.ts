export const POSE_CATEGORIES = [
  "Solo portraits",
  "Full-body poses",
  "Sitting poses",
  "Walking poses",
  "Couple poses",
  "Group poses",
  "Travel photography",
] as const;

export type PoseCategory = (typeof POSE_CATEGORIES)[number];
export type PoseDifficulty = "easy" | "medium" | "hard";

export const REFERENCE_LANDMARK_NAMES = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
] as const;

export type ReferenceLandmarkName = (typeof REFERENCE_LANDMARK_NAMES)[number];

export interface PoseLandmark {
  name: ReferenceLandmarkName;
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export type PoseLandmarks = PoseLandmark[];

export interface ReferencePose {
  poseId: string;
  aspectRatio: number;
  landmarks: PoseLandmarks;
}

export interface Pose {
  id: string;
  name: string;
  category: PoseCategory;
  thumbnail: string;
  referenceImage: string;
  imageAlt: string;
  difficulty: PoseDifficulty;
  description: string;
  instructions: string[];
  tips: string[];
  photographer: string;
  sourceUrl: string;
  featured?: boolean;
  referencePose?: ReferencePose;
}

export type PoseBodyPart = "head" | "shoulders" | "arms" | "torso" | "legs";

export type PoseFeedbackKind = "instruction" | "correction" | "success";

export interface PoseFeedback {
  kind: PoseFeedbackKind;
  message: string;
  landmarkIndex?: number;
  bodyPart?: PoseBodyPart;
}

export interface PoseBodyPartScore {
  bodyPart: PoseBodyPart;
  score: number;
  confidence: number;
}

export interface PoseMismatch {
  bodyPart: PoseBodyPart;
  landmarkName?: ReferenceLandmarkName;
  error: number;
  direction?: "raise" | "lower" | "bend" | "straighten" | "inward" | "outward" | "left" | "right";
}

export interface AlignmentResult {
  score: number;
  isAligned: boolean;
  confidence: number;
  bodyPartScores: PoseBodyPartScore[];
  missingLandmarks: ReferenceLandmarkName[];
  majorMismatches: PoseMismatch[];
  feedback: PoseFeedback[];
}