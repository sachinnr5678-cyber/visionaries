import { CanonicalConcept, RawExtractedRelationship } from './aiProvider';
import {
  Concept,
  Relationship,
  KnowledgeGraphData,
  ConceptType,
  RelationType,
  ChapterOutline,
} from '@/types/graph';

interface RawSection {
  id: string;
  title: string;
  chapter: string;
  page: number;
}

export function buildDynamicKnowledgeGraph(
  documentTitle: string,
  canonicalConcepts: CanonicalConcept[],
  rawRelationships: RawExtractedRelationship[],
  rawSections: RawSection[],
  totalPages: number
): KnowledgeGraphData {
  // 1. Calculate degree for each concept
  const degreeMap = new Map<string, number>();
  canonicalConcepts.forEach((c) => degreeMap.set(c.id, 0));

  rawRelationships.forEach((r) => {
    degreeMap.set(r.source, (degreeMap.get(r.source) || 0) + 1);
    degreeMap.set(r.target, (degreeMap.get(r.target) || 0) + 1);
  });

  // 2. Spatial layout: assign cluster positions based on section and importance
  const sectionAngleMap = new Map<string, number>();
  const uniqueSections = Array.from(new Set(rawSections.map((s) => s.title)));
  uniqueSections.forEach((sec, idx) => {
    sectionAngleMap.set(sec, (idx / Math.max(1, uniqueSections.length)) * 2 * Math.PI);
  });

  const nodes: Concept[] = canonicalConcepts.map((c, index) => {
    const degree = degreeMap.get(c.id) || 0;
    // Normalized importance: 5 to 10
    const calculatedImportance = Math.min(
      10,
      Math.max(5, Math.round(5 + c.occurrences * 0.8 + degree * 0.6))
    );

    const primarySection = c.sections[0] || 'Core Section';
    const angle =
      (sectionAngleMap.get(primarySection) || 0) +
      ((index % 3) - 1) * 0.35 +
      (Math.random() - 0.5) * 0.15;

    // Radius from center inversely proportional to importance
    const radius2D = 180 + (10 - calculatedImportance) * 35;
    const x2D = Math.cos(angle) * radius2D;
    const y2D = Math.sin(angle) * radius2D;

    const z3D = ((index % 5) - 2) * 20;

    // Evidence
    const primaryEvidence = c.evidenceSnippets[0] || {
      quote: `Key STEM concept: ${c.canonical_name}`,
      highlightedPhrase: c.canonical_name,
      page: c.pages[0] || 1,
      section: primarySection,
    };

    // Category mapping
    let category: Concept['category'] = 'core-math';
    const lowerName = c.canonical_name.toLowerCase();
    if (lowerName.includes('neural') || lowerName.includes('model') || lowerName.includes('layer')) {
      category = 'deep-learning';
    } else if (lowerName.includes('gradient') || lowerName.includes('loss') || lowerName.includes('opt')) {
      category = 'optimization';
    } else if (lowerName.includes('wave') || lowerName.includes('schrodinger') || lowerName.includes('quantum') || lowerName.includes('energy')) {
      category = 'transforms';
    } else if (lowerName.includes('matrix') || lowerName.includes('transform') || lowerName.includes('eigen')) {
      category = 'transforms';
    } else if (lowerName.includes('vector') || lowerName.includes('space') || lowerName.includes('operator')) {
      category = 'core-math';
    } else {
      category = 'ml-bridge';
    }

    // Type classification
    let validConceptType: ConceptType = 'Definition';
    const rawType = c.type.toLowerCase();
    if (rawType.includes('theorem') || rawType.includes('law') || rawType.includes('principle')) {
      validConceptType = 'Theorem';
    } else if (rawType.includes('algorithm') || rawType.includes('method')) {
      validConceptType = 'Algorithm';
    } else if (rawType.includes('model') || rawType.includes('structure')) {
      validConceptType = 'Model';
    } else if (rawType.includes('function') || rawType.includes('equation')) {
      validConceptType = 'Function';
    } else if (rawType.includes('process') || rawType.includes('property')) {
      validConceptType = 'Process';
    } else if (rawType.includes('application')) {
      validConceptType = 'Application';
    }

    return {
      id: c.id,
      label: c.canonical_name,
      type: validConceptType,
      description: c.description,
      whyItMatters: c.whyItMatters,
      importance: calculatedImportance,
      section: primarySection,
      chapter: rawSections[0]?.chapter || 'Chapter 1',
      category,
      evidence: {
        quote: primaryEvidence.quote,
        highlightedPhrase: primaryEvidence.highlightedPhrase,
        chapter: rawSections[0]?.chapter || 'Chapter 1',
        section: primarySection,
        pageNumber: primaryEvidence.page,
        confidence: 0.94,
      },
      prerequisites: [],
      x: x2D,
      y: y2D,
      z: z3D,
    };
  });

  // 3. Map relationships
  const edges: Relationship[] = rawRelationships.map((r, idx) => {
    let validRelation: RelationType = 'related to' as any;
    const relLower = r.relation.toLowerCase();
    if (relLower.includes('represent')) validRelation = 'represents';
    else if (relLower.includes('operat')) validRelation = 'operates on';
    else if (relLower.includes('associat')) validRelation = 'associated with';
    else if (relLower.includes('contain') || relLower.includes('part_of')) validRelation = 'contains';
    else if (relLower.includes('minimiz')) validRelation = 'minimizes';
    else if (relLower.includes('optimi')) validRelation = 'optimizes';
    else if (relLower.includes('transform')) validRelation = 'transforms';
    else if (relLower.includes('comput')) validRelation = 'computes';
    else if (relLower.includes('map')) validRelation = 'maps';
    else if (relLower.includes('deriv')) validRelation = 'derived from';
    else if (relLower.includes('depend')) validRelation = 'depends on';
    else if (relLower.includes('appl')) validRelation = 'applies to';
    else if (relLower.includes('use')) validRelation = 'uses';

    return {
      id: `rel_${idx + 1}`,
      source: r.source,
      target: r.target,
      relation: validRelation,
      confidence: r.confidence,
      evidence: r.evidence,
      section: r.section,
      chapter: r.chapter,
      category: 'operation',
    };
  });

  // 4. Group Sections into Chapter Outline
  const chaptersMap = new Map<string, ChapterOutline>();
  rawSections.forEach((s) => {
    const chName = s.chapter || 'Main Chapter';
    if (!chaptersMap.has(chName)) {
      chaptersMap.set(chName, {
        id: `ch_${chaptersMap.size + 1}`,
        title: chName,
        subtitle: `Extracted from pages 1 to ${totalPages}`,
        sections: [],
      });
    }

    const matchedNodeIds = nodes
      .filter((n) => n.section.toLowerCase() === s.title.toLowerCase())
      .map((n) => n.id);

    chaptersMap.get(chName)!.sections.push({
      id: s.id,
      code: s.title.match(/^\d+(\.\d+)+/)?.[0] || `${chaptersMap.get(chName)!.sections.length + 1}`,
      title: s.title,
      conceptIds: matchedNodeIds,
      readingExcerpt: `Curriculum section covering ${matchedNodeIds.length} identified concepts.`,
      pageNumber: s.page,
    });
  });

  const chapters = Array.from(chaptersMap.values());
  if (chapters.length === 0) {
    chapters.push({
      id: 'ch_1',
      title: 'Document Sections',
      subtitle: `Analyzed ${totalPages} pages`,
      sections: [
        {
          id: 'sec_1',
          code: '1.0',
          title: 'Document Content',
          conceptIds: nodes.map((n) => n.id),
          readingExcerpt: 'Extracted textbook concepts.',
          pageNumber: 1,
        },
      ],
    });
  }

  return {
    id: `map_${Date.now()}`,
    title: documentTitle.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    subtitle: `AI-synthesized from ${totalPages} pages (${nodes.length} concepts, ${edges.length} relationships)`,
    sourceDocument: documentTitle,
    nodes,
    edges,
    chapters,
    crossChapterLinks: [],
    stats: {
      totalConcepts: nodes.length,
      totalRelationships: edges.length,
      avgConfidence: 0.94,
      sectionsCovered: rawSections.length || 1,
    },
  };
}
