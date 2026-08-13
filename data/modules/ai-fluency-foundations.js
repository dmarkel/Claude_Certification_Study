/* Study-guide content and knowledge checks for Course 1: AI Fluency: Framework & Foundations.
   Grounded in the publicly published AI Fluency Framework (Feller & Dakan, developed in
   partnership with Anthropic) and the course's own published module list. Written as
   original synthesis — meant to be refined further as each module is actually completed. */

const MODULES_AI_FLUENCY_FOUNDATIONS = [
  {
    id: 'intro',
    title: 'Introduction to AI Fluency',
    summary: 'Why AI Fluency is a learnable skill set, and a first look at the 4D Framework that structures the rest of the course.',
    keyConcepts: [
      'AI Fluency = working effectively, efficiently, ethically, and safely with AI systems.',
      'The 4D Framework: Delegation, Description, Discernment, Diligence.',
      'The four competencies interact as a loop, not a one-time checklist.',
    ],
    body: [
      "AI systems are now embedded in everyday work, but using them well isn't automatic — it's a learnable skill set, distinct from both blind trust and blanket avoidance. The AI Fluency Framework names this skill set and breaks it into four competencies.",
      '<strong>Delegation</strong> is deciding what to hand off to AI, what to keep for yourself, and choosing the right AI tool or technique for the goal. <strong>Description</strong> is communicating your intent clearly enough that the AI can produce something useful. <strong>Discernment</strong> is critically evaluating what comes back — is it accurate, appropriate, actually useful. <strong>Diligence</strong> is using AI responsibly: transparency, accountability, and thoughtful judgment about when and how to use it.',
      "These four aren't a strict linear sequence. In practice they loop — most visibly between Description and Discernment, where evaluating an output often reveals the original request was ambiguous, prompting another round of description.",
    ],
    knowledgeChecks: [
      {
        id: 'intro-kc1', domain: 'delegation',
        prompt: "Which best describes the 'Delegation' competency in the 4D Framework?",
        options: [
          { id: 'a', text: 'Deciding what to hand off to AI and choosing the right tool for the goal' },
          { id: 'b', text: 'Writing the most detailed possible prompt' },
          { id: 'c', text: 'Checking AI output for factual accuracy' },
          { id: 'd', text: 'Disclosing when AI was used in a work product' },
        ],
        correctOptionId: 'a',
        explanation: "Delegation is about the decision of what to hand off and to which tool — b describes Description, c describes Discernment, d describes Diligence.",
      },
      {
        id: 'intro-kc2', domain: 'framework-overview',
        prompt: 'What is the primary relationship between Description and Discernment in the 4D Framework?',
        options: [
          { id: 'a', text: 'They run once each, in strict sequence' },
          { id: 'b', text: "They form a loop — evaluating output often leads back to refining the description" },
          { id: 'c', text: 'They are unrelated competencies' },
          { id: 'd', text: 'Diligence replaces the need for both' },
        ],
        correctOptionId: 'b',
        explanation: 'The course explicitly names this the "Description–Discernment loop" — evaluating an output is often what reveals a description needs refining.',
      },
      {
        id: 'intro-kc3', domain: 'framework-overview',
        prompt: 'Which of the following is NOT one of the four competencies in the AI Fluency Framework?',
        options: [
          { id: 'a', text: 'Delegation' },
          { id: 'b', text: 'Documentation' },
          { id: 'c', text: 'Discernment' },
          { id: 'd', text: 'Diligence' },
        ],
        correctOptionId: 'b',
        explanation: 'The four are Delegation, Description, Discernment, and Diligence — "Documentation" is not one of them.',
      },
    ],
  },
  {
    id: 'genai-deep-dive',
    title: 'Deep Dive: What is Generative AI?',
    summary: 'Generative AI fundamentals, and the capabilities and limitations that make Discernment necessary.',
    keyConcepts: [
      'Generative AI produces new content by learning patterns from data, unlike discriminative AI which classifies from fixed categories.',
      'Large language models predict likely next tokens based on learned patterns, not by looking up stored facts.',
      "A model's 'knowledge cutoff' bounds what it knows without additional context.",
      'Fluent output is not the same as accurate output — this is the root cause of hallucination.',
    ],
    body: [
      'Generative AI refers to models trained to produce new content — text, images, code — by learning patterns from large datasets. This is different from earlier "discriminative" AI, which classifies or predicts from a fixed set of categories rather than generating something new.',
      "Large language models like Claude generate text by predicting likely continuations, token by token, based on patterns learned during training and conditioned on the current input. They're capable of fluent language generation, synthesizing across large amounts of information, and adapting tone or format on request.",
      "Their limitations follow directly from how they work: no persistent memory beyond what's in the current context (unless given tools for it), a training-data knowledge cutoff, and the ability to produce plausible-sounding but incorrect output — commonly called hallucination — because fluent generation doesn't guarantee factual accuracy. This is exactly why the Discernment competency, covered later in this course, matters.",
    ],
    knowledgeChecks: [
      {
        id: 'genai-kc1', domain: 'genai-fundamentals',
        prompt: "What does it mean that a large language model is fundamentally a 'pattern-completion' system?",
        options: [
          { id: 'a', text: 'It generates output by predicting likely continuations from learned patterns, not by looking up stored facts' },
          { id: 'b', text: 'It can only repeat text it has seen verbatim' },
          { id: 'c', text: 'It queries a live, verified database for every answer' },
          { id: 'd', text: 'It has no limitations on accuracy' },
        ],
        correctOptionId: 'a',
        explanation: 'This is the core mechanism behind both its fluency and its capacity for hallucination.',
      },
      {
        id: 'genai-kc2', domain: 'genai-fundamentals',
        prompt: 'Which of the following is a genuine limitation of current generative AI systems?',
        options: [
          { id: 'a', text: 'Hallucination — producing plausible but incorrect output with apparent confidence' },
          { id: 'b', text: 'Inability to process more than one sentence of input' },
          { id: 'c', text: 'Inability to adapt tone or format' },
          { id: 'd', text: 'Complete inability to summarize text' },
        ],
        correctOptionId: 'a',
        explanation: 'Hallucination is a real, well-documented limitation; the other options describe capabilities the models actually have.',
      },
      {
        id: 'genai-kc3', domain: 'genai-fundamentals',
        prompt: 'Generative AI differs from earlier discriminative AI systems mainly because it...',
        options: [
          { id: 'a', text: 'Produces new content rather than only classifying or predicting from fixed categories' },
          { id: 'b', text: 'Only works with numeric data' },
          { id: 'c', text: 'Cannot be used for text tasks' },
          { id: 'd', text: 'Requires no training data at all' },
        ],
        correctOptionId: 'a',
        explanation: 'This generation-vs-classification distinction is the defining difference between the two approaches.',
      },
    ],
  },
  {
    id: 'delegation',
    title: 'Delegation',
    summary: 'A closer look at deciding what to hand to AI, and applying Delegation to project planning.',
    keyConcepts: [
      'Two failure modes: over-delegation (handing off work needing human judgment/accountability) and under-delegation (doing tedious, AI-suited work by hand).',
      'Good delegation starts from a clear picture of the desired outcome before choosing a tool.',
      'Project planning through a Delegation lens means assigning each task within a project to its best-suited driver, not making one decision for the whole project.',
    ],
    body: [
      'Delegation is the competency of deciding what work to hand to AI, what to keep for yourself, and choosing the right AI tool or technique for a given goal. It has two failure modes: over-delegation — handing off work that actually needs human judgment, creativity, or accountability — and under-delegation — doing tedious, well-suited-for-AI work by hand instead.',
      "Good delegation starts with a clear picture of the desired outcome — the creative vision — before choosing a tool. The tool choice follows from the goal, not the other way around.",
      "Applied to project planning, Delegation means breaking a larger goal into discrete tasks and assigning each one to its best-suited driver — human, AI, or a collaborative loop between the two — rather than making one delegation decision for an entire project.",
    ],
    knowledgeChecks: [
      {
        id: 'delegation-kc1', domain: 'delegation',
        prompt: 'A team hands an AI system a high-stakes decision requiring accountability and nuanced judgment, without human review. This is an example of...',
        options: [
          { id: 'a', text: 'Over-delegation' },
          { id: 'b', text: 'Under-delegation' },
          { id: 'c', text: 'Good Diligence practice' },
          { id: 'd', text: 'Effective Description' },
        ],
        correctOptionId: 'a',
        explanation: 'Handing off work that genuinely requires human judgment and accountability, without review, is the over-delegation failure mode.',
      },
      {
        id: 'delegation-kc2', domain: 'delegation',
        prompt: 'Which should come first when practicing good Delegation?',
        options: [
          { id: 'a', text: 'Getting clear on the outcome you actually want' },
          { id: 'b', text: 'Picking the most advanced AI tool available' },
          { id: 'c', text: 'Writing the most detailed prompt possible' },
          { id: 'd', text: 'Asking the AI which tool to use' },
        ],
        correctOptionId: 'a',
        explanation: 'Delegation starts from the desired outcome; tool choice follows the goal, not the reverse.',
      },
      {
        id: 'delegation-kc3', domain: 'delegation',
        prompt: 'In project planning through a Delegation lens, why break a project into individual tasks before deciding who does what?',
        options: [
          { id: 'a', text: 'Different tasks within the same project may be best suited to different drivers' },
          { id: 'b', text: 'Every task in a project must always be delegated to AI' },
          { id: 'c', text: 'It removes the need for a project plan altogether' },
          { id: 'd', text: 'It guarantees the project needs no human involvement' },
        ],
        correctOptionId: 'a',
        explanation: 'A single project can contain tasks best suited to a human, to AI, or to a collaborative loop — task-level delegation is more precise than an all-or-nothing decision.',
      },
    ],
  },
  {
    id: 'description',
    title: 'Description',
    summary: 'A closer look at describing tasks effectively, plus a deep dive on prompting techniques.',
    keyConcepts: [
      'Effective description includes context, constraints, and criteria for what "good" looks like.',
      'Examples of the desired output and explicit statements of what to avoid reduce back-and-forth.',
      "Description is iterative — a perfect result on the first try isn't the norm.",
    ],
    body: [
      "Description is the competency of communicating a task or vision to an AI system clearly enough that it can produce something useful. Vague descriptions produce vague or misdirected output; effective description includes context (why/what this is for), constraints (format, length, tone), and criteria for what 'good' looks like.",
      'The Deep Dive on effective prompting techniques adds specifics: stating the desired output format, providing an example of the kind of result you want, and stating what to avoid all reduce back-and-forth with the AI.',
      "Description is iterative. An initial description rarely gets a perfect result on the first try — refining based on what the output reveals is normal practice, not a sign of doing it wrong.",
    ],
    knowledgeChecks: [
      {
        id: 'description-kc1', domain: 'description',
        prompt: "Which addition makes an AI description more effective?",
        options: [
          { id: 'a', text: 'Including context, constraints, and criteria for what "good" looks like' },
          { id: 'b', text: 'Keeping the request as vague as possible' },
          { id: 'c', text: 'Never providing examples' },
          { id: 'd', text: 'Avoiding any mention of format or tone' },
        ],
        correctOptionId: 'a',
        explanation: 'Context, constraints, and success criteria are exactly what turns a vague request into a well-described one.',
      },
      {
        id: 'description-kc2', domain: 'description',
        prompt: "Why is it normal to not get a perfect result from your first description of a task?",
        options: [
          { id: 'a', text: 'Description is inherently iterative, and refining based on output is part of the process' },
          { id: 'b', text: 'AI systems are incapable of following any instructions' },
          { id: 'c', text: "It means you should stop using AI for that task" },
          { id: 'd', text: 'It only happens with unusually complex tasks' },
        ],
        correctOptionId: 'a',
        explanation: 'The course frames Description as iterative by nature — refinement is expected, not a failure signal.',
      },
      {
        id: 'description-kc3', domain: 'description',
        prompt: 'According to the Deep Dive on effective prompting, which technique reduces back-and-forth with an AI system?',
        options: [
          { id: 'a', text: 'Providing an example of the kind of result you want' },
          { id: 'b', text: 'Omitting any context about the goal' },
          { id: 'c', text: 'Repeating the same request word-for-word if it fails' },
          { id: 'd', text: 'Never specifying a format' },
        ],
        correctOptionId: 'a',
        explanation: 'Concrete examples of the desired output are called out as one of the most effective ways to reduce iteration.',
      },
    ],
  },
  {
    id: 'discernment',
    title: 'Discernment',
    summary: 'A closer look at critically evaluating AI output, and the Description–Discernment loop.',
    keyConcepts: [
      'Discernment means evaluating AI output for accuracy, quality, and appropriateness.',
      'Subject-matter expertise improves Discernment by helping you catch subtle, confidently-stated errors.',
      'The Description–Discernment loop: evaluating output often reveals the original description was incomplete.',
    ],
    body: [
      'Discernment is the competency of thoughtfully and critically evaluating AI outputs, processes, and behavior — is this accurate, appropriate, and actually useful for the goal at hand.',
      "Discernment requires domain knowledge: the more you know about a subject, the better positioned you are to catch subtle errors an AI might present with total confidence.",
      "The Description–Discernment loop describes how these two competencies reinforce each other: evaluating an output (Discernment) often reveals that the original description was ambiguous or incomplete, which leads to refining the description and trying again. Fluency isn't getting a perfect prompt on the first attempt — it's running this evaluate-and-refine loop efficiently.",
    ],
    knowledgeChecks: [
      {
        id: 'discernment-kc1', domain: 'discernment',
        prompt: 'Why does subject-matter expertise improve Discernment?',
        options: [
          { id: 'a', text: 'It helps someone recognize subtle errors that a confident-sounding but incorrect output might otherwise hide' },
          { id: 'b', text: 'Experts never need to review AI output' },
          { id: 'c', text: 'It has no real effect on Discernment' },
          { id: 'd', text: 'Experts are less likely to use AI at all' },
        ],
        correctOptionId: 'a',
        explanation: 'Deeper subject knowledge makes it easier to catch errors that look plausible on the surface.',
      },
      {
        id: 'discernment-kc2', domain: 'discernment',
        prompt: 'What typically triggers a pass through the Description–Discernment loop?',
        options: [
          { id: 'a', text: 'Discovering, through evaluation, that the description was ambiguous or incomplete' },
          { id: 'b', text: 'A fixed schedule requiring prompt revisions on a timer' },
          { id: 'c', text: 'Random chance' },
          { id: 'd', text: 'The AI asking unprompted clarifying questions' },
        ],
        correctOptionId: 'a',
        explanation: 'Evaluating an output is what reveals gaps in the original description, prompting refinement.',
      },
      {
        id: 'discernment-kc3', domain: 'discernment',
        prompt: 'Discernment primarily involves evaluating AI output for...',
        options: [
          { id: 'a', text: 'Accuracy, quality, and appropriateness for the intended purpose' },
          { id: 'b', text: 'How quickly it was generated' },
          { id: 'c', text: 'Whether it uses AI-sounding vocabulary' },
          { id: 'd', text: 'How long the output is' },
        ],
        correctOptionId: 'a',
        explanation: 'These are the specific criteria named for evaluating AI output under Discernment.',
      },
    ],
  },
  {
    id: 'diligence',
    title: 'Diligence',
    summary: 'A closer look at using AI responsibly, ethically, and with accountability.',
    keyConcepts: [
      'Diligence is transparency about AI use plus accountability for AI-assisted work.',
      'It includes ethical considerations like respecting intellectual property and downstream impact.',
      'Diligence is what makes the other three competencies trustworthy.',
    ],
    body: [
      "Diligence is the competency of using AI responsibly: being transparent about when and how AI was used, remaining accountable for AI-assisted work as if you'd done it yourself, and making thoughtful choices about appropriate use cases.",
      'It includes ethical considerations — respecting intellectual property, avoiding uses that could mislead others about what is human- versus AI-generated when that distinction matters, and considering the downstream impact of AI-assisted work. It also covers practical responsibility: verifying AI-assisted work before relying on it, which connects directly back to Discernment.',
      "Diligence is what makes the other three competencies trustworthy. Delegation, Description, and Discernment done skillfully but applied irresponsibly still isn't AI fluency.",
    ],
    knowledgeChecks: [
      {
        id: 'diligence-kc1', domain: 'diligence',
        prompt: 'Which best reflects the Diligence competency?',
        options: [
          { id: 'a', text: 'Remaining accountable for AI-assisted work as if you had done it yourself, and being transparent about AI\'s role' },
          { id: 'b', text: 'Using AI for every task regardless of appropriateness' },
          { id: 'c', text: 'Avoiding AI entirely to eliminate all risk' },
          { id: 'd', text: 'Delegating accountability to the AI vendor if something goes wrong' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence centers on transparency and accountability, not blanket avoidance or overuse, and accountability can\'t be outsourced.',
      },
      {
        id: 'diligence-kc2', domain: 'diligence',
        prompt: 'A student submits an AI-written essay without disclosure when disclosure was required, and without checking it for accuracy. Which competency did they most clearly fail to apply?',
        options: [
          { id: 'a', text: 'Diligence' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'None — this is acceptable practice' },
        ],
        correctOptionId: 'a',
        explanation: 'Missing disclosure and unverified accuracy are both squarely Diligence failures.',
      },
      {
        id: 'diligence-kc3', domain: 'diligence',
        prompt: 'Why is Diligence often described as what makes the other three competencies trustworthy?',
        options: [
          { id: 'a', text: 'It governs how responsibly and ethically Delegation, Description, and Discernment are carried out throughout the work' },
          { id: 'b', text: 'It is applied only once, at the very end of a project' },
          { id: 'c', text: 'It replaces the need for Discernment entirely' },
          { id: 'd', text: 'It only applies to AI companies, not individual users' },
        ],
        correctOptionId: 'a',
        explanation: "Diligence is an ongoing responsibility that shapes how the other competencies are applied, not a final checkbox.",
      },
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion & Certification',
    summary: 'Recap of the 4D Framework as a loop, and how this course relates to the CCAR-F exam blueprint.',
    keyConcepts: [
      'The 4D Framework is a loop applied throughout a task, not a one-time checklist.',
      "This course's content is foundational — the CCAR-F exam blueprint is scored on separate technical domains (see the Project Plan page).",
    ],
    body: [
      'The four competencies connect as a loop, not a checklist: delegate thoughtfully, describe clearly, discern critically, and act with diligence throughout — not once each in sequence.',
      "This course's own assessment tests whether the framework can be applied to a project context, not just recited from memory.",
      "Worth noting for certification planning: the Claude Certified Architect – Foundations exam blueprint is scored on five separate technical domains (Agentic Architecture & Orchestration, Tool Design & MCP Integration, Claude Code Configuration & Workflows, Prompt Engineering & Structured Output, and Context Management & Reliability) built on the later prep courses — not on the 4D Framework directly. This course is genuinely foundational to working well with AI, but it sits outside the exam's own scored blueprint.",
    ],
    knowledgeChecks: [
      {
        id: 'conclusion-kc1', domain: 'framework-overview',
        prompt: 'The four competencies of the AI Fluency Framework are best understood as...',
        options: [
          { id: 'a', text: 'An interacting loop applied throughout a task, not a one-time checklist' },
          { id: 'b', text: 'Four unrelated, independent skills' },
          { id: 'c', text: 'A strict sequence performed once, in order, per project' },
          { id: 'd', text: 'A ranking of which AI tools are best' },
        ],
        correctOptionId: 'a',
        explanation: 'The course frames the 4D Framework as an interacting loop, most visibly between Description and Discernment.',
      },
      {
        id: 'conclusion-kc2', domain: 'framework-overview',
        prompt: 'True or false: the Claude Certified Architect – Foundations exam blueprint tests the 4D Framework directly as one of its scored domains.',
        options: [
          { id: 'a', text: 'False — the 4D Framework is foundational but not one of the exam\'s 5 scored domains' },
          { id: 'b', text: 'True — it is Domain 1 on the exam' },
          { id: 'c', text: 'True — it is the only thing tested' },
          { id: 'd', text: 'False — the exam has no defined domains at all' },
        ],
        correctOptionId: 'a',
        explanation: "The exam's 5 domains are technical (Agentic Architecture, Tool Design & MCP, Claude Code Config, Prompt Engineering, Context Management), built on the other prep courses.",
      },
      {
        id: 'conclusion-kc3', domain: 'diligence',
        prompt: 'Which competency is most directly responsible for making the other three trustworthy?',
        options: [
          { id: 'a', text: 'Diligence' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'Discernment' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence — transparency, accountability, and ethical judgment — is what makes skillful Delegation, Description, and Discernment trustworthy.',
      },
    ],
  },
];

if (typeof module !== 'undefined') module.exports = MODULES_AI_FLUENCY_FOUNDATIONS;
