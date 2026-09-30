import urllib.request
import json

prompt = """You are a STEM knowledge extractor. Read this text:
In non-relativistic quantum mechanics, the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t) belonging to a Hilbert space. According to the Born interpretation, the quantity |Psi(x, t)|^2 represents the probability density of locating the particle at position x at time t. The total probability integrated across all space must equal unity. The principle of quantum superposition establishes that if Psi_1 and Psi_2 are valid quantum states, any linear combination is also a physically realizable quantum state.

Identify important STEM concepts. Return valid JSON adhering strictly to:
{
  "concepts": [
    {
      "name": "Wavefunction",
      "type": "Definition",
      "description": "A complex-valued function describing the quantum state of a particle",
      "importance": 9,
      "highlightedPhrase": "complex-valued wavefunction Psi(x, t)",
      "evidenceQuote": "the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t)"
    }
  ]
}"""

data = json.dumps({
    'model': 'llama3.1:latest',
    'prompt': prompt,
    'format': 'json',
    'stream': False
}).encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:11434/api/generate',
    data=data,
    headers={'Content-Type': 'application/json'}
)

resp = urllib.request.urlopen(req)
raw = json.loads(resp.read())
print("Raw response from Ollama:")
print(raw.get('response'))
