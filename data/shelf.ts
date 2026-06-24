export type ReadingItem = {
  title: string;
  author: string;
  startedYear: number;
  status: "reading" | "finished";
  cover?: string;
};

export type ListeningItem = {
  title: string;
  author: string;
  kind: "audiobook" | "podcast";
  current: boolean;
};

export const reading: ReadingItem[] = [
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", startedYear: 2024, status: "finished", cover: "/images/books/thinking-fast-and-slow.jpg" },
  { title: "Either/Or", author: "Søren Kierkegaard", startedYear: 2024, status: "reading", cover: "/images/books/either-or.jpg" },
];

export const listening: ListeningItem[] = [
  { title: "Acquired", author: "Ben Gilbert & David Rosenthal", kind: "podcast", current: true },
];
