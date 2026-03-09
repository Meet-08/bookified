import {
	ACCEPTED_IMAGE_TYPES,
	ACCEPTED_PDF_TYPES,
	MAX_FILE_SIZE,
	MAX_IMAGE_SIZE,
	voiceOptions,
} from "@/lib/constants";
import z from "zod";

export const SUPPORTED_VOICES = Object.keys(voiceOptions) as [
	string,
	...string[],
];

export const UploadSchema = z.object({
	pdfFile: z
		.custom<File>((val) => val instanceof File, {
			message: "PDF file is required",
		})
		.refine(
			(file) => file instanceof File && file.size <= MAX_FILE_SIZE,
			"PDF must be less than 50MB",
		)
		.refine(
			(file) => file instanceof File && ACCEPTED_PDF_TYPES.includes(file.type),
			"Only PDF files are accepted",
		),

	coverImage: z
		.custom<File>((val) => val === undefined || val instanceof File)
		.refine(
			(file) =>
				file === undefined ||
				(file instanceof File && file.size <= MAX_IMAGE_SIZE),
			"Cover image must be less than 10MB",
		)
		.refine(
			(file) =>
				file === undefined ||
				(file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
			"Only JPEG, PNG, or WebP images are accepted",
		)
		.optional(),

	title: z
		.string()
		.transform((s) => s.trim())
		.pipe(
			z
				.string()
				.min(1, "Title is required")
				.max(200, "Title must be under 200 characters"),
		),

	author: z
		.string()
		.transform((s) => s.trim())
		.pipe(
			z
				.string()
				.min(1, "Author name is required")
				.max(200, "Author name must be under 200 characters"),
		),

	voice: z.enum(SUPPORTED_VOICES, { message: "Please select a voice" }),
});
