import type { book, bookSegment, voiceSession } from "#/db/schema";
import { PlanType } from "@/lib/subscription-constants";
import { UploadSchema } from "@/lib/zod";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import z from "zod";

// ============================================
// DATABASE MODELS
// ============================================

export type Book = InferSelectModel<typeof book>;

export type BookSegment = InferSelectModel<typeof bookSegment>;

export type VoiceSession = InferSelectModel<typeof voiceSession>;


// ============================================
// FORM & INPUT TYPES
// ============================================

export type BookUploadFormValues = z.infer<typeof UploadSchema>;

export interface CreateBook {
  clerkId: string;
  title: string;
  author: string;
  persona?: string;
  fileURL: string;
  fileBlobKey: string;
  coverURL?: string;
  coverBlobKey?: string;
  fileSize: number;
}

export interface TextSegment {
  text: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

export interface BookCardProps {
  title: string;
  author: string;
  coverURL: string;
  slug: string;
}

export interface Messages {
  role: string;
  content: string;
}

export interface ShadowBoxProps {
  children: ReactNode;
  className?: string;
}

export interface VoiceSelectorProps {
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange: (voiceId: string) => void;
}

export interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface FileUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  acceptTypes: string[];
  disabled?: boolean;
  icon: LucideIcon;
  placeholder: string;
  hint: string;
}

export interface SessionCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  plan: PlanType;
  maxDurationMinutes: number;
  error?: string;
}

export interface StartSessionResult {
  success: boolean;
  sessionId?: string;
  maxDurationMinutes?: number;
  error?: string;
  isBillingError?: boolean;
}

export interface EndSessionResult {
  success: boolean;
  error?: string;
}

export interface TranscriptMessage {
  type: "transcript";
  role: "user" | "assistant";
  transcriptType: "partial" | "final";
  transcript: string;
}