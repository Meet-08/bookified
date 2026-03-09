/** biome-ignore-all lint/a11y/useSemanticElements: Due to drag and drop div is used as button*/
import {
	DEFAULT_VOICE,
	voiceCategories,
	voiceOptions,
} from "#/lib/constants.ts";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { UploadSchema } from "@/lib/zod";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { BookUploadFormValues } from "types";

export function BookUploadForm() {
	const { userId } = useAuth();
	const pdfInputRef = useRef<HTMLInputElement>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<BookUploadFormValues>({
		resolver: zodResolver(UploadSchema),
		defaultValues: {
			pdfFile: undefined,
			coverImage: undefined,
			title: "",
			author: "",
			voice: DEFAULT_VOICE,
		},
	});

	const {
		watch,
		formState: { isSubmitting },
	} = form;
	const pdfFile = watch("pdfFile");
	const coverImage = watch("coverImage");

	async function onSubmit(_values: BookUploadFormValues) {
		if (!userId) {
			toast.error("You must be logged in to upload a book");
			return;
		}
	}

	return (
		<>
			{/* Loading Overlay */}
			{isSubmitting && (
				<div className="loading-wrapper">
					<div className="loading-shadow-wrapper bg-white shadow-soft-lg">
						<div className="loading-shadow">
							<Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
							<h2 className="loading-title">Synthesizing Your Book</h2>
							<p className="text-[#777] text-center max-w-xs">
								Please wait while we process your PDF and prepare your
								interactive literary experience.
							</p>
						</div>
					</div>
				</div>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="new-book-wrapper">
						<div className="space-y-8">
							<FormField
								control={form.control}
								name="pdfFile"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Book PDF File</FormLabel>
										<FormControl>
											<div>
												<input
													ref={pdfInputRef}
													type="file"
													accept=".pdf,application/pdf"
													className="hidden"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) field.onChange(file);
													}}
												/>
												<div
													className={`upload-dropzone border-2 border-dashed border-(--border-medium) ${pdfFile ? "upload-dropzone-uploaded" : ""}`}
													role="button"
													tabIndex={pdfFile ? -1 : 0}
													aria-label="Upload PDF file"
													aria-disabled={!!pdfFile}
													onClick={() =>
														!pdfFile && pdfInputRef.current?.click()
													}
													onKeyDown={(e) => {
														if (
															!pdfFile &&
															(e.key === "Enter" || e.key === " ")
														) {
															e.preventDefault();
															pdfInputRef.current?.click();
														}
													}}
												>
													{pdfFile ? (
														<div className="flex items-center gap-3 px-6 w-full">
															<Upload className="w-6 h-6 shrink-0 text-[#663820]" />
															<span className="upload-dropzone-text truncate flex-1 text-left">
																{(pdfFile as File).name}
															</span>
															<button
																type="button"
																className="upload-dropzone-remove"
																aria-label={`Remove ${(pdfFile as File).name}`}
																onClick={(e) => {
																	e.stopPropagation();
																	field.onChange(undefined);
																	if (pdfInputRef.current)
																		pdfInputRef.current.value = "";
																}}
															>
																<X className="w-4 h-4" />
															</button>
														</div>
													) : (
														<div className="file-upload-shadow">
															<Upload className="upload-dropzone-icon" />
															<p className="upload-dropzone-text">
																Click to upload PDF
															</p>
															<p className="upload-dropzone-hint">
																PDF file (max 50MB)
															</p>
														</div>
													)}
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Cover Image Upload */}
							<FormField
								control={form.control}
								name="coverImage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Cover Image (Optional)</FormLabel>
										<FormControl>
											<div>
												<input
													ref={coverInputRef}
													type="file"
													accept="image/jpeg,image/jpg,image/png,image/webp"
													className="hidden"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) field.onChange(file);
													}}
												/>
												<div
													className={`upload-dropzone border-2 border-dashed border-(--border-medium) ${coverImage ? "upload-dropzone-uploaded" : ""}`}
													role="button"
													tabIndex={coverImage ? -1 : 0}
													aria-label="Upload cover image"
													aria-disabled={!!coverImage}
													onClick={() =>
														!coverImage && coverInputRef.current?.click()
													}
													onKeyDown={(e) => {
														if (
															!coverImage &&
															(e.key === "Enter" || e.key === " ")
														) {
															e.preventDefault();
															coverInputRef.current?.click();
														}
													}}
												>
													{coverImage ? (
														<div className="flex items-center gap-3 px-6 w-full">
															<ImageIcon className="w-6 h-6 shrink-0 text-[#663820]" />
															<span className="upload-dropzone-text truncate flex-1 text-left">
																{(coverImage as File).name}
															</span>
															<button
																type="button"
																className="upload-dropzone-remove"
																aria-label={`Remove ${(coverImage as File).name}`}
																onClick={(e) => {
																	e.stopPropagation();
																	field.onChange(undefined);
																	if (coverInputRef.current)
																		coverInputRef.current.value = "";
																}}
															>
																<X className="w-4 h-4" />
															</button>
														</div>
													) : (
														<div className="file-upload-shadow">
															<ImageIcon className="upload-dropzone-icon" />
															<p className="upload-dropzone-text">
																Click to upload cover image
															</p>
															<p className="upload-dropzone-hint">
																Leave empty to auto-generate from PDF
															</p>
														</div>
													)}
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<input
												{...field}
												className="form-input"
												placeholder="ex: Rich Dad Poor Dad"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Author */}
							<FormField
								control={form.control}
								name="author"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Author Name</FormLabel>
										<FormControl>
											<input
												{...field}
												className="form-input"
												placeholder="ex: Robert Kiyosaki"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Voice Selector */}
							<FormField
								control={form.control}
								name="voice"
								render={({ field }) => (
									<FormItem>
										{/** biome-ignore lint/a11y/noLabelWithoutControl: Multiple form controls */}
										<label className="form-label">Choose Assistant Voice</label>
										<FormControl>
											<div className="space-y-4">
												{/* Male Voices */}
												<div>
													<p className="text-sm font-semibold text-(--color-brand) mb-3">
														Male Voices
													</p>
													<div className="voice-selector-options">
														{voiceCategories.male.map((key) => {
															const voice =
																voiceOptions[key as keyof typeof voiceOptions];
															const isSelected = field.value === key;
															return (
																<label
																	key={key}
																	className={`voice-selector-option cursor-pointer ${isSelected ? "voice-selector-option-selected" : "voice-selector-option-default"}`}
																>
																	<input
																		type="radio"
																		name="voice"
																		value={key}
																		checked={isSelected}
																		onChange={() => field.onChange(key)}
																		className="accent-[#663820] shrink-0 mt-0.5"
																	/>
																	<div className="min-w-0">
																		<p className="font-semibold text-(--text-primary) text-sm leading-5">
																			{voice.name}
																		</p>
																		<p className="text-xs text-(--color-brand) leading-4 mt-0.5">
																			{voice.description}
																		</p>
																	</div>
																</label>
															);
														})}
													</div>
												</div>

												{/* Female Voices */}
												<div>
													<p className="text-sm font-semibold text-(--color-brand) mb-3">
														Female Voices
													</p>
													<div className="voice-selector-options">
														{voiceCategories.female.map((key) => {
															const voice =
																voiceOptions[key as keyof typeof voiceOptions];
															const isSelected = field.value === key;
															return (
																<label
																	key={key}
																	className={`voice-selector-option cursor-pointer ${isSelected ? "voice-selector-option-selected" : "voice-selector-option-default"}`}
																>
																	<input
																		type="radio"
																		name="voice"
																		value={key}
																		checked={isSelected}
																		onChange={() => field.onChange(key)}
																		className="accent-[#663820] shrink-0 mt-0.5"
																	/>
																	<div className="min-w-0">
																		<p className="font-semibold text-(--text-primary) text-sm leading-5">
																			{voice.name}
																		</p>
																		<p className="text-xs text-(--color-brand) leading-4 mt-0.5">
																			{voice.description}
																		</p>
																	</div>
																</label>
															);
														})}
													</div>
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Submit */}
							<button
								type="submit"
								className="form-btn"
								disabled={isSubmitting}
							>
								Begin Synthesis
							</button>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
}
