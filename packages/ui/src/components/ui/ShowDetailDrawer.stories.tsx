import type { Show } from "@open-setlist/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ShowDetailDrawer } from "./ShowDetailDrawer";

const meta: Meta<typeof ShowDetailDrawer> = {
	title: "UI/ShowDetailDrawer",
	component: ShowDetailDrawer,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ShowDetailDrawer>;

const mockShow: Show = {
	id: "1",
	artist_name:
		"A Very Long Band Name That Might Wrap Or Truncate Depending On How We Have It Setup in the drawer",
	venue_id: "cactus-club",
	venue_name: "Cactus Club",
	status: "active",
	event_date: "2026-04-01",
	event_time: "8:00 PM",
	price: "$15 ADV / $20 DOS",
	ticket_url: 'https://example.com',
	age_restriction: '21+', is_sold_out: false,
};

export const Open: Story = {
	args: {
		show: mockShow,
		onClose: () => alert("Closed!"),
	},
};

export const SoldOut: Story = {
	args: {
		show: { ...mockShow, age_restriction: '21+', is_sold_out: true },
		onClose: () => alert("Closed!"),
	},
};

export const Closed: Story = {
	args: {
		show: null,
		onClose: () => alert("Closed!"),
	},
};
