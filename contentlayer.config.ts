import { defineDocumentType, makeSource } from "contentlayer2/source-files";

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

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Milestone, Project, Post],
});
