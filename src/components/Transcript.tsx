import { Mic } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Messages } from "types";

interface TranscriptProps {
	messages: Messages[];
	currentMessage?: string;
	currentUserMessage?: string;
}

export default function Transcript({
	messages,
	currentMessage,
	currentUserMessage,
}: TranscriptProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on any message change
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length, currentMessage, currentUserMessage]);

	const isEmpty =
		messages.length === 0 && !currentMessage && !currentUserMessage;

	if (isEmpty) {
		return (
			<div className="transcript-container">
				<div className="transcript-empty">
					<Mic className="w-12 h-12 text-(--text-muted) mb-4" />
					<p className="transcript-empty-text">No conversation yet</p>
					<p className="transcript-empty-hint">
						Click the mic button above to start talking
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="transcript-container">
			<div className="transcript-messages">
				{messages.map((msg, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: append-only transcript list
						key={index}
						className={`transcript-message ${
							msg.role === "user"
								? "transcript-message-user"
								: "transcript-message-assistant"
						}`}
					>
						<div
							className={`transcript-bubble ${
								msg.role === "user"
									? "transcript-bubble-user"
									: "transcript-bubble-assistant"
							}`}
						>
							{msg.content}
						</div>
					</div>
				))}

				{currentUserMessage && (
					<div className="transcript-message transcript-message-user">
						<div className="transcript-bubble transcript-bubble-user">
							{currentUserMessage}
							<span className="transcript-cursor" />
						</div>
					</div>
				)}

				{currentMessage && (
					<div className="transcript-message transcript-message-assistant">
						<div className="transcript-bubble transcript-bubble-assistant">
							{currentMessage}
							<span className="transcript-cursor" />
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>
		</div>
	);
}
