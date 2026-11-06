import { css, type FC } from "dreamland/core";
import { type Tab } from "../Tab/Tab";
import { splitUrl } from "../util";

import { iconClose } from "../icons";
import { Icon } from "@components/Icon";
import { Button } from "@components/Button";

import { closeMenu } from "@components/Menu";
import { connection } from "../portfolios";

export function SiteInformationPopup(this: FC<{ tab: Tab }>) {
	const getMessage = () => {
		if (connection.mode === "relay") {
			return connection.status.includes("Connected")
				? "Connection is protected by SSL for this site and routed through PortfoliOS Native Relay"
				: "PortfoliOS Native Relay setup required. Install the companion extension and Host Bridge.";
		}
		if (connection.mode === "custom") {
			return "Connection is protected by SSL for this site and forwarded over custom WISP relay";
		}
		return "Connection is protected by SSL for this site and forwarded over Browser.js relay";
	};

	return (
		<div>
			<div class="header section">
				<span>
					{use(this.tab.url).map((u) => splitUrl(u)[0] + splitUrl(u)[1])}
				</span>
				<div class="buttoniconscontainer">
					<Button
						variant="icon"
						on:click={() => {
							closeMenu();
						}}
					>
						<Icon icon={iconClose}></Icon>
					</Button>
				</div>
			</div>
			<div class="content section">
				<p>{getMessage()}</p>
			</div>
		</div>
	);
}
SiteInformationPopup.style = css`
	:scope {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 20em;

		color: var(--toolbar_text);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		color: var(--toolbar_field_text);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		line-height: 1.4;
	}
`;
