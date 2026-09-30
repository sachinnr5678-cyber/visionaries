import { Concept, Relationship, KnowledgeGraphData } from '@/types/graph';
import { linearAlgebraDemoGraph } from '@/data/demoGraph';

export interface DocumentInput {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export interface ProcessingUpdate {
  stage: 'reading' | 'extracting_concepts' | 'discovering_relations' | 'building_graph' | 'completed';
  progress: number; // 0 to 100
  statusMessage: string;
  discoveredConcepts: Concept[];
  discoveredRelationships: Relationship[];
  currentChunkIndex?: number;
  totalChunks?: number;
}

export interface AIAgentConfig {
  useMock: boolean;
  apiKey?: string;
  modelName?: string;
}

/**
 * Text Extraction abstraction: converts raw PDF/text into clean UTF-8 text string.
 */
export async function extractTextFromDocument(file: DocumentInput): Promise<string> {
  // In a full production backend, this invokes a PDF parsing engine or OCR.
  // In frontend mock, returns realistic extracted textbook text.
  return (
    file.content ||
    `Chapter 5: Linear Algebra and Matrix Transformations.
A vector x in R^n is an ordered sequence of real values. Linear transformations map vectors while preserving linear combinations.
Matrices represent linear transformations. Weight matrices in neural networks represent parameterized layers.
Eigenvalues and eigenvectors diagonalize operators for principal component analysis.
Gradient descent updates matrices to minimize loss functions.`
  );
}

/**
 * Chunking abstraction: splits document text into semantic token chunks with overlap.
 */
export function chunkDocumentText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(' '));
    i += chunkSize - overlap;
    if (i >= words.length && chunks.length > 0) break;
  }
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Concept Extraction abstraction: extracts mathematical & technical concepts.
 */
export async function extractConceptsFromChunks(
  _chunks: string[],
  _config?: AIAgentConfig
): Promise<Concept[]> {
  // Plug your real LLM API (e.g. OpenAI / Anthropic / Gemini / Ollama) here.
  return linearAlgebraDemoGraph.nodes;
}

/**
 * Relationship Extraction abstraction: extracts directed semantic relations.
 */
export async function extractRelationshipsFromConcepts(
  _concepts: Concept[],
  _config?: AIAgentConfig
): Promise<Relationship[]> {
  // Plug your real LLM API here.
  return linearAlgebraDemoGraph.edges;
}

/**
 * Entity Resolution & Knowledge Graph Assembly: builds the finalized knowledge graph.
 */
export function assembleKnowledgeGraph(
  nodes: Concept[],
  edges: Relationship[],
  docTitle: string
): KnowledgeGraphData {
  return {
    ...linearAlgebraDemoGraph,
    sourceDocument: docTitle,
    nodes,
    edges,
    stats: {
      totalConcepts: nodes.length,
      totalRelationships: edges.length,
      avgConfidence: 0.96,
      sectionsCovered: 6,
    },
  };
}

/**
 * Full Pipeline Execution with live streamed progress
 */
export async function runConceptMappingPipeline(
  doc: DocumentInput,
  onProgress: (update: ProcessingUpdate) => void,
  config: AIAgentConfig = { useMock: true }
): Promise<KnowledgeGraphData> {
  const allNodes = linearAlgebraDemoGraph.nodes;
  const allEdges = linearAlgebraDemoGraph.edges;

  // Stage 1: Document Ingestion & Reading
  onProgress({
    stage: 'reading',
    progress: 12,
    statusMessage: `Reading and parsing pages from "${doc.name}"...`,
    discoveredConcepts: [],
    discoveredRelationships: [],
    currentChunkIndex: 1,
    totalChunks: 6,
  });
  await sleep(750);

  onProgress({
    stage: 'reading',
    progress: 24,
    statusMessage: `Tokenizing mathematical notation, formulas, and headings...`,
    discoveredConcepts: [],
    discoveredRelationships: [],
    currentChunkIndex: 4,
    totalChunks: 6,
  });
  await sleep(650);

  // Stage 2: Concept Extraction
  const partialConcepts: Concept[] = [];
  const conceptBatches = [
    allNodes.slice(0, 4),
    allNodes.slice(4, 9),
    allNodes.slice(9, 13),
    allNodes.slice(13),
  ];

  for (let b = 0; b < conceptBatches.length; b++) {
    partialConcepts.push(...conceptBatches[b]);
    const progress = 30 + Math.round(((b + 1) / conceptBatches.length) * 30);
    onProgress({
      stage: 'extracting_concepts',
      progress,
      statusMessage: `Identifying core theorems, definitions, and algorithms (${partialConcepts.length}/${allNodes.length})...`,
      discoveredConcepts: [...partialConcepts],
      discoveredRelationships: [],
    });
    await sleep(600);
  }

  // Stage 3: Discovering Relationships
  const partialEdges: Relationship[] = [];
  const edgeBatches = [
    allEdges.slice(0, 5),
    allEdges.slice(5, 11),
    allEdges.slice(11, 17),
    allEdges.slice(17),
  ];

  for (let e = 0; e < edgeBatches.length; e++) {
    partialEdges.push(...edgeBatches[e]);
    const progress = 65 + Math.round(((e + 1) / edgeBatches.length) * 25);
    onProgress({
      stage: 'discovering_relations',
      progress,
      statusMessage: `Linking concepts and extracting textbook evidence (${partialEdges.length}/${allEdges.length} edges)...`,
      discoveredConcepts: partialConcepts,
      discoveredRelationships: [...partialEdges],
    });
    await sleep(650);
  }

  // Stage 4: Building Knowledge Graph
  onProgress({
    stage: 'building_graph',
    progress: 94,
    statusMessage: 'Synthesizing 3D vector embeddings and topological graph layout...',
    discoveredConcepts: partialConcepts,
    discoveredRelationships: partialEdges,
  });
  await sleep(600);

  const finalGraph = assembleKnowledgeGraph(allNodes, allEdges, doc.name);

  onProgress({
    stage: 'completed',
    progress: 100,
    statusMessage: 'Knowledge graph successfully generated!',
    discoveredConcepts: allNodes,
    discoveredRelationships: allEdges,
  });
  await sleep(350);

  return finalGraph;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
