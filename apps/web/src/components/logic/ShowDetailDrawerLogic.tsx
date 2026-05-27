import { useStore } from "@nanostores/react";
import { selectedShowStore } from "../../stores/appState";
import { ShowDetailDrawer } from "@open-setlist/ui/src/components/ui/ShowDetailDrawer";

export function ShowDetailDrawerLogic() {
	const selectedShow = useStore(selectedShowStore);
	return (
		<ShowDetailDrawer
			show={selectedShow}
			onClose={() => selectedShowStore.set(null)}
		/>
	);
}
