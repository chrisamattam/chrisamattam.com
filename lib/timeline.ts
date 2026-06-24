import { allMilestones, allProjects } from "contentlayer/generated";

export type TimelineEntry =
  | { kind: "milestone"; date: string; data: (typeof allMilestones)[number] }
  | { kind: "project";   date: string; data: (typeof allProjects)[number] };

export function getTimeline(): TimelineEntry[] {
  const milestoneEntries: TimelineEntry[] = allMilestones.map((m) => ({
    kind: "milestone",
    date: m.date,
    data: m,
  }));

  const projectEntries: TimelineEntry[] = allProjects
    .filter((p) => p.featured)
    .map((p) => ({
      kind: "project",
      date: p.date,
      data: p,
    }));

  return [...milestoneEntries, ...projectEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
