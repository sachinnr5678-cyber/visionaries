#!/usr/bin/env python3
"""
Real STEM PDF & Document Extraction Service
Extracts pages, text, headings, paragraphs, performs cleaning, detects chapters/sections,
and builds intelligent semantic overlapping chunks with page metadata.
"""

import sys
import os
import re
import json
import pymupdf
import docx

def clean_text(text: str) -> str:
    """
    Remove excessive whitespace and fix broken line breaks.
    Preserves mathematical notations and paragraph structure.
    """
    if not text:
        return ""
    # Fix hyphenated words broken across lines (e.g. 'transfor-\nmation' -> 'transformation')
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    # Replace non-breaking spaces
    text = text.replace('\xa0', ' ')
    # Normalize excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove recurring standalone page numbers (e.g. isolated numbers on a single line)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    # Strip trailing whitespace on lines
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join([l for l in lines if l])

def extract_pdf(file_path: str):
    doc = pymupdf.open(file_path)
    pages_data = []
    
    # Track potential running headers / footers across pages
    first_lines = []
    last_lines = []
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text("text") or ""
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            first_lines.append(lines[0])
            last_lines.append(lines[-1])
            
    # Detect recurring headers and footers (>50% frequency)
    common_headers = {l for l in first_lines if first_lines.count(l) > max(2, len(doc) * 0.4)}
    common_footers = {l for l in last_lines if last_lines.count(l) > max(2, len(doc) * 0.4)}
    
    detected_sections = []
    current_chapter = "Main Content"
    current_section = "General Overview"
    
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        blocks = page.get_text("blocks") or []
        page_num = page_idx + 1
        page_text_pieces = []
        
        for b in blocks:
            # block format: (x0, y0, x1, y1, text, block_no, block_type)
            if len(b) >= 5:
                block_text = b[4].strip()
                if not block_text:
                    continue
                # Skip recurring header/footer
                if block_text in common_headers or block_text in common_footers:
                    continue
                
                # Check for chapter or section pattern
                ch_match = re.match(r'^(Chapter\s+\d+|CHAPTER\s+\d+[:\s\-\.]*.*)', block_text, re.IGNORECASE)
                sec_match = re.match(r'^(\d+\.\d+(\.\d+)?\s+[A-Za-z].*)', block_text)
                
                if ch_match:
                    current_chapter = block_text.split('\n')[0].strip()
                elif sec_match:
                    current_section = block_text.split('\n')[0].strip()
                    detected_sections.append({
                        "id": f"sec_{len(detected_sections)+1}",
                        "title": current_section,
                        "chapter": current_chapter,
                        "page": page_num
                    })
                    
                page_text_pieces.append(block_text)
                
        cleaned_page_text = clean_text('\n\n'.join(page_text_pieces))
        if cleaned_page_text:
            pages_data.append({
                "page": page_num,
                "text": cleaned_page_text,
                "chapter": current_chapter,
                "section": current_section
            })
            
    doc.close()
    return pages_data, detected_sections

def extract_docx(file_path: str):
    doc = docx.Document(file_path)
    pages_data = []
    detected_sections = []
    
    current_chapter = "Document"
    current_section = "Main Content"
    text_buffer = []
    page_approx = 1
    word_count = 0
    
    for para in doc.paragraphs:
        txt = para.text.strip()
        if not txt:
            continue
        if para.style.name.startswith('Heading 1'):
            current_chapter = txt
        elif para.style.name.startswith('Heading'):
            current_section = txt
            detected_sections.append({
                "id": f"sec_{len(detected_sections)+1}",
                "title": current_section,
                "chapter": current_chapter,
                "page": page_approx
            })
            
        text_buffer.append(txt)
        word_count += len(txt.split())
        if word_count > 450:
            pages_data.append({
                "page": page_approx,
                "text": clean_text('\n\n'.join(text_buffer)),
                "chapter": current_chapter,
                "section": current_section
            })
            text_buffer = []
            word_count = 0
            page_approx += 1
            
    if text_buffer:
        pages_data.append({
            "page": page_approx,
            "text": clean_text('\n\n'.join(text_buffer)),
            "chapter": current_chapter,
            "section": current_section
        })
        
    return pages_data, detected_sections

def extract_txt(file_path: str):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        full_text = f.read()
        
    paragraphs = [p.strip() for p in full_text.split('\n\n') if p.strip()]
    pages_data = []
    detected_sections = []
    
    current_chapter = "Document"
    current_section = "Overview"
    buf = []
    words = 0
    page_num = 1
    
    for p in paragraphs:
        if re.match(r'^(Chapter|\d+\.\d+)', p, re.IGNORECASE):
            current_section = p.split('\n')[0]
            detected_sections.append({
                "id": f"sec_{len(detected_sections)+1}",
                "title": current_section,
                "chapter": current_chapter,
                "page": page_num
            })
        buf.append(p)
        words += len(p.split())
        if words > 400:
            pages_data.append({
                "page": page_num,
                "text": clean_text('\n\n'.join(buf)),
                "chapter": current_chapter,
                "section": current_section
            })
            buf = []
            words = 0
            page_num += 1
            
    if buf:
        pages_data.append({
            "page": page_num,
            "text": clean_text('\n\n'.join(buf)),
            "chapter": current_chapter,
            "section": current_section
        })
        
    return pages_data, detected_sections

def create_intelligent_chunks(pages_data, target_words=500, overlap_words=80):
    """
    Creates overlapping semantic chunks preserving chapter, section, and page references.
    """
    chunks = []
    chunk_counter = 1
    
    for page_info in pages_data:
        text = page_info["text"]
        words = text.split()
        if not words:
            continue
            
        i = 0
        while i < len(words):
            chunk_words = words[i:i + target_words]
            chunk_text = " ".join(chunk_words)
            
            chunks.append({
                "chunk_id": f"chunk_{chunk_counter:03d}",
                "text": chunk_text,
                "page_start": page_info["page"],
                "page_end": page_info["page"],
                "chapter": page_info["chapter"],
                "section": page_info["section"]
            })
            chunk_counter += 1
            i += target_words - overlap_words
            if i >= len(words) and len(chunk_words) > 0:
                break
                
    return chunks

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
        
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext == '.pdf':
            pages, sections = extract_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            pages, sections = extract_docx(file_path)
        elif ext in ['.txt', '.md']:
            pages, sections = extract_txt(file_path)
        else:
            print(json.dumps({"error": f"Unsupported file extension: {ext}"}))
            sys.exit(1)
            
        total_words = sum(len(p["text"].split()) for p in pages)
        
        # Check for scanned PDF with no text
        if len(pages) == 0 or total_words < 40:
            print(json.dumps({
                "error": "Insufficient selectable text found in document. If this is a scanned PDF, an OCR text layer is required."
            }))
            sys.exit(1)
            
        chunks = create_intelligent_chunks(pages)
        
        result = {
            "success": True,
            "filename": os.path.basename(file_path),
            "totalPages": len(pages),
            "totalWords": total_words,
            "pages": pages,
            "sections": sections,
            "chunks": chunks
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
