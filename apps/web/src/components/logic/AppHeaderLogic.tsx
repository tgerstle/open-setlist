import { useStore } from "@nanostores/react";
import { AppHeader } from "@open-setlist/ui/src/components/ui/AppHeader";
import { activeViewStore } from "../../stores/appState";

export function AppHeaderLogic({ isDev }: { isDev?: boolean }) {
	const activeView = useStore(activeViewStore);
	return (
		<AppHeader
			isDev={isDev}
			activeView={activeView}
			onViewChange={activeViewStore.set}
		/>
	);
}
