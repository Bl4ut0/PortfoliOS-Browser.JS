/** PortfoliOS integration: same-origin parent handshake, scoped public settings only. */
import { createState } from "dreamland/core";
import { setWispUrl } from "./proxy/wisp";
export const connection = createState({
	mode: "automatic",
	endpoint: "",
	remember: false,
	status: "",
	busy: false,
});
type Configuration = { mode: string; endpoint: string; remember: boolean };
let serial = 0,
	connectionEpoch = 0;
let connectionAttempt: Promise<void> | null = null;
export async function waitForConnection() {
	for (;;) {
		const attempt = connectionAttempt;
		if (!attempt) throw new Error("Choose a proxy connection in Settings.");
		try {
			await attempt;
		} catch (error) {
			if (attempt === connectionAttempt) throw error;
		}
		if (attempt === connectionAttempt) return;
	}
}
const pending = new Map<string, (value: any) => void>();
window.addEventListener("message", (event) => {
	if (
		event.source !== parent ||
		event.origin !== location.origin ||
		event.data?.source !== "portfolios-browser-host"
	)
		return;
	const resolve = pending.get(event.data.requestId);
	if (resolve) {
		pending.delete(event.data.requestId);
		resolve(event.data);
	}
});
function request(type: string, config?: Configuration): Promise<any> {
	const requestId = String(++serial);
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			pending.delete(requestId);
			reject(new Error("Browser settings could not connect to the workspace."));
		}, 5000);
		pending.set(requestId, (value) => {
			clearTimeout(timeout);
			value.error ? reject(new Error(value.error)) : resolve(value.config);
		});
		parent.postMessage(
			{ source: "portfolios-browser", type, requestId, config },
			location.origin
		);
	});
}
export function normalizeEndpoint(raw: string): string {
	const url = new URL(raw.trim());
	if (
		url.protocol !== "wss:" ||
		url.username ||
		url.password ||
		url.search ||
		url.hash
	)
		throw new Error(
			"Use a secure wss:// Wisp endpoint without credentials, query parameters or a fragment."
		);
	if (!url.pathname.endsWith("/")) url.pathname += "/";
	return url.href;
}
async function connect(config: Configuration) {
	const epoch = ++connectionEpoch;
	connection.status = "Connecting…";
	let endpoint = config.endpoint;
	if (config.mode === "automatic") {
		const response = await fetch("https://sensible-ship-8305.puter.work/", {
			credentials: "omit",
			signal: AbortSignal.timeout(15000),
		});
		if (!response.ok)
			throw new Error(
				"Automatic relay discovery is unavailable. Choose a custom Wisp endpoint and try again."
			);
		endpoint = (await response.text()).trim();
		let parsed: URL;
		try {
			parsed = new URL(endpoint);
		} catch {
			throw new Error(
				"The automatic relay is unavailable for this site. Choose a custom Wisp endpoint or open connection options."
			);
		}
		if (parsed.protocol !== "wss:" || parsed.username || parsed.password)
			throw new Error(
				"The automatic relay returned an invalid address. Choose a custom Wisp endpoint."
			);
	}
	if (epoch !== connectionEpoch) return;
	await setWispUrl(endpoint);
	if (epoch !== connectionEpoch) return;
	connection.status =
		config.mode === "automatic"
			? "Automatic relay configured."
			: "Custom relay configured. Reload an open website to use it.";
}
export async function initializeConnection() {
	let config: Configuration = {
		mode: "automatic",
		endpoint: "",
		remember: false,
	};
	try {
		config = await request("ready");
	} catch {
		/* standalone source preview uses the automatic relay */
	}
	Object.assign(connection, config);
	// Keep Settings usable even when the relay is unreachable.
	const attempt = (connectionAttempt = connect(config));
	void attempt.catch((error) => {
		if (connectionAttempt === attempt) connection.status = error.message;
	});
}
export async function saveConnection(
	mode: string,
	endpoint: string,
	remember: boolean
) {
	if (connection.busy) return;
	connection.busy = true;
	try {
		const config = {
			mode,
			endpoint: mode === "custom" ? normalizeEndpoint(endpoint) : "",
			remember,
		};
		await request("configure", config);
		Object.assign(connection, config);
		await (connectionAttempt = connect(config));
	} catch (error: any) {
		connection.status = error.message;
	} finally {
		connection.busy = false;
	}
}
export function openConnectionOptions() {
	void request("options").catch((error) => {
		connection.status = error.message;
	});
}
