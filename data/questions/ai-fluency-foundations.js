/* Scored practice-test question bank for Course 1. Scenario-based, in the style
   demonstrated by Anthropic's own CCAR-F Exam Guide sample questions (situation,
   4 options, one best answer, explanation) — written originally against this
   course's own published content, not copied from any exam guide or course platform.
   Only the 5 domains named in the design spec are used here (framework-overview is
   reserved for the ungraded per-module knowledge checks). */

const QUESTIONS_AI_FLUENCY_FOUNDATIONS = [
  {
    id: 'pt-1', domain: 'delegation',
    prompt: "You need to write a short internal announcement about a schedule change. It's low-stakes, has a clear standard format, and needs to go out in the next ten minutes. Applying good Delegation, what should you do?",
    options: [
      { id: 'a', text: 'Delegate the full draft to an AI assistant and send it after a quick read-through' },
      { id: 'b', text: 'Write it entirely by hand to be safe' },
      { id: 'c', text: 'Spend 20 minutes designing a custom prompt template before drafting' },
      { id: 'd', text: 'Ask a colleague to write it instead of using AI at all' },
    ],
    correctOptionId: 'a',
    explanation: 'Low-stakes, well-defined, time-boxed tasks are exactly what\'s well-suited for AI delegation with a light human check. B wastes time on a task AI handles well; C over-invests process for a low-stakes task; D avoids delegation without a good reason.',
  },
  {
    id: 'pt-2', domain: 'delegation',
    prompt: "A manager is deciding whether to delegate final hiring decisions to an AI screening tool. This decision significantly affects people's careers and requires nuanced judgment. What does good Delegation suggest?",
    options: [
      { id: 'a', text: 'Delegate the decision fully to the AI tool to reduce bias' },
      { id: 'b', text: 'Use AI to help organize and summarize candidate information, but keep the final judgment with a human' },
      { id: 'c', text: 'Avoid using AI anywhere in the hiring process' },
      { id: 'd', text: 'Let the AI decide, then have a human rubber-stamp the outcome without review' },
    ],
    correctOptionId: 'b',
    explanation: 'High-stakes decisions requiring nuanced judgment and accountability are the clearest case for keeping a human in the loop. A over-delegates; C under-delegates when AI could still help with lower-stakes parts; D isn\'t genuine human judgment.',
  },
  {
    id: 'pt-3', domain: 'delegation',
    prompt: 'Before choosing which AI tool or technique to use for a new project, what should come first according to the Delegation competency?',
    options: [
      { id: 'a', text: 'Researching every available AI tool on the market' },
      { id: 'b', text: 'Getting a clear picture of the outcome you\'re trying to achieve' },
      { id: 'c', text: 'Writing the most detailed prompt you can' },
      { id: 'd', text: 'Asking the AI itself what tool it recommends' },
    ],
    correctOptionId: 'b',
    explanation: 'Delegation starts from the desired outcome; tool choice follows from that goal. The other options put a tactic before the goal is even clear.',
  },
  {
    id: 'pt-4', domain: 'description',
    prompt: "You ask an AI to 'make this report better' with no other context, and get back generic edits that don't address what you actually needed. What's the most likely cause?",
    options: [
      { id: 'a', text: 'The AI model isn\'t capable enough for this task' },
      { id: 'b', text: 'The description lacked context, constraints, and criteria for what "better" means' },
      { id: 'c', text: 'You should have used a completely different AI tool' },
      { id: 'd', text: 'This is an unavoidable limitation of all generative AI' },
    ],
    correctOptionId: 'b',
    explanation: 'Vague descriptions produce vague results. Providing what "better" means — audience, goal, tone, what to fix — is a Description skill, not a tool or model limitation.',
  },
  {
    id: 'pt-5', domain: 'description',
    prompt: 'Which addition would most improve a description asking an AI to draft a customer email?',
    options: [
      { id: 'a', text: 'Repeating the request in different words for emphasis' },
      { id: 'b', text: 'Providing an example of the tone and format you want, and what to avoid' },
      { id: 'c', text: 'Making the request as short as possible' },
      { id: 'd', text: 'Leaving the format completely open' },
    ],
    correctOptionId: 'b',
    explanation: 'Concrete examples and explicit boundaries reduce back-and-forth. Repeating the request adds no new information, and removing constraints (c, d) makes the description less useful, not more.',
  },
  {
    id: 'pt-6', domain: 'description',
    prompt: 'After receiving a first draft from an AI, you realize your original request was ambiguous about the target audience. What\'s the appropriate next step in the Description competency?',
    options: [
      { id: 'a', text: 'Discard AI assistance for this task entirely' },
      { id: 'b', text: 'Refine your description with the missing context and try again' },
      { id: 'c', text: 'Accept the draft as-is since asking again would be inefficient' },
      { id: 'd', text: 'Assume the AI should have inferred the audience correctly' },
    ],
    correctOptionId: 'b',
    explanation: 'Description is iterative; refining based on what the output reveals is expected practice, not a failure.',
  },
  {
    id: 'pt-7', domain: 'discernment',
    prompt: 'An AI-generated summary of a legal document states a confident but false claim about a filing deadline, and it reaches a decision-maker unchecked. What competency failure allowed this?',
    options: [
      { id: 'a', text: 'Delegation — the wrong task was delegated to AI' },
      { id: 'b', text: 'Discernment — the output wasn\'t critically evaluated before being relied on' },
      { id: 'c', text: 'Description — the request was too detailed' },
      { id: 'd', text: 'This is unavoidable and not a competency failure' },
    ],
    correctOptionId: 'b',
    explanation: 'Evaluating AI output for accuracy before relying on it is exactly what Discernment covers — the failure here is trusting output without verification.',
  },
  {
    id: 'pt-8', domain: 'discernment',
    prompt: 'Why does subject-matter expertise improve a person\'s Discernment when reviewing AI output?',
    options: [
      { id: 'a', text: 'Experts are less likely to use AI at all' },
      { id: 'b', text: 'Expertise helps someone recognize subtle errors that a confident-sounding but incorrect output might otherwise hide' },
      { id: 'c', text: 'Experts don\'t need to review AI output' },
      { id: 'd', text: 'Expertise has no real effect on Discernment' },
    ],
    correctOptionId: 'b',
    explanation: 'The more you know about a subject, the better positioned you are to catch errors that look plausible on the surface.',
  },
  {
    id: 'pt-9', domain: 'discernment',
    prompt: 'What typically causes someone to revisit and refine their original prompt after evaluating an AI\'s output?',
    options: [
      { id: 'a', text: 'Random chance' },
      { id: 'b', text: 'Discovering, through evaluation, that the description was ambiguous or incomplete' },
      { id: 'c', text: 'The AI directly asking for clarification' },
      { id: 'd', text: 'A fixed schedule requiring revisions every few minutes' },
    ],
    correctOptionId: 'b',
    explanation: 'This is the Description–Discernment loop in action: evaluating output reveals gaps in the original description, prompting refinement.',
  },
  {
    id: 'pt-10', domain: 'diligence',
    prompt: 'A student uses AI to help draft an assignment, submits it without required disclosure, and doesn\'t check it for accuracy. Which competency was most clearly not applied?',
    options: [
      { id: 'a', text: 'Delegation' },
      { id: 'b', text: 'Description' },
      { id: 'c', text: 'Diligence' },
      { id: 'd', text: 'Discernment only, not Diligence' },
    ],
    correctOptionId: 'c',
    explanation: 'Transparency about AI use and accountability for the final work are core to Diligence — the missing disclosure and unchecked accuracy both point there.',
  },
  {
    id: 'pt-11', domain: 'diligence',
    prompt: 'Which best reflects the Diligence competency in a workplace setting?',
    options: [
      { id: 'a', text: 'Using AI for every task regardless of appropriateness' },
      { id: 'b', text: 'Being transparent about AI\'s role in a work product and remaining accountable for its accuracy' },
      { id: 'c', text: 'Avoiding AI entirely to eliminate risk' },
      { id: 'd', text: 'Delegating accountability to the AI vendor if something goes wrong' },
    ],
    correctOptionId: 'b',
    explanation: 'Diligence is about responsible, transparent, accountable use — not blanket avoidance (c) or overuse (a), and accountability can\'t be outsourced (d).',
  },
  {
    id: 'pt-12', domain: 'diligence',
    prompt: 'Why is Diligence often described as what makes the other three competencies trustworthy?',
    options: [
      { id: 'a', text: 'It is applied only at the very end of a project, after the other three' },
      { id: 'b', text: 'It governs how responsibly and ethically Delegation, Description, and Discernment are carried out throughout the work' },
      { id: 'c', text: 'It replaces the need for Discernment' },
      { id: 'd', text: 'It only applies to AI companies, not individual users' },
    ],
    correctOptionId: 'b',
    explanation: 'Diligence isn\'t a final step but an ongoing responsibility shaping how the other competencies are applied — it doesn\'t replace Discernment, it depends on it.',
  },
  {
    id: 'pt-13', domain: 'genai-fundamentals',
    prompt: 'Why can a large language model state an incorrect fact with high apparent confidence?',
    options: [
      { id: 'a', text: 'It is deliberately trying to deceive the user' },
      { id: 'b', text: 'It generates text by predicting likely continuations from learned patterns, which can produce fluent but inaccurate output ("hallucination")' },
      { id: 'c', text: 'It always retrieves facts from a verified live database' },
      { id: 'd', text: 'It only makes errors when explicitly asked to' },
    ],
    correctOptionId: 'b',
    explanation: 'This is the core mechanism behind hallucination: fluency in generation doesn\'t guarantee factual accuracy.',
  },
  {
    id: 'pt-14', domain: 'genai-fundamentals',
    prompt: 'What most clearly distinguishes generative AI from earlier discriminative AI systems?',
    options: [
      { id: 'a', text: 'Generative AI only works with images, not text' },
      { id: 'b', text: 'Generative AI produces new content, while discriminative AI classifies or predicts from fixed categories' },
      { id: 'c', text: 'Generative AI cannot process any user input' },
      { id: 'd', text: 'There is no meaningful difference between the two' },
    ],
    correctOptionId: 'b',
    explanation: 'This generation-vs-classification distinction is the defining difference covered in the course\'s Generative AI deep dive.',
  },
  {
    id: 'pt-15', domain: 'genai-fundamentals',
    prompt: 'A model\'s "knowledge cutoff" most directly limits which of the following?',
    options: [
      { id: 'a', text: 'Its ability to follow formatting instructions' },
      { id: 'b', text: 'Its awareness of events or information after its training data was collected, unless supplied in context' },
      { id: 'c', text: 'Its ability to generate any text at all' },
      { id: 'd', text: 'Its ability to run at all without an internet connection' },
    ],
    correctOptionId: 'b',
    explanation: 'Knowledge cutoff specifically bounds what the model "knows" from training versus what must be supplied via context or tools.',
  },
];

if (typeof module !== 'undefined') module.exports = QUESTIONS_AI_FLUENCY_FOUNDATIONS;