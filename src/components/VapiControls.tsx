import Transcript from "#/components/Transcript";
import useVapi from "#/hooks/useVapi";
import { Mic, MicOff } from "lucide-react";
import type { Book } from "types";

const formatDuration = (totalSeconds: number): string => {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getStatusDotClass = (status: string) => {
	switch (status) {
		case "connecting":
			return "vapi-status-dot-connecting";
		case "starting":
			return "vapi-status-dot-starting";
		case "listening":
			return "vapi-status-dot-listening";
		case "thinking":
			return "vapi-status-dot-thinking";
		case "speaking":
			return "vapi-status-dot-speaking";
		default:
			return "vapi-status-dot-ready";
	}
};

const VapiControls = ({ book }: { book: Book }) => {
	const {
		status,
		isActive,
		messages,
		currentMessage,
		currentUserMessage,
		duration,
		start,
		stop,
		clearErrors,
		limitError,
	} = useVapi(book);

	const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
	const coverSrc = book.coverURL || "/assets/book-cover.svg";

	return (
		<div className="max-w-4xl mx-auto w-full space-y-8">
			<div className="vapi-header-card">
				<div className="vapi-cover-wrapper shrink-0">
					<img
						src={coverSrc}
						alt={book.title}
						width={140}
						height={140}
						className="vapi-cover-image w-25 h-25 sm:w-32.5 sm:h-32.5 object-contain bg-white rounded-xl"
					/>
					<div className="vapi-mic-wrapper">
						<button
							type="button"
							className={`vapi-mic-btn shadow-soft-md ${isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"}`}
							aria-label={isActive ? "Stop conversation" : "Start conversation"}
							onClick={isActive ? stop : start}
							disabled={status === "connecting" || status === "starting"}
						>
							{isActive && (status === "speaking" || status === "thinking") ? (
								<span className="vapi-pulse-ring" />
							) : null}
							{isActive ? (
								<Mic className="size-5 sm:size-6 text-white" />
							) : (
								<MicOff className="size-5 sm:size-6 text-[#212a3b]" />
							)}
						</button>
					</div>
				</div>

				<div className="flex-1 flex flex-col gap-3 justify-center">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-[#212a3b] font-serif tracking-tight">
							{book.title}
						</h1>
						<p className="text-sm sm:text-base text-[#3d485e]">
							by {book.author}
						</p>
					</div>

					<div className="flex items-center gap-3 flex-wrap">
						<div className="vapi-status-indicator rounded-full py-1.5 px-4">
							<span
								className={`vapi-status-dot ${getStatusDotClass(status)}`}
							/>
							<span className="vapi-status-text text-sm font-medium">
								{statusLabel}
							</span>
						</div>

						<div className="vapi-status-indicator rounded-full py-1.5 px-4">
							<span className="vapi-status-text text-sm font-medium">
								Voice: {book.persona || "Dave"}
							</span>
						</div>

						<div className="vapi-status-indicator rounded-full py-1.5 px-4">
							<span className="vapi-status-text text-sm font-medium">
								{formatDuration(duration)} / 15:00
							</span>
						</div>
					</div>
				</div>
			</div>

			{limitError ? (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
					<p className="text-sm font-medium">{limitError}</p>
					<button
						type="button"
						onClick={clearErrors}
						className="text-xs font-bold uppercase tracking-wider hover:text-red-800 transition-colors"
					>
						Dismiss
					</button>
				</div>
			) : null}

			<div className="vapi-transcript-wrapper">
				<Transcript
					messages={messages}
					currentMessage={currentMessage}
					currentUserMessage={currentUserMessage}
				/>
			</div>
		</div>
	);
};

export default VapiControls;
