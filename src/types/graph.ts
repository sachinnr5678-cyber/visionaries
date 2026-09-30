export type ConceptType =
  | 'Definition'
  | 'Theorem'
  | 'Algorithm'
  | 'Function'
  | 'Variable'
  | 'Model'
  | 'Process'
  | 'Application';

export type RelationType =
  | 'represents'
  | 'operates on'
  | 'associated with'
  | 'contains'
  | 'minimizes'
  | 'optimizes'
  | 'transforms'
  | 'computes'
  | 'maps'
  | 'derived from'
  | 'depends on'
  | 'applies to'
  | 'activates'
  | 'uses';

export interface SourceEvidence {
  quote: string;
  highlightedPhrase: string;
  chapter: string;
  section: string;
  pageNumber: number;
  confidence: number;
}

export interface Concept {
  id: string;
  label: string;
  type: ConceptType;
  description: string;
  whyItMatters: string;
  importance: number; // 1 to 10
  section: string;
  chapter: string;
  category: 'core-math' | 'transforms' | 'ml-bridge' | 'deep-learning' | 'optimization';
  evidence: SourceEvidence;
  prerequisites: string[];
  // Layout positions
  x?: number;
  y?: number;
  z?: number;
}

export interface Relationship {
  id: string;
  source: string; // Concept ID
  target: string; // Concept ID
  relation: RelationType;
  confidence: number;
  evidence: string;
  section: string;
  chapter: string;
  category: 'composition' | 'operation' | 'optimization' | 'derivation' | 'mapping';
}

export interface ChapterSection {
  id: string;
  code: string; // e.g. "5.1"
  title: string;
  conceptIds: string[];
  readingExcerpt: string;
  pageNumber: number;
}

export interface ChapterOutline {
  id: string;
  title: string;
  subtitle: string;
  sections: ChapterSection[];
}

export interface CrossChapterLink {
  fromChapter: string;
  toChapter: string;
  bridgeConcept: string;
  targetConcept: string;
  description: string;
}

export interface KnowledgeGraphData {
  id: string;
  title: string;
  subtitle: string;
  sourceDocument: string;
  nodes: Concept[];
  edges: Relationship[];
  chapters: ChapterOutline[];
  crossChapterLinks: CrossChapterLink[];
  stats: {
    totalConcepts: number;
    totalRelationships: number;
    avgConfidence: number;
    sectionsCovered: number;
  };
}

export type AIStage =
  | 'idle'
  | 'reading'
  | 'extracting_concepts'
  | 'discovering_relations'
  | 'building_graph'
  | 'completed';
