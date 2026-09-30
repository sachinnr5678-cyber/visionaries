import urllib.request
import json

prompt = """You are a STEM textbook knowledge graph engineer. Read this textbook chapter excerpt:
\"\"\"
Foundations of Quantum Mechanics — Chapter 3: The Schrödinger Formulation
3.1 The Wavefunction and Born Probability
In non-relativistic quantum mechanics, the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t) belonging to a Hilbert space. According to the Born interpretation, the quantity |Psi(x, t)|^2 represents the probability density of locating the particle at position x at time t. The total probability integrated across all space must equal unity. The principle of quantum superposition establishes that if Psi_1 and Psi_2 are valid quantum states, any linear combination c_1 Psi_1 + c_2 Psi_2 is also a physically realizable quantum state.

3.2 The Time-Dependent Schrödinger Equation
The temporal evolution of the wavefunction is governed by the time-dependent Schrödinger equation: i hbar dPsi/dt = H Psi, where H is the Hamiltonian operator representing the total energy observable. For a non-relativistic particle of mass m in potential V(x), the Hamiltonian operator takes the form H = - (hbar^2 / 2m) d^2/dx^2 + V(x). The spatial derivative operator corresponds to the kinetic energy observable. Stationary states arise when the potential V is time-independent, allowing separation of variables into energy eigenstates satisfying the time-independent Schrödinger eigenvalue problem H psi_n = E_n psi_n.

3.3 Heisenberg Uncertainty Principle & Observables
Physical observables in quantum theory correspond to self-adjoint Hermitian operators acting on the state Hilbert space. The eigenvalues of an observable operator correspond to the allowed measurement outcomes. When two observable operators A and B do not commute, their commutator [A, B] = AB - BA is non-zero. The Robertson-Schrödinger theorem establishes that the product of their measurement uncertainties satisfies sigma_A sigma_B >= (1/2) |<[A, B]>|. For the canonical position operator x and momentum operator p = -i hbar d/dx, the commutator is [x, p] = i hbar, yielding the foundational Heisenberg uncertainty relation sigma_x sigma_p >= hbar / 2.
\"\"\"

Task:
1. Extract 6 to 10 important STEM concepts from this text.
2. Extract the directed relationships between these concepts that are explicitly supported by the text.

Return valid JSON adhering strictly to:
{
  "concepts": [
    {
      "name": "Wavefunction",
      "type": "Definition",
      "description": "Complex-valued function describing the quantum state of a particle in Hilbert space.",
      "importance": 9,
      "highlightedPhrase": "complex-valued wavefunction Psi(x, t)",
      "evidenceQuote": "the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t)"
    }
  ],
  "relationships": [
    {
      "source": "Schrödinger Equation",
      "target": "Wavefunction",
      "relation": "governs",
      "confidence": 0.96,
      "evidenceSentence": "The temporal evolution of the wavefunction is governed by the time-dependent Schrödinger equation"
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
print(raw.get('response'))
