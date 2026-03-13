import { useSubscription } from "#/hooks/useSubscription";
import { getVoice } from "#/lib/utils";
import { endVoiceSession, startVoiceSession } from "#/server/session";

import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constants";
import { useAuth } from "@clerk/tanstack-react-start";
import Vapi from "@vapi-ai/web";
import { useEffect, useRef, useState } from "react";
import type { Book, Messages, TranscriptMessage } from "types";

export type CallStatus =
	| "idle"
	| "connecting"
	| "starting"
	| "listening"
	| "thinking"
	| "speaking";

const useLatestRef = <T>(value: T) => {
	const ref = useRef(value);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref;
};

let vapi: InstanceType<typeof Vapi>;

const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;
const FALLBACK_MAX_SESSION_MINUTES = 15;

function getVapi() {
	if (!vapi) {
		if (!VAPI_API_KEY) {
			throw new Error("VITE_VAPI_API_KEY environment variable is not set");
		}
		vapi = new Vapi(VAPI_API_KEY);
	}
	return vapi;
}

export const useVapi = (book: Book) => {
	const { userId } = useAuth();
	const { limits } = useSubscription();

	const [status, setStatus] = useState<CallStatus>("idle");
	const [messages, setMessages] = useState<Messages[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const [currentUserMessage, setCurrentUserMessage] = useState("");
	const [duration, setDuration] = useState(0);
	const [limitError, setLimitError] = useState<string | null>(null);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const sessionIdRef = useRef<string | null>(null);
	const isStoppingRef = useRef(false);

	const durationRef = useLatestRef(duration);
	const maxSessionMinutes =
		limits.maxSessionMinutes || FALLBACK_MAX_SESSION_MINUTES;
	const maxDurationSeconds = maxSessionMinutes * 60;
	const maxDurationSecondsRef = useLatestRef(maxDurationSeconds);
	const voice = book.persona || DEFAULT_VOICE;

	const isActive =
		status === "listening" || status === "thinking" || status === "speaking";

	useEffect(() => {
		if (!isActive) return;
		if (duration < maxDurationSecondsRef.current) return;
		if (isStoppingRef.current) return;

		isStoppingRef.current = true;
		setLimitError(
			`Session duration limit reached (${maxSessionMinutes} minute${maxSessionMinutes === 1 ? "" : "s"}).`,
		);
		void getVapi().stop();
	}, [duration, isActive, maxDurationSecondsRef, maxSessionMinutes]);

	useEffect(() => {
		const vapiInstance = getVapi();

		const onCallStart = () => {
			setStatus("listening");
			setDuration(0);
			timerRef.current = setInterval(() => {
				setDuration((prev) => prev + 1);
			}, TIMER_INTERVAL_MS);
		};

		const onCallEnd = () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			const finalDuration = durationRef.current;
			const sessionId = sessionIdRef.current;
			if (sessionId) {
				endVoiceSession({
					data: { sessionId, durationSeconds: finalDuration },
				}).catch((err) => console.error("Failed to end voice session:", err));
			}
			sessionIdRef.current = null;
			isStoppingRef.current = false;
			setStatus("idle");
			setDuration(0);
			setCurrentMessage("");
			setCurrentUserMessage("");
		};

		const onSpeechStart = () => {
			setStatus("speaking");
		};

		const onSpeechEnd = () => {
			setStatus("listening");
		};

		const isTranscriptMessage = (msg: unknown): msg is TranscriptMessage => {
			if (typeof msg !== "object" || msg === null) return false;
			const m = msg as Record<string, unknown>;
			return (
				m.type === "transcript" &&
				(m.role === "user" || m.role === "assistant") &&
				(m.transcriptType === "partial" || m.transcriptType === "final") &&
				typeof m.transcript === "string"
			);
		};

		const onMessage = (message: unknown) => {
			if (!isTranscriptMessage(message)) return;

			const { role, transcriptType, transcript } = message;

			if (transcriptType === "partial") {
				if (role === "user") {
					setCurrentUserMessage(transcript);
				} else {
					setCurrentMessage(transcript);
				}
			} else if (transcriptType === "final") {
				if (role === "user") {
					setCurrentUserMessage("");
					setStatus("thinking");
					setMessages((prev) => {
						const last = prev[prev.length - 1];
						if (last && last.role === role && last.content === transcript) {
							return prev;
						}
						return [...prev, { role, content: transcript }];
					});
				} else {
					setCurrentMessage("");
					setStatus("listening");
					setMessages((prev) => {
						const last = prev[prev.length - 1];
						if (last && last.role === role && last.content === transcript) {
							return prev;
						}
						return [...prev, { role, content: transcript }];
					});
				}
			}
		};

		vapiInstance.on("call-start", onCallStart);
		vapiInstance.on("call-end", onCallEnd);
		vapiInstance.on("speech-start", onSpeechStart);
		vapiInstance.on("speech-end", onSpeechEnd);
		vapiInstance.on("message", onMessage);

		return () => {
			vapiInstance.off("call-start", onCallStart);
			vapiInstance.off("call-end", onCallEnd);
			vapiInstance.off("speech-start", onSpeechStart);
			vapiInstance.off("speech-end", onSpeechEnd);
			vapiInstance.off("message", onMessage);
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [durationRef]);

	const start = async () => {
		if (status !== "idle") return;
		if (!userId) return setLimitError("Please login to start a conversation");

		setLimitError(null);
		setStatus("connecting");

		try {
			const res = await startVoiceSession({
				data: { bookId: book.id },
			});

			if (!res.success) {
				setLimitError(
					res.error || "Session limit reached. Please upgrade your plan",
				);
				setStatus("idle");
				return;
			}

			sessionIdRef.current = res.sessionId || null;

			const firstMessage = `Hey, good to meet you. Quick question, before we dive in: have you actually read ${book.title} yet? or are we starting fresh ?`;

			await getVapi().start(ASSISTANT_ID, {
				firstMessage,
				variableValues: {
					title: book.title,
					author: book.author,
					bookId: book.id,
				},
				voice: {
					provider: "11labs" as const,
					voiceId: getVoice(voice).id,
					model: "eleven_turbo_v2_5" as const,
					stability: VOICE_SETTINGS.stability,
					similarityBoost: VOICE_SETTINGS.similarityBoost,
					style: VOICE_SETTINGS.style,
					useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
				},
			});
		} catch (error) {
			console.error("Failed to start VAPI session:", error);
			if (sessionIdRef.current) {
				endVoiceSession({
					data: { sessionId: sessionIdRef.current, durationSeconds: 0 },
				}).catch((err) =>
					console.error("Failed to clean up session after start failure:", err),
				);
				sessionIdRef.current = null;
			}
			setStatus("idle");
			setLimitError("Failed to start the session. Please try again.");
		}
	};

	const stop = async () => {
		isStoppingRef.current = true;
		await getVapi().stop();
	};

	const clearErrors = () => {
		setLimitError(null);
	};

	return {
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
		maxSessionMinutes,
	};
};

export default useVapi;
