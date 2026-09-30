import urllib.request
import json

prompt = """You are a STEM relationship extractor.
Here are canonical concepts extracted from the textbook:
["Wavefunction", "Born Interpretation", "Hilbert Space", "Quantum Superposition", "Hamiltonian Operator", "Schrodinger Equation"]

Here is the textbook text:
In non-relativistic quantum mechanics, the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t) belonging to a Hilbert space. According to the Born interpretation, the quantity |Psi(x, t)|^2 represents the probability density. The principle of quantum superposition establishes that linear combinations of valid quantum states are also valid states. The temporal evolution of the wavefunction is governed by the time-dependent Schrodinger equation: i hbar dPsi/dt = H Psi, where H is the Hamiltonian operator representing the total energy observable.

Find pairs of concepts from the list that have a direct, meaningful relationship explicitly supported by the textbook text.
Valid relations: "represents", "operates on", "associated with", "contains", "minimizes", "transforms", "computes", "maps", "derived from", "depends on", "applies to", "uses".

Output JSON format:
{
  "relationships": [
    {
      "source": "Schrodinger Equation",
      "target": "Wavefunction",
      "relation": "governs",
      "confidence": 0.96,
      "evidenceSentence": "The temporal evolution of the wavefunction is governed by the time-dependent Schrodinger equation"
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
print("Raw relationships response:")
print(raw.get('response'))
