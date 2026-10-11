import { SOURCE_LOCATION } from "../consts";
import { css, type FC } from "dreamland/core";
import {
	connection,
	saveConnection,
	openConnectionOptions,
} from "../portfolios";
import type { Tab } from "../Tab/Tab";
export function ProxySettings(
	this: FC<{ tab: Tab }, { mode: string; endpoint: string; remember: boolean }>
) {
	this.mode = connection.mode;
	this.endpoint = connection.endpoint;
	this.remember = connection.remember;
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
						}}
					>
						<option value="automatic">Automatic · Browser.js relay</option>
						<option value="custom">Custom Wisp relay</option>
					</select>
				</label>
				<label hidden={use(this.mode).map((value) => value !== "custom")}>
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
                <button type="button" hidden={this.tab.url.protocol === "puter:"} on:click={() => this.tab._directnavigate(this.tab.url)}>
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
