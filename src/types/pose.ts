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

export interface PoseLandmark {
  x: number;
  y: number;
  visibility?: number;
}

export type PoseLandmarks = PoseLandmark[];

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
  landmarks?: PoseLandmarks;
}

export type PoseFeedbackKind = "instruction" | "correction" | "success";

export interface PoseFeedback {
  kind: PoseFeedbackKind;
  message: string;
  landmarkIndex?: number;
}

export interface AlignmentResult {
  score: number;
  isAligned: boolean;
  feedback: PoseFeedback[];
}