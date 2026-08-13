/* Metadata for all 7 prep courses in the Claude Certified Architect – Foundations path.
   moduleIds is empty for placeholder courses (no module data exists yet). */

const COURSES = [
  {
    id: 'ai-fluency-foundations',
    title: 'AI Fluency: Framework & Foundations',
    description: 'The 4D Framework (Delegation, Description, Discernment, Diligence) for working effectively, efficiently, ethically, and safely with AI — plus generative AI fundamentals.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations',
    status: 'available',
    examDomain: null,
    moduleIds: ['intro', 'genai-deep-dive', 'delegation', 'description', 'discernment', 'diligence', 'conclusion'],
  },
  {
    id: 'claude-api',
    title: 'Building with the Claude API',
    description: 'The full spectrum of working with Anthropic models via the Claude API — from basic requests to agentic architectures, tool use, and structured output.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-with-the-anthropic-api',
    status: 'placeholder',
    examDomain: 'Maps to Agentic Architecture & Orchestration, Tool Design & MCP Integration, Prompt Engineering & Structured Output',
    moduleIds: [],
  },
  {
    id: 'claude-google-cloud',
    title: 'Claude on Google Cloud',
    description: 'Working with Anthropic models via Google Cloud Vertex AI.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-with-google-vertex',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'claude-code-in-action',
    title: 'Claude Code in Action',
    description: 'Running long, hands-off Claude Code sessions you can trust: steer, configure, automate, and verify.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-code-in-action',
    status: 'placeholder',
    examDomain: 'Maps to Claude Code Configuration & Workflows',
    moduleIds: [],
  },
  {
    id: 'claude-101',
    title: 'Claude 101',
    description: 'Using Claude for everyday work tasks, core features, and resources for going deeper.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-101',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'claude-amazon-bedrock',
    title: 'Claude with Amazon Bedrock',
    description: 'Working with Anthropic models via Amazon Bedrock.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-in-amazon-bedrock',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'intro-to-mcp',
    title: 'Introduction to Model Context Protocol',
    description: 'Building Model Context Protocol servers and clients from scratch using Python.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/introduction-to-model-context-protocol',
    status: 'placeholder',
    examDomain: 'Maps to Tool Design & MCP Integration',
    moduleIds: [],
  },
];

if (typeof module !== 'undefined') module.exports = COURSES;
