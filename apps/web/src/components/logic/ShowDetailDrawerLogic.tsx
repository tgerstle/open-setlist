import { useStore } from "@nanostores/react";
import { ShowDetailDrawer } from "@open-setlist/ui/src/components/ui/ShowDetailDrawer";
import { selectedShowStore } from "../../stores/appState";

export function ShowDetailDrawerLogic() {
	const selectedShow = useStore(selectedShowStore);
	return (
		<ShowDetailDrawer
			show={selectedShow}
			onClose={() => selectedShowStore.set(null)}
		/>
	);
}
