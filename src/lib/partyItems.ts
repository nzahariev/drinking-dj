export type PartyItemText = {
  id: string;
  kind: "text";
  label: string;
  color: "pink" | "cyan" | "purple" | "green" | "yellow";
};

export type PartyItemGif = {
  id: string;
  kind: "gif";
  label: string;
  url: string;
};

export type PartyItem = PartyItemText | PartyItemGif;

export const DEFAULT_PARTY_ITEMS: PartyItem[] = [
  { id: "pt1", kind: "text", label: "ГАЛЕНА", color: "pink" },
  { id: "pt2", kind: "text", label: "СРЪБСКО!!!", color: "cyan" },
  {
    id: "pg1",
    kind: "gif",
    label: "❤️",
    url: "https://openmoji.org/data/color/svg/2764.svg",
  },
  {
    id: "pg2",
    kind: "gif",
    label: "❤️",
    url: "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif",
  },
  {
    id: "pg3",
    kind: "gif",
    label: "❤️",
    url: "https://media.giphy.com/media/HSCZMUa1ao17h7l5mg/giphy.gif",
  },
  { id: "blank", kind: "text", label: "", color: "purple" },
];
