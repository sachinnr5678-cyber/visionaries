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

  // 2. Spatial layout: assign initial positions and run force-directed anti-collision relaxation
  const totalConcepts = canonicalConcepts.length;
  
  // Preliminary node details and category classification
  const nodeDrafts = canonicalConcepts.map((c, index) => {
    const degree = degreeMap.get(c.id) || 0;
    const calculatedImportance = Math.min(
      10,
      Math.max(5, Math.round(5 + c.occurrences * 0.8 + degree * 0.6))
    );
    const primarySection = c.sections[0] || rawSections[0]?.title || 'Core Section';

    // Categorization
    let category: Concept['category'] = 'core-math';
    const lowerName = c.canonical_name.toLowerCase();
    if (lowerName.includes('neural') || lowerName.includes('model') || lowerName.includes('layer')) {
      category = 'deep-learning';
    } else if (lowerName.includes('gradient') || lowerName.includes('loss') || lowerName.includes('opt') || lowerName.includes('adam')) {
      category = 'optimization';
    } else if (lowerName.includes('wave') || lowerName.includes('schrodinger') || lowerName.includes('quantum') || lowerName.includes('energy') || lowerName.includes('uncertainty')) {
      category = 'transforms';
    } else if (lowerName.includes('matrix') || lowerName.includes('transform') || lowerName.includes('eigen') || lowerName.includes('spectral')) {
      category = 'transforms';
    } else if (lowerName.includes('vector') || lowerName.includes('space') || lowerName.includes('operator') || lowerName.includes('norm')) {
      category = 'core-math';
    } else {
      category = 'ml-bridge';
    }

    // Concept type classification
    let validConceptType: ConceptType = 'Definition';
    const rawType = c.type.toLowerCase();
    if (rawType.includes('theorem') || rawType.includes('law') || rawType.includes('principle')) {
      validConceptType = 'Theorem';
    } else if (rawType.includes('algorithm') || rawType.includes('method')) {
      validConceptType = 'Algorithm';
    } else if (rawType.includes('model') || rawType.includes('structure')) {
      validConceptType = 'Model';
    } else if (rawType.includes('function') || rawType.includes('equation') || rawType.includes('wavefunction')) {
      validConceptType = 'Function';
    } else if (rawType.includes('process') || rawType.includes('property')) {
      validConceptType = 'Process';
    } else if (rawType.includes('application')) {
      validConceptType = 'Application';
    }

    const primaryEvidence = c.evidenceSnippets[0] || {
      quote: `Key STEM concept: ${c.canonical_name}`,
      highlightedPhrase: c.canonical_name,
      page: c.pages[0] || 1,
      section: primarySection,
    };

    return {
      c,
      index,
      degree,
      importance: calculatedImportance,
      category,
      type: validConceptType,
      primarySection,
      primaryEvidence,
    };
  });

  // Calculate Initial Positions spread across 360 degrees
  interface Point3D { x: number; y: number; z: number; }
  const positions: Point3D[] = [];

  // Group by category to create natural scientific sectors
  const categoryOrder: Concept['category'][] = ['core-math', 'transforms', 'optimization', 'deep-learning', 'ml-bridge'];
  const categoryGroups = new Map<Concept['category'], typeof nodeDrafts>();
  categoryOrder.forEach((cat) => categoryGroups.set(cat, []));
  nodeDrafts.forEach((nd) => {
    const list = categoryGroups.get(nd.category) || [];
    list.push(nd);
    categoryGroups.set(nd.category, list);
  });

  // Assign distinct sector angles
  let currentAngle = 0;
  nodeDrafts.forEach((nd, i) => {
    // Equidistant angular distribution around 2*PI circle
    const baseAngle = (i / Math.max(1, totalConcepts)) * 2 * Math.PI;
    // Radius staggered by importance and alternating ring
    const ringRadius = 260 + (10 - nd.importance) * 25 + ((i % 3) * 65);
    const x = Math.cos(baseAngle) * ringRadius;
    const y = Math.sin(baseAngle) * ringRadius;
    // 3D Z distributed across [-60, +60]
    const z = Math.sin(baseAngle * 2) * 45 + ((i % 3) - 1) * 25;
    positions.push({ x, y, z });
  });

  // Physical anti-overlap relaxation pass (Fruchterman-Reingold inspired)
  const MIN_SEPARATION = 260; // minimum center-to-center pixels to prevent card overlap
  const iterations = 60;
  for (let iter = 0; iter < iterations; iter++) {
    const forces: { fx: number; fy: number; fz: number }[] = positions.map(() => ({ fx: 0, fy: 0, fz: 0 }));

    // 1. Repulsion between all node pairs (strong anti-overlap)
    for (let i = 0; i < totalConcepts; i++) {
      for (let j = i + 1; j < totalConcepts; j++) {
        let dx = positions[j].x - positions[i].x;
        let dy = positions[j].y - positions[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1e-3) {
          dx = (Math.random() - 0.5) * 10;
          dy = (Math.random() - 0.5) * 10;
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        let repForce = 0;
        if (dist < MIN_SEPARATION) {
          // Hard spring push
          repForce = (MIN_SEPARATION - dist) * 0.7;
        } else {
          // Coulomb repulsion
          repForce = (280 * 280) / (dist * dist) * 15;
        }

        const pushX = (dx / dist) * repForce;
        const pushY = (dy / dist) * repForce;
        forces[i].fx -= pushX;
        forces[i].fy -= pushY;
        forces[j].fx += pushX;
        forces[j].fy += pushY;

        // 3D Z separation
        const dz = positions[j].z - positions[i].z;
        if (Math.abs(dz) < 25) {
          const pushZ = (25 - Math.abs(dz)) * 0.3 * (dz >= 0 ? 1 : -1);
          forces[i].fz -= pushZ;
          forces[j].fz += pushZ;
        }
      }
    }

    // 2. Spring attraction along relationships
    for (const rel of rawRelationships) {
      const idxA = canonicalConcepts.findIndex((c) => c.id === rel.source);
      const idxB = canonicalConcepts.findIndex((c) => c.id === rel.target);
      if (idxA !== -1 && idxB !== -1 && idxA !== idxB) {
        const dx = positions[idxB].x - positions[idxA].x;
        const dy = positions[idxB].y - positions[idxA].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 340) {
          const pull = (dist - 340) * 0.05;
          const pullX = (dx / dist) * pull;
          const pullY = (dy / dist) * pull;
          forces[idxA].fx += pullX;
          forces[idxA].fy += pullY;
          forces[idxB].fx -= pullX;
          forces[idxB].fy -= pullY;
        }
      }
    }

    // 3. Centering gravity towards (0, 0)
    for (let i = 0; i < totalConcepts; i++) {
      forces[i].fx -= positions[i].x * 0.015;
      forces[i].fy -= positions[i].y * 0.015;
    }

    // 4. Apply forces with temperature damping
    const temp = Math.max(0.1, 1 - iter / iterations);
    for (let i = 0; i < totalConcepts; i++) {
      positions[i].x += Math.max(-50, Math.min(50, forces[i].fx * temp));
      positions[i].y += Math.max(-50, Math.min(50, forces[i].fy * temp));
      positions[i].z += Math.max(-20, Math.min(20, forces[i].fz * temp));
      // Clamp bounds
      positions[i].x = Math.max(-680, Math.min(680, positions[i].x));
      positions[i].y = Math.max(-480, Math.min(480, positions[i].y));
      positions[i].z = Math.max(-80, Math.min(80, positions[i].z));
    }
  }

  // Construct finalized Concept objects
  const nodes: Concept[] = nodeDrafts.map((nd, idx) => {
    const pos = positions[idx];
    return {
      id: nd.c.id,
      label: nd.c.canonical_name,
      type: nd.type,
      description: nd.c.description,
      whyItMatters: nd.c.whyItMatters,
      importance: nd.importance,
      section: nd.primarySection,
      chapter: rawSections[0]?.chapter || 'Chapter 1',
      category: nd.category,
      evidence: {
        quote: nd.primaryEvidence.quote,
        highlightedPhrase: nd.primaryEvidence.highlightedPhrase,
        chapter: rawSections[0]?.chapter || 'Chapter 1',
        section: nd.primarySection,
        pageNumber: nd.primaryEvidence.page,
        confidence: 0.95,
      },
      prerequisites: [],
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      z: Math.round(pos.z),
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
