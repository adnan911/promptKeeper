export const MODEL_COLORS = {
  'GPT-4':   '#EBA328', // Golden
  'GPT-3.5': '#EDD8DF', // Cream
  'Claude':  '#AB6937', // Rust
  'Gemini':  '#E8C2B3', // Rose
  'Llama':   '#1E4445', // Teal
  'Mistral': '#233436', // Slate
  'DeepSeek': '#AB6937',
};

export const CATEGORIES = ['All', 'Coding', 'Creative', 'Business', 'System', 'Research', 'Personal'];

export const PREMIUM_GRADIENTS = [
  'linear-gradient(135deg, #EDD8DF, #EBA328)', // Cream to Gold
  'linear-gradient(135deg, #EDD8DF, #AB6937)', // Cream to Rust
  'linear-gradient(135deg, #E8C2B3, #AB6937)', // Rose to Rust
  'linear-gradient(135deg, #EBA328, #1E4445)', // Gold to Teal
  'linear-gradient(135deg, #AB6937, #233436)', // Rust to Slate
  'linear-gradient(135deg, #1E4445, #233436)', // Teal to Slate
];

export const DEFAULT_CAT_COLORS = {
  'All':      '#EBA328',
  'Coding':   '#AB6937',
  'Creative': '#E8C2B3',
  'Business': '#EDD8DF',
  'System':   '#1E4445',
  'Research': '#AB6937',
  'Personal': '#233436'
};

export const TAG_PALETTE = [
  '#EBA328', '#AB6937', '#E8C2B3', '#EDD8DF', '#1E4445', '#233436'
];

export function getTagColor(tag) {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % TAG_PALETTE.length;
  return TAG_PALETTE[h];
}

export const PATS = [
  { re: /\{\{([^}]+)\}\}/g, syn: 'handlebars', o: '{{', c: '}}' },
  { re: /\$\{([^}]+)\}/g,   syn: 'template',   o: '${', c: '}'  },
  { re: /\[([A-Z_][A-Z0-9_]*)\]/g, syn: 'bracket', o: '[', c: ']' },
  { re: /%([A-Z_][A-Z0-9_]*)%/g,   syn: 'percent',  o: '%', c: '%' },
];

export const UNRE = /(\{\{[^}]+\}\}|\$\{[^}]+\}|\[[A-Z_][A-Z0-9_]*\]|%[A-Z_][A-Z0-9_]*%)/g;

export function extractVars(text) {
  if (!text) return [];
  const out = [];
  const seen = new Set();
  
  PATS.forEach(p => {
    const matches = [...text.matchAll(new RegExp(p.re.source, 'g'))];
    matches.forEach(m => {
      const name = m[1].trim();
      if (!seen.has(name)) {
        seen.add(name);
        out.push({
          name,
          syn: p.syn,
          o: p.o,
          c: p.c
        });
      }
    });
  });
  
  return out;
}


const now = Date.now();

export const SEED_PROMPTS = [
  {
    id: 1,
    title: 'Code Review Expert',
    body: 'You are a senior software engineer reviewing {{language}} code for correctness, performance, security vulnerabilities and best practices.\n\nReview the following code:\n```\n{{code}}\n```\n\nProvide structured feedback:\n1. Critical issues (must fix)\n2. Improvements (should fix)\n3. Positive aspects\n\nBe specific, reference line numbers, and provide corrected snippets.',
    tags: ['code', 'review', 'engineering'],
    category: 'Coding',
    model: 'Claude',
    fav: true,
    uses: 47,
    created: now - 864e6,
    history: [8, 15, 28, 40, 47],
    notes: 'Works best with full file context. Specify language clearly.',
  },
  {
    id: 2,
    title: 'System Prompt Architect',
    body: 'Design a comprehensive system prompt for an AI assistant specialized in {{domain}}.\n\nRequirements:\n- Clear persona definition with name and role\n- Behavioral constraints and guardrails\n- Output format and style guidelines\n- 3 example Q&A pairs\n- Edge case handling rules\n\nTone style: {{tone}}\nTarget model: {{model}}',
    tags: ['system', 'prompt-eng', 'meta', 'architecture'],
    category: 'System',
    model: 'GPT-4',
    fav: false,
    uses: 31,
    created: now - 72e7,
    history: [4, 10, 20, 31],
    notes: '',
  },
  {
    id: 3,
    title: 'Bug Hunter Protocol',
    body: 'Analyze the following {{language}} code for bugs, edge cases, memory leaks, and off-by-one errors.\n\n```\n{{code}}\n```\n\nReturn a structured report:\n1. Bug description with exact line references\n2. Root cause analysis\n3. Corrected code with inline comments\n4. Unit tests that would catch this bug\n5. Prevention strategies',
    tags: ['debug', 'code', 'analysis', 'testing'],
    category: 'Coding',
    model: 'Claude',
    fav: true,
    uses: 88,
    created: now - 43e7,
    history: [15, 32, 55, 72, 88],
    notes: 'Add stacktrace to the {{code}} block for 2x better results.',
  },
  {
    id: 4,
    title: 'Narrative Voice Sculptor',
    body: 'Rewrite the following text in the distinctive voice and style of {{author}}, capturing their rhythm, vocabulary, thematic preoccupations, and sentence structure.\n\nOriginal text:\n{{text}}\n\nMaintain the core meaning but transform the prose entirely. The result should feel authentically {{author}}-esque — someone familiar with their work should immediately recognize the influence.',
    tags: ['writing', 'style', 'creative', 'voice'],
    category: 'Creative',
    model: 'GPT-4',
    fav: false,
    uses: 19,
    created: now - 21e7,
    history: [3, 8, 14, 19],
    notes: '',
  },
  {
    id: 5,
    title: 'Executive Brief Generator',
    body: 'Transform the following raw information into a polished executive brief for {{audience}}.\n\nRaw data / context:\n{{data}}\n\nFormat:\n## Situation Summary\n(2 sentences max)\n\n## Key Findings\n- Finding 1\n- Finding 2\n- Finding 3\n\n## Recommended Actions\n(Prioritized, with owners and timelines)\n\n## Risk Assessment\n(1 paragraph)\n\n## Next Steps\n(Bullet list with dates)\n\nTone: Professional, direct, data-driven. No jargon.',
    tags: ['business', 'writing', 'executive', 'strategy'],
    category: 'Business',
    model: 'Claude',
    fav: false,
    uses: 23,
    created: now - 15e7,
    history: [5, 11, 18, 23],
    notes: '',
  },
  {
    id: 6,
    title: 'Research Synthesizer',
    body: 'You are a research analyst. Synthesize the following sources on {{topic}} into a coherent analytical summary.\n\nSources:\n{{sources}}\n\nOutput format:\n\n### Consensus View\nWhat do most sources agree on?\n\n### Key Debates\nWhere do sources disagree and why?\n\n### Evidence Quality\nAssess the reliability of the sources provided.\n\n### Knowledge Gaps\nWhat remains unknown or understudied?\n\n### Your Synthesis\nYour analytical conclusion with confidence level (High/Medium/Low).',
    tags: ['research', 'analysis', 'academic', 'synthesis'],
    category: 'Research',
    model: 'Gemini',
    fav: true,
    uses: 34,
    created: now - 9e7,
    history: [6, 14, 24, 34],
    notes: 'Paste abstracts or excerpts into {{sources}}. Works well for literature reviews.',
  },
  {
    id: 7,
    title: 'Cold Email Crafter',
    body: 'Write a compelling cold email to a {{recipient_role}} at a {{company_type}} company.\n\nContext about them: {{context}}\nMy goal: {{goal}}\nMy value prop: {{value_prop}}\n\nRequirements:\n- Subject line: under 7 words, no clickbait\n- Opening: show genuine research into their work\n- Body: value prop in 1-2 sentences max\n- CTA: low-friction, specific, easy to say yes to\n- Total length: under 150 words\n- Tone: human, not salesy',
    tags: ['email', 'sales', 'outreach', 'copywriting'],
    category: 'Business',
    model: 'GPT-4',
    fav: false,
    uses: 41,
    created: now - 6e7,
    history: [8, 18, 30, 41],
    notes: 'Generate 3 variants and A/B test subject lines.',
  },
  {
    id: 8,
    title: 'World Builder Protocol',
    body: 'Build a richly detailed fictional world for a {{genre}} story.\n\nSeed concept: {{seed}}\n\nDevelop each element with internal consistency:\n\n1. **Geography & Climate** — continents, biomes, notable landmarks\n2. **Political Structure** — governments, factions, power dynamics\n3. **Magic/Technology System** — rules, limitations, energy source\n4. **Cultural Traditions** — rituals, taboos, art forms, cuisine\n5. **Historical Timeline** — 3 world-shaping events in the last 500 years\n6. **Unique Creatures** — 2-3 species with ecological roles\n7. **Conflict Seeds** — 3 tensions that could drive a story\n\nEverything must follow from the same underlying logic.',
    tags: ['worldbuilding', 'fiction', 'creative', 'lore'],
    category: 'Creative',
    model: 'Claude',
    fav: true,
    uses: 55,
    created: now - 3e7,
    history: [10, 22, 38, 55],
    notes: '',
  },
  {
    id: 9,
    title: 'API Documentation Writer',
    body: 'Write Stripe-quality API documentation for the following endpoint specification:\n\n{{endpoint_spec}}\n\nInclude:\n\n## Overview\n(Purpose and use case)\n\n## Request\n- Method & URL\n- Headers table\n- Path parameters table\n- Body parameters table (name, type, required, description)\n\n## Response\n- Success schema with types\n- Error codes table\n\n## Code Examples\n```{{language}}\n// Example request\n```\n\n## Rate Limiting\n(Notes on limits and retry strategy)\n\n## Changelog\n(Version and date)',
    tags: ['docs', 'api', 'technical', 'developer'],
    category: 'Coding',
    model: 'Claude',
    fav: false,
    uses: 16,
    created: now - 12e6,
    history: [3, 8, 13, 16],
    notes: 'Paste OpenAPI spec or describe the endpoint manually.',
  },
  {
    id: 10,
    title: 'Personal Brand Bio Writer',
    body: 'Write a compelling professional bio for {{name}}, a {{role}} with the following background:\n\n{{background}}\n\nKey achievements: {{achievements}}\nTarget audience: {{audience}}\nPlatform: {{platform}}\n\nWrite 3 versions:\n1. **Twitter/X bio** — 160 chars max, punchy\n2. **LinkedIn summary** — 3 paragraphs, achievement-focused\n3. **Speaker bio** — 3rd person, 100 words, credibility-forward\n\nTone: Confident but not arrogant. Human, not corporate.',
    tags: ['bio', 'branding', 'personal', 'copywriting'],
    category: 'Personal',
    model: 'GPT-4',
    fav: false,
    uses: 12,
    created: now - 5e6,
    history: [4, 8, 12],
    notes: '',
  },
];
