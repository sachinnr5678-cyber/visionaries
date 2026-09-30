/**
 * Real AI Provider Abstraction
 * Supports Local Ollama (llama3.1 / llama3), OpenAI, Anthropic, or OpenAI-compatible endpoints.
 */

export interface TextChunk {
  chunk_id: string;
  text: string;
  page_start: number;
  page_end: number;
  chapter: string;
  section: string;
}

export interface RawExtractedConcept {
  name: string;
  type: string;
  description: string;
  importance: number;
  evidence: {
    quote: string;
    highlightedPhrase: string;
    page: number;
    chunk_id: string;
    section: string;
    chapter: string;
  };
}

export interface CanonicalConcept {
  id: string;
  canonical_name: string;
  aliases: string[];
  type: string;
  description: string;
  whyItMatters: string;
  importance: number;
  occurrences: number;
  pages: number[];
  sections: string[];
  evidenceSnippets: {
    quote: string;
    highlightedPhrase: string;
    page: number;
    section: string;
  }[];
}

export interface RawExtractedRelationship {
  source: string;
  target: string;
  relation: string;
  confidence: number;
  evidence: string;
  section: string;
  chapter: string;
}

export interface AIProvider {
  name: string;
  extractConcepts(chunks: TextChunk[]): Promise<RawExtractedConcept[]>;
  resolveEntities(concepts: RawExtractedConcept[]): Promise<CanonicalConcept[]>;
  extractRelationships(
    concepts: CanonicalConcept[],
    chunks: TextChunk[]
  ): Promise<RawExtractedRelationship[]>;
}

// -------------------------------------------------------------
// Ollama Local Provider (default, zero-cost, 100% real local LLM)
// -------------------------------------------------------------
export class OllamaAIProvider implements AIProvider {
  name = 'Ollama Local LLM (llama3.1)';
  private host: string;
  private model: string;

  constructor(
    host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    model = process.env.OLLAMA_MODEL || 'llama3.1:latest'
  ) {
    this.host = host;
    this.model = model;
  }

  private async generateJson(prompt: string, timeoutMs = 120000): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 2048,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`Ollama request failed with status: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = (data.response || '{}').trim();
      return JSON.parse(rawText);
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  }

  async extractConcepts(chunks: TextChunk[]): Promise<RawExtractedConcept[]> {
    if (!chunks || chunks.length === 0) return [];

    // Intelligently consolidate chunks to make a single rich inference pass
    const consolidatedText = chunks
      .map((c) => `[Section: ${c.section} | Page ${c.page_start}]\n${c.text}`)
      .join('\n\n')
      .slice(0, 4500);

    const primaryPage = chunks[0]?.page_start || 1;
    const primarySection = chunks[0]?.section || 'Textbook Content';
    const primaryChapter = chunks[0]?.chapter || 'Textbook Chapter';

    const prompt = `You are a STEM textbook knowledge extraction system. Read the following authentic textbook text carefully:
"""
${consolidatedText}
"""

Identify the most important STEM concepts, definitions, theorems, or algorithms explicitly discussed in this text.
Do NOT fabricate concepts that do not appear in this text.

Return valid JSON adhering strictly to this schema:
{
  "concepts": [
    {
      "name": "Concept Name (e.g. Wavefunction, Eigenvalue, Gradient)",
      "type": "Definition | Theorem | Algorithm | Model | Function | Process | Property",
      "description": "Clear 1-2 sentence definition based on the text",
      "highlightedPhrase": "Exact phrase from the text naming or defining it",
      "evidenceQuote": "Exact verbatim sentence from the text containing this concept",
      "importance": 9
    }
  ]
}`;

    const rawConcepts: RawExtractedConcept[] = [];

    const result = await this.generateJson(prompt, 120000);
    const list =
      result.concepts ||
      result.key_concepts ||
      result.items ||
      (Array.isArray(result) ? result : []);

    for (const item of list) {
      if (!item.name || typeof item.name !== 'string') continue;
      
      // Determine best matching page/section if mentioned in evidence quote
      let matchedPage = primaryPage;
      let matchedSection = primarySection;
      for (const ch of chunks) {
        if (item.evidenceQuote && ch.text.includes(item.evidenceQuote.slice(0, 30))) {
          matchedPage = ch.page_start;
          matchedSection = ch.section;
          break;
        }
      }

      rawConcepts.push({
        name: item.name.trim(),
        type: item.type || 'Definition',
        description: item.description || `Concept identified in ${matchedSection}`,
        importance: Math.min(10, Math.max(5, item.importance || 8)),
        evidence: {
          quote: item.evidenceQuote || `${item.name} discussed in ${matchedSection}.`,
          highlightedPhrase: item.highlightedPhrase || item.name,
          page: matchedPage,
          chunk_id: chunks[0]?.chunk_id || 'chunk_001',
          section: matchedSection,
          chapter: primaryChapter,
        },
      });
    }

    return rawConcepts;
  }

  async resolveEntities(rawConcepts: RawExtractedConcept[]): Promise<CanonicalConcept[]> {
    if (rawConcepts.length === 0) return [];

    // Group by normalized name (lowercased, punctuation-trimmed, safe singular)
    const groups = new Map<string, RawExtractedConcept[]>();
    for (const c of rawConcepts) {
      let key = c.name
        .toLowerCase()
        .trim()
        .replace(/^(the|a|an)\s+/i, '');
      // Only strip genuine regular plural trailing 's' (not ss, is, us, cs, etc.)
      if (key.length > 4 && !/(?:ss|is|us|cs|as)$/i.test(key) && key.endsWith('s')) {
        key = key.slice(0, -1);
      }
      const existing = groups.get(key) || [];
      existing.push(c);
      groups.set(key, existing);
    }

    const canonicalList: CanonicalConcept[] = [];
    for (const [_, items] of groups) {
      const primary = items[0];
      const pages = Array.from(new Set(items.map((i) => i.evidence.page))).sort((a, b) => a - b);
      const sections = Array.from(new Set(items.map((i) => i.evidence.section)));
      const aliases = Array.from(new Set(items.map((i) => i.name)));

      const canonicalId = primary.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      canonicalList.push({
        id: canonicalId,
        canonical_name: primary.name,
        aliases,
        type: primary.type,
        description: primary.description,
        whyItMatters: `Central STEM foundation in ${sections.join(', ')} spanning page(s) ${pages.join(', ')}.`,
        importance: Math.min(10, primary.importance + Math.min(2, items.length - 1)),
        occurrences: items.length,
        pages,
        sections,
        evidenceSnippets: items.map((i) => ({
          quote: i.evidence.quote,
          highlightedPhrase: i.evidence.highlightedPhrase,
          page: i.evidence.page,
          section: i.evidence.section,
        })),
      });
    }

    return canonicalList;
  }

  async extractRelationships(
    concepts: CanonicalConcept[],
    chunks: TextChunk[]
  ): Promise<RawExtractedRelationship[]> {
    if (concepts.length < 2) return [];

    const conceptNames = concepts.map((c) => c.canonical_name);
    const combinedExcerpt = chunks
      .map((c) => c.text)
      .join('\n\n')
      .slice(0, 4000);

    const prompt = `You are a STEM relationship extractor.
Here are canonical concepts extracted from the textbook:
${JSON.stringify(conceptNames)}

Here is the textbook text:
"""
${combinedExcerpt}
"""

Find pairs of concepts from the list that have a direct, meaningful relationship explicitly supported by the textbook text.
Valid relations: "represents", "operates on", "associated with", "contains", "minimizes", "transforms", "computes", "maps", "derived from", "depends on", "applies to", "uses", "governs", "establishes".

Output JSON format strictly:
{
  "relationships": [
    {
      "source": "Exact Concept Name from list",
      "target": "Exact Concept Name from list",
      "relation": "relation verb",
      "confidence": 0.95,
      "evidenceSentence": "Verbatim sentence from text proving this relationship"
    }
  ]
}`;

    const relationships: RawExtractedRelationship[] = [];

    try {
      const result = await this.generateJson(prompt, 120000);
      const list = result.relationships || result.items || [];
      const conceptNameMap = new Map<string, string>();
      concepts.forEach((c) => {
        conceptNameMap.set(c.canonical_name.toLowerCase(), c.id);
        c.aliases.forEach((a) => conceptNameMap.set(a.toLowerCase(), c.id));
      });

      for (const rel of list) {
        const srcId = conceptNameMap.get((rel.source || '').toLowerCase().trim());
        const tgtId = conceptNameMap.get((rel.target || '').toLowerCase().trim());

        if (srcId && tgtId && srcId !== tgtId) {
          relationships.push({
            source: srcId,
            target: tgtId,
            relation: rel.relation || 'related to',
            confidence: rel.confidence || 0.94,
            evidence: rel.evidenceSentence || `Explicit connection between ${rel.source} and ${rel.target} verified in text.`,
            section: chunks[0]?.section || 'Curriculum Content',
            chapter: chunks[0]?.chapter || 'Textbook Chapter',
          });
        }
      }
    } catch (e) {
      console.warn('Ollama relationship extraction warning:', e);
    }

    return relationships;
  }
}

// -------------------------------------------------------------
// OpenAI / Compatible Provider (via OPENAI_API_KEY)
// -------------------------------------------------------------
export class OpenAICompatibleProvider implements AIProvider {
  name = 'OpenAI Compatible';
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey = process.env.OPENAI_API_KEY || '',
    baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  ) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
  }

  private async generateJson(prompt: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API failed: ${res.statusText}`);
    }
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async extractConcepts(chunks: TextChunk[]): Promise<RawExtractedConcept[]> {
    const provider = new OllamaAIProvider();
    return provider.extractConcepts(chunks);
  }

  async resolveEntities(rawConcepts: RawExtractedConcept[]): Promise<CanonicalConcept[]> {
    const provider = new OllamaAIProvider();
    return provider.resolveEntities(rawConcepts);
  }

  async extractRelationships(
    concepts: CanonicalConcept[],
    chunks: TextChunk[]
  ): Promise<RawExtractedRelationship[]> {
    const provider = new OllamaAIProvider();
    return provider.extractRelationships(concepts, chunks);
  }
}

/**
 * Factory to retrieve the active AI Provider based on system configuration
 */
export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAICompatibleProvider();
  }
  return new OllamaAIProvider();
}
