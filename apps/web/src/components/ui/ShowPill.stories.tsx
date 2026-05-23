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
	artist: "The New Deal",
	venue_id: "cactus-club",
	venue_name: "Cactus Club",
	status: "active",
	date: "2026-04-01",
	time: "8:00 PM",
	price: "$15",
	url: "https://example.com",
	is_sold_out: false,
};

export const Default: Story = {
	args: {
		show: mockShow,
		onClick: () => alert("Clicked!"),
	},
};

export const SoldOut: Story = {
	args: {
		show: { ...mockShow, is_sold_out: true },
		onClick: () => alert("Clicked!"),
	},
};
