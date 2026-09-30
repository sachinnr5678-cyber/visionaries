import os
import pymupdf

def create_stem_pdf(filename, title, chapter, sections_content):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = pymupdf.open()
    
    for page_idx, (sec_title, paragraphs) in enumerate(sections_content):
        page = doc.new_page(width=595, height=842) # A4
        # Header
        page.insert_text(pymupdf.Point(50, 45), f"{title} — {chapter}", fontsize=9, color=(0.4, 0.4, 0.5))
        page.insert_text(pymupdf.Point(520, 45), f"Page {page_idx + 1}", fontsize=9, color=(0.4, 0.4, 0.5))
        page.draw_line(pymupdf.Point(50, 52), pymupdf.Point(545, 52), color=(0.7, 0.7, 0.8), width=0.5)
        
        # Section Heading
        page.insert_text(pymupdf.Point(50, 85), sec_title, fontsize=16, fontname="helv", color=(0.1, 0.1, 0.3))
        
        y = 120
        for p in paragraphs:
            # Wrap text roughly
            rect = pymupdf.Rect(50, y, 545, y + 120)
            page.insert_textbox(rect, p, fontsize=11, fontname="times-roman", lineheight=1.4, color=(0.15, 0.15, 0.15))
            y += 110
            
    doc.save(filename)
    doc.close()
    print(f"Generated {filename} with {len(sections_content)} pages.")

# 1. Linear Algebra PDF
create_stem_pdf(
    "public/samples/Linear_Algebra_Spectral_Theory_Ch5.pdf",
    "Principles of Modern Linear Algebra",
    "Chapter 5: Spectral Theory and Eigenvalues",
    [
        (
            "5.1 Eigenvalues and Characteristic Polynomials",
            [
                "An eigenvalue of a linear transformation represented by a square matrix A is a scalar lambda such that there exists a non-zero vector x satisfying the fundamental equation Ax = lambda x. The vector x is termed an eigenvector corresponding to lambda.",
                "To determine the eigenvalues, we rewrite the matrix equation as (A - lambda I)x = 0. Non-trivial solutions exist if and only if the determinant det(A - lambda I) vanishes. This scalar equation defines the characteristic polynomial of degree n.",
                "In geometric terms, an eigenvector points in an invariant direction that undergoes simple dilation under the linear transformation, with the dilation factor given precisely by the associated eigenvalue."
            ]
        ),
        (
            "5.2 Orthogonal Diagonalization & Symmetric Matrices",
            [
                "A matrix S is symmetric if S equals its transpose S^T. The Spectral Theorem guarantees that every real symmetric matrix has exclusively real eigenvalues and possesses an orthonormal basis of eigenvectors.",
                "Consequently, any real symmetric matrix S can be decomposed as S = Q Lambda Q^T, where Q is an orthogonal matrix whose columns are the normalized eigenvectors, and Lambda is a diagonal matrix containing the eigenvalues.",
                "This spectral decomposition is of paramount importance in principal component analysis (PCA), where data covariance matrices are diagonalized to extract principal axes of variance."
            ]
        ),
        (
            "5.3 Singular Value Decomposition (SVD)",
            [
                "Singular Value Decomposition generalizes spectral diagonalization to arbitrary rectangular m x n matrices. For any real matrix A, there exist orthogonal matrices U and V such that A = U Sigma V^T.",
                "The singular values sigma_i along the diagonal of Sigma are the square roots of the eigenvalues of A^T A. They measure the geometric stretch along the principal semi-axes of the transformed unit sphere.",
                "SVD directly powers pseudoinverse computation, low-rank matrix approximation via the Eckart-Young-Mirsky theorem, and latent semantic indexing in computational linguistics."
            ]
        )
    ]
)

# 2. Quantum Physics PDF
create_stem_pdf(
    "public/samples/Quantum_Mechanics_Wavefunctions_Ch3.pdf",
    "Foundations of Quantum Mechanics",
    "Chapter 3: The Schrödinger Formulation",
    [
        (
            "3.1 The Wavefunction and Born Probability",
            [
                "In non-relativistic quantum mechanics, the physical state of a particle is completely described by a complex-valued wavefunction Psi(x, t) belonging to a Hilbert space.",
                "According to the Born interpretation, the quantity |Psi(x, t)|^2 represents the probability density of locating the particle at position x at time t. The total probability integrated across all space must equal unity.",
                "The principle of quantum superposition establishes that if Psi_1 and Psi_2 are valid quantum states, any linear combination c_1 Psi_1 + c_2 Psi_2 is also a physically realizable quantum state."
            ]
        ),
        (
            "3.2 The Time-Dependent Schrödinger Equation",
            [
                "The temporal evolution of the wavefunction is governed by the time-dependent Schrödinger equation: i hbar dPsi/dt = H Psi, where H is the Hamiltonian operator representing the total energy observable.",
                "For a non-relativistic particle of mass m in potential V(x), the Hamiltonian operator takes the form H = - (hbar^2 / 2m) d^2/dx^2 + V(x). The spatial derivative operator corresponds to the kinetic energy observable.",
                "Stationary states arise when the potential V is time-independent, allowing separation of variables into energy eigenstates satisfying the time-independent Schrödinger eigenvalue problem H psi_n = E_n psi_n."
            ]
        ),
        (
            "3.3 Heisenberg Uncertainty Principle & Observables",
            [
                "Physical observables in quantum theory correspond to self-adjoint Hermitian operators acting on the state Hilbert space. The eigenvalues of an observable operator correspond to the allowed measurement outcomes.",
                "When two observable operators A and B do not commute, their commutator [A, B] = AB - BA is non-zero. The Robertson-Schrödinger theorem establishes that the product of their measurement uncertainties satisfies sigma_A sigma_B >= (1/2) |<[A, B]>|.",
                "For the canonical position operator x and momentum operator p = -i hbar d/dx, the commutator is [x, p] = i hbar, yielding the foundational Heisenberg uncertainty relation sigma_x sigma_p >= hbar / 2."
            ]
        )
    ]
)

# 3. Machine Learning Optimization PDF
create_stem_pdf(
    "public/samples/Machine_Learning_Optimization_Ch8.pdf",
    "Deep Learning and Computational Optimization",
    "Chapter 8: Numerical Optimization for Neural Networks",
    [
        (
            "8.1 Objective Functions and Empirical Risk",
            [
                "Supervised learning algorithms formulate training as minimizing an empirical risk loss function L(theta) evaluated over a finite dataset of training examples.",
                "The loss function measures the discrepancy between model predictions and true targets, common examples being mean squared error for regression and cross-entropy loss for classification tasks.",
                "Because deep neural networks are non-linear parameterizations, the loss surface is non-convex, characterized by saddle points, ravines, and local minima in million-dimensional parameter spaces."
            ]
        ),
        (
            "8.2 Gradient Descent and Learning Rates",
            [
                "Gradient descent minimizes the objective function by taking iterative steps in the direction of steepest descent, defined by the negative gradient vector -grad L(theta).",
                "The parameter update equation is theta_{t+1} = theta_t - eta grad L(theta_t), where eta is the learning rate hyperparameter governing step magnitude.",
                "Selecting an optimal learning rate is critical: an excessively large learning rate causes divergence and numerical instability, whereas an overly small learning rate leads to glacial convergence."
            ]
        ),
        (
            "8.3 Stochastic Gradient Descent and Adam Optimizer",
            [
                "Stochastic Gradient Descent (SGD) computes the gradient over a mini-batch of examples rather than the entire dataset, drastically reducing computational overhead per update and introducing helpful regularization noise.",
                "To accelerate convergence in ill-conditioned ravines, momentum methods accumulate an exponentially decaying moving average of past gradients to maintain directional velocity.",
                "The Adam optimizer combines momentum with adaptive learning rates by maintaining estimates of both first and second raw moments of the gradients, scaling updates inversely with gradient variance."
            ]
        )
    ]
)
