export type PoseDifficulty = "beginner" | "intermediate" | "advanced";

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseLandmarks = PoseLandmark[];

export interface Pose {
  id: string;
  name: string;
  category: string;
  difficulty: PoseDifficulty;
  description: string;
  landmarks: PoseLandmarks;
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