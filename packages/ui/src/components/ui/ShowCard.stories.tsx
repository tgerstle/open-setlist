import type { Show } from "@open-setlist/types";
import type { Meta, StoryObj } from "@storybook/react";
import { ShowCard } from "./ShowCard";

const meta: Meta<typeof ShowCard> = {
	title: "UI/ShowCard",
	component: ShowCard,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ShowCard>;

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
		onClick: () => {},
	},
};

export const Free: Story = {
	args: {
		show: { ...mockShow, price: "Free" },
		onClick: () => {},
	},
};

export const SoldOut: Story = {
	args: {
		show: { ...mockShow, age_restriction: '21+', is_sold_out: true },
		onClick: () => {},
	},
};
