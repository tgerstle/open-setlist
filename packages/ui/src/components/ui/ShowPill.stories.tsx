import type { Show } from "@open-setlist/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ShowPill } from "./ShowPill";

const meta: Meta<typeof ShowPill> = {
	title: "UI/ShowPill",
	component: ShowPill,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ShowPill>;

const mockShow: Show = {
	id: "1",
	artist_name: "The New Deal",
	venue_id: "cactus-club",
	venue_name: "Cactus Club",
	status: "active",
	event_date: "2026-04-01",
	event_time: "8:00 PM",
	price: "$15",
	ticket_url: 'https://example.com',
	age_restriction: '21+', is_sold_out: false,
};

export const Default: Story = {
	args: {
		show: mockShow,
		onClick: () => alert("Clicked!"),
	},
};

export const SoldOut: Story = {
	args: {
		show: { ...mockShow, age_restriction: '21+', is_sold_out: true },
		onClick: () => alert("Clicked!"),
	},
};
