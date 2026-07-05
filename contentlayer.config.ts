import { defineDocumentType, defineNestedType, makeSource } from "contentlayer2/source-files";

export const Milestone = defineDocumentType(() => ({
  name: "Milestone",
  filePathPattern: "milestones/*.mdx",
  contentType: "mdx",
  fields: {
    title:        { type: "string",  required: true },
    date:         { type: "string",  required: true },
    endDate:      { type: "string",  required: false },
    kind:         { type: "enum",    options: ["work", "education", "project", "personal"], required: true },
    company:      { type: "string",  required: false },
    companyUrl:   { type: "string",  required: false },
    collaborators:{ type: "list",    of: { type: "string" }, required: false },
    links:        { type: "json",    required: false },
    summary:      { type: "string",  required: true },
  },
  computedFields: {
    slug: { type: "string", resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "") },
  },
}));

export const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: "projects/*.mdx",
  contentType: "mdx",
  fields: {
    title:        { type: "string",  required: true },
    slug:         { type: "string",  required: true },
    date:         { type: "string",  required: true },
    role:         { type: "string",  required: false },
    company:      { type: "string",  required: false },
    period:       { type: "string",  required: false },
    status:       { type: "enum",    options: ["active", "stable", "shipped", "learned", "acquired", "retired", "abandoned", "dead"], required: true },
    badgeTone:    { type: "enum",    options: ["accent", "neutral", "warning", "danger", "amber", "green"], required: true },
    liveUrl:      { type: "string",  required: false },
    githubUrl:    { type: "string",  required: false },
    prdUrl:       { type: "string",  required: false },
    links:        { type: "json",    required: false },
    collaborators:{ type: "list",    of: { type: "string" }, required: false },
    tags:         { type: "list",    of: { type: "string" }, required: false },
    summary:      { type: "string",  required: true },
    featured:     { type: "boolean", required: true },
    problem:      { type: "string",  required: false },
  },
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "posts/*.mdx",
  contentType: "mdx",
  fields: {
    title:   { type: "string",  required: true },
    slug:    { type: "string",  required: true },
    date:    { type: "string",  required: true },
    tags:    { type: "list",    of: { type: "string" }, required: false },
    summary: { type: "string",  required: true },
    draft:   { type: "boolean", required: false, default: false },
  },
}));

const Location = defineNestedType(() => ({
  name: "Location",
  fields: {
    area:  { type: "string", required: true },
    state: { type: "string", required: true },
  },
}));

const Coordinates = defineNestedType(() => ({
  name: "Coordinates",
  fields: {
    lat: { type: "number", required: true },
    lng: { type: "number", required: true },
  },
}));

const PracticalNotes = defineNestedType(() => ({
  name: "PracticalNotes",
  fields: {
    bestSeason:          { type: "string", required: false },
    gearNotes:           { type: "string", required: false },
    warnings:            { type: "string", required: false },
    whatIdDoDifferently: { type: "string", required: false },
  },
}));

export const Hike = defineDocumentType(() => ({
  name: "Hike",
  filePathPattern: "hikes/*.mdx",
  contentType: "mdx",
  fields: {
    id:                  { type: "string",  required: true },  // flat slug, e.g. "gaumukh-glacier"
    name:                { type: "string",  required: true },
    region:              { type: "enum",    options: ["himalaya", "sahyadri"], required: true },
    location:            { type: "nested",  of: Location, required: true },
    coordinates:         { type: "nested",  of: Coordinates, required: true },
    startDate:           { type: "string",  required: false }, // "2022" or "2022-07-15"
    endDate:             { type: "string",  required: false }, // set for multi-day treks
    durationHours:       { type: "number",  required: false }, // single-day
    durationDays:        { type: "number",  required: false }, // multi-day
    difficulty:          { type: "enum",    options: ["easy", "moderate", "hard", "strenuous"], required: false },
    elevationGainMeters: { type: "number",  required: false },
    distanceKm:          { type: "number",  required: false },
    companions:          { type: "string",  required: false }, // "solo", "with college friends"
    visits:              { type: "number",  required: true },
    visitsLabel:         { type: "string",  required: false }, // "12+" when the count is approximate
    hook:                { type: "string",  required: true },  // one-line teaser (previews, popups, meta description)
    practicalNotes:      { type: "nested",  of: PracticalNotes, required: false },
    heroImage:           { type: "string",  required: false }, // optional override; folder hero used otherwise
    draft:               { type: "boolean", required: false, default: false },
    statsContribution:   { type: "boolean", required: false, default: true }, // counts toward aggregate stats
    approxCoords:        { type: "boolean", required: false, default: false }, // village-level coords, verify before launch
  },
  computedFields: {
    slug: { type: "string", resolve: (doc) => doc.id || doc._raw.sourceFileName.replace(/\.mdx$/, "") },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Milestone, Project, Post, Hike],
});
