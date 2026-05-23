import type { Meta, StoryObj } from "@storybook/react";
import { VenuePill } from "./VenuePill";

const meta: Meta<typeof VenuePill> = {
	title: "UI/VenuePill",
	component: VenuePill,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VenuePill>;

export const Default: Story = {
	args: {
		name: "Cactus Club",
		shortName: "Cactus Club",
		themeColor: "orange",
	},
};

export const UnknownVenue: Story = {
	args: {
		name: "Some Indie Venue",
		themeColor: "slate",
	},
};

export const LongNameAbbreviated: Story = {
	args: {
		name: "The Rave / Eagles Club",
		shortName: "The Rave",
		themeColor: "red",
	},
};
