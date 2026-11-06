import {
	BareCompatibleClient,
	type ProxyTransport,
} from "@mercuryworkshop/proxy-transports";
import LibcurlClient from "@mercuryworkshop/libcurl-transport";

import EpoxyTransport from "./epoxy";

export let bare: BareCompatibleClient;
export let transport: ProxyTransport;
export let wispUrl: string = "";
export let activeProxyMode: "relay" | "custom" | "automatic" = "relay";

import {
	EitherSocketProvider,
	WispSocketProvider,
	WebSocketJsProvider,
	JsSocketProvider,
	EpoxyClient,
	init,
} from "@mercuryworkshop/epoxy-tls/full/bundled";

let useEpoxy = true;

export function getNativeRelay(): any {
	if (typeof window !== "undefined") {
		if ((window as any).PortfoliOSNativeRelay)
			return (window as any).PortfoliOSNativeRelay;
		try {
			if (window.parent && (window.parent as any).PortfoliOSNativeRelay) {
				return (window.parent as any).PortfoliOSNativeRelay;
			}
		} catch (_) {}
	}
	return null;
}

export async function isNativeRelayAvailable(): Promise<boolean> {
	const relay = getNativeRelay();
	if (!relay || typeof relay.isAvailable !== "function") return false;
	try {
		return Boolean(
			await Promise.race([
				relay.isAvailable(),
				new Promise((resolve) => setTimeout(() => resolve(false), 2500)),
			])
		);
	} catch (_) {
		return false;
	}
}

function createNativeSocketProvider(): JsSocketProvider {
	return new JsSocketProvider(async (host: string, port: number) => {
		const relay = getNativeRelay();
		if (!relay) {
			throw new Error("PortfoliOS Native Relay is not detected.");
		}
		const socket = await relay.createTcpSocket(host, port);
		return [
			new ReadableStream({
				start(controller) {
					socket.on("data", (bytes: Uint8Array) => {
						controller.enqueue(bytes);
					});
					socket.on("close", () => {
						try {
							controller.close();
						} catch (_) {}
					});
					socket.on("error", (err: any) => {
						try {
							controller.error(err);
						} catch (_) {}
					});
				},
				cancel() {
					try {
						socket.close();
					} catch (_) {}
				},
			}),
			new WritableStream({
				async write(chunk: Uint8Array) {
					await socket.write(chunk);
				},
				close() {
					try {
						socket.close();
					} catch (_) {}
				},
			}),
		];
	});
}

export async function setNativeRelay() {
	activeProxyMode = "relay";
	wispUrl = "";

	if (useEpoxy) {
		await init();
		const custom = createNativeSocketProvider();
		const client = new EpoxyClient(custom);
		transport = new EpoxyTransport(client);
	}
	bare = new BareCompatibleClient(transport);
}

export async function setWispUrl(
	wispurl: string,
	mode: "custom" | "automatic" = "custom"
) {
	activeProxyMode = mode;
	wispUrl = wispurl;

	const isLoopback = (host: string) =>
		host === "127.0.0.1" || host.endsWith("localhost");

	if (useEpoxy) {
		await init();
		const custom = createNativeSocketProvider();
		const wisp = new WispSocketProvider(new WebSocketJsProvider(), wispurl);
		const backend = new EitherSocketProvider(
			(host) => (isLoopback(host) ? "left" : "right"),
			custom,
			wisp
		);

		const client = new EpoxyClient(backend);
		transport = new EpoxyTransport(client);
	} else {
		transport = new LibcurlClient({
			wisp: wispurl,
		});
	}
	bare = new BareCompatibleClient(transport);
}
