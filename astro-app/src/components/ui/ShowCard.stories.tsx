import type { Meta, StoryObj } from "@storybook/react";
import { ShowCard } from "./ShowCard";
import type { Show } from "../../types/models";

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
  artist: "The New Deal",
  venue_id: "cactus-club",
  venue_name: "Cactus Club",
  status: "active",
  date: "2026-04-01",
  event_time: "8:00 PM",
  price: "$15",
  url: "https://example.com",
  is_sold_out: false,
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
    show: { ...mockShow, is_sold_out: true },
    onClick: () => {},
  },
};
