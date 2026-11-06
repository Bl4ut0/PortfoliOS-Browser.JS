import { SOURCE_LOCATION } from "../consts";
import { css, type FC } from "dreamland/core";
import {
	connection,
	saveConnection,
	openConnectionOptions,
} from "../portfolios";
import { isNativeRelayAvailable } from "../proxy/wisp";
import type { Tab } from "../Tab/Tab";

export function ProxySettings(
	this: FC<
		{ tab: Tab },
		{
			mode: string;
			endpoint: string;
			remember: boolean;
			relayAvailable: boolean;
			checkingRelay: boolean;
		}
	>
) {
	this.mode = connection.mode;
	this.endpoint = connection.endpoint;
	this.remember = connection.remember;
	this.relayAvailable = false;
	this.checkingRelay = false;

	const checkRelay = async () => {
		this.checkingRelay = true;
		try {
			this.relayAvailable = await isNativeRelayAvailable();
		} finally {
			this.checkingRelay = false;
		}
	};
	void checkRelay();

	return (
		<section class="setting-section portfolios-proxy">
			<div class="section-header">
				<h2>Proxy connection</h2>
				<p class="description">Choose how this browser connects to websites.</p>
			</div>
			<form
				on:submit={(event: SubmitEvent) => {
					event.preventDefault();
					void saveConnection(this.mode, this.endpoint, this.remember);
				}}
			>
				<label>
					<span>Connection</span>
					<select
						aria-label="Proxy connection"
						value={use(this.mode)}
						on:change={(e: Event) => {
							this.mode = (e.target as HTMLSelectElement).value;
							if (this.mode === "relay") void checkRelay();
						}}
					>
						<option value="relay">PortfoliOS Native Relay (Built-in)</option>
						<option value="custom">Custom Wisp relay</option>
						<option value="automatic">Automatic · Browser.js relay</option>
					</select>
				</label>

				<div class="relay-card" hidden={use(this.mode).map((m) => m !== "relay")}>
					{use(this.relayAvailable, this.checkingRelay).map(
						([avail, checking]) => {
							if (checking) {
								return (
									<div class="relay-status is-checking">
										<p class="description">Checking PortfoliOS Native Relay status…</p>
									</div>
								);
							}
							if (avail) {
								return (
									<div class="relay-status is-available">
										<div class="relay-status-header">
											<span class="status-indicator online">●</span>
											<strong>PortfoliOS Native Relay Active</strong>
										</div>
										<p class="description">
											Connected via local Host Bridge. Direct low-latency TCP and UDP traffic with zero external proxy dependencies.
										</p>
									</div>
								);
							}
							return (
								<div class="relay-status is-missing">
									<div class="relay-status-header">
										<span class="status-indicator warning">⚠</span>
										<strong>PortfoliOS Native Relay Setup Required</strong>
									</div>
									<p class="description">
										The PortfoliOS Native Relay extension or Windows Host Bridge was not detected. Please complete setup to enable direct browsing:
									</p>
									<div class="relay-setup-actions">
										<a
											href="https://chromewebstore.google.com/detail/portfolios-native-relay/jbdiopconacgbffkhpjpcafkckaapmgg"
											target="_blank"
											rel="noopener noreferrer"
											class="setup-btn primary"
										>
											1. Chrome Web Store Extension ↗
										</a>
										<a
											href="/dist/PortfoliOS-NativeRelay.msi"
											download="PortfoliOS-NativeRelay.msi"
											class="setup-btn secondary"
										>
											2. Download Host Bridge (.msi) ⤓
										</a>
										<button
											type="button"
											class="setup-btn check"
											on:click={() => void checkRelay()}
										>
											Check Connection
										</button>
									</div>
								</div>
							);
						}
					)}
				</div>

				<div hidden={use(this.mode).map((m) => m !== "custom")}>
					<label>
						<span>Wisp endpoint</span>
						<input
							aria-label="Wisp endpoint"
							type="url"
							value={use(this.endpoint)}
							placeholder="wss://relay.example/wisp/"
							autocomplete="off"
							spellcheck="false"
							on:input={(e: Event) => {
								this.endpoint = (e.target as HTMLInputElement).value;
							}}
						/>
					</label>
					<p class="description">
						Custom connections require the Wisp protocol over secure WebSocket
						(wss://). HTTP and SOCKS proxy addresses are not supported.
					</p>
				</div>

				<div hidden={use(this.mode).map((m) => m !== "automatic")}>
					<p class="description">
						Automatic mode discovers a public community Wisp relay service at startup.
					</p>
				</div>

				<label class="remember">
					<input
						type="checkbox"
						checked={use(this.remember)}
						on:change={(e: Event) => {
							this.remember = (e.target as HTMLInputElement).checked;
						}}
					/>
					<span>Remember this connection for my workspace profile</span>
				</label>
				<button type="submit" disabled={use(connection.busy)}>
					Apply connection
				</button>
				<p role="status" aria-live="polite">
					{use(connection.status)}
				</p>
			</form>
			<div class="alternatives">
				<button
					type="button"
					hidden={this.tab.url.protocol === "puter:"}
					on:click={() => this.tab._directnavigate(this.tab.url)}
				>
					Retry website
				</button>
				<h3>Other connection options</h3>
				<p class="description">
					Choose an alternative browser, an external web proxy, or a remote
					browser.
				</p>
				<button type="button" on:click={openConnectionOptions}>
					Open connection options
				</button>
			</div>
			<p class="description">
				Your chosen relay handles website traffic. Custom endpoint addresses are
				included in workspace backup only when you choose to remember them.
			</p>
			<a href={SOURCE_LOCATION} target="_blank" rel="noopener noreferrer">
				Browser.js source and licenses
			</a>
		</section>
	);
}
ProxySettings.style = css`
	:scope,
	form,
	label {
		display: grid;
		gap: 1rem;
		min-width: 0;
	}
	form {
		margin-block: 1rem;
	}
	label {
		gap: 0.5rem;
	}
	input:not([type="checkbox"]),
	select,
	button {
		color: var(--toolbar_field_text);
		background: var(--toolbar_field);
		border: 1px solid var(--text-20);
		border-radius: var(--radius-md);
		padding: 0.7rem;
		font: inherit;
		min-width: 0;
		max-width: 100%;
	}
	button {
		cursor: pointer;
	}
	input:focus-visible,
	select:focus-visible,
	button:focus-visible,
	a:focus-visible {
		outline: 2px solid var(--tab_line);
		outline-offset: 3px;
	}
	.remember {
		display: flex;
		align-items: center;
	}
	.relay-card {
		border: 1px solid var(--text-20);
		border-radius: var(--radius-md);
		padding: 1rem;
		background: color-mix(in srgb, var(--toolbar_field) 60%, transparent);
	}
	.relay-status-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.status-indicator.online {
		color: #10b981;
	}
	.status-indicator.warning {
		color: #f59e0b;
	}
	.relay-setup-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.8rem;
	}
	.setup-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.8rem;
		border-radius: var(--radius-md);
		font-size: 0.85rem;
		text-decoration: none;
		border: 1px solid var(--text-20);
		background: var(--toolbar_field);
		color: var(--toolbar_field_text);
	}
	.setup-btn.primary {
		background: var(--tab_line);
		color: #ffffff;
		border-color: transparent;
	}
	.setup-btn.secondary {
		background: color-mix(in srgb, var(--tab_line) 20%, var(--toolbar_field));
	}
	.alternatives {
		display: grid;
		gap: 0.8rem;
		border-top: 1px solid var(--text-20);
		padding-top: 1rem;
	}
	[role="status"] {
		overflow-wrap: anywhere;
	}
	a {
		color: var(--tab_line);
	}
`;
