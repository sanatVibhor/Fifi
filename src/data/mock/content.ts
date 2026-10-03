import type { Domain, Note, Question, Resource, User } from '../../types';
import { daysAgo, todayKey } from '../../lib/utils';

export const user: User = {
  id: 'user_sanat',
  name: 'Sanat Vibhor',
  firstName: 'Sanat',
  headline: 'Data Science Preparation',
  streak: 12,
  activity: Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }),
};

export const domains: Domain[] = [
  {
    id: 'stats-math',
    slug: 'statistics-mathematics',
    index: '01',
    name: 'Statistics & Mathematics',
    tagline: 'Build the mathematical foundation behind your models.',
    description: 'From probability fundamentals to optimization and statistical reasoning.',
    icon: 'sigma',
  },
  {
    id: 'machine-learning',
    slug: 'machine-learning',
    index: '02',
    name: 'Machine Learning',
    tagline: 'Understand algorithms beyond simply knowing how to use them.',
    description: 'Classical algorithms, model evaluation and the craft of building models that generalise.',
    icon: 'cpu',
  },
  {
    id: 'rag-genai',
    slug: 'rag-genai',
    index: '03',
    name: 'RAG & GenAI',
    tagline: 'Master modern retrieval and LLM systems.',
    description: 'Retrieval, evaluation, LLMs and agents — the stack behind modern AI products.',
    icon: 'network',
  },
];

export const resources: Resource[] = [
  {
    id: 'res_01', topicId: 'probability', type: 'ChatGPT',
    title: 'Conditional Probability — intuition with trees and tables',
    url: 'https://chatgpt.com/c/68a1f3c2-7d44-8321-9b6e-2f5c1a7e90d1',
    description: 'Walked through the medical-test example until the base-rate fallacy finally clicked.',
    tags: ['conditional', 'bayes'], addedAt: daysAgo(2),
  },
  {
    id: 'res_02', topicId: 'probability', type: 'YouTube',
    title: "Bayes' theorem, the geometry of changing beliefs — 3Blue1Brown",
    url: 'https://www.youtube.com/watch?v=HZGCoVF3YvM',
    description: 'Best visual explanation of updating on evidence.',
    tags: ['bayes', 'intuition'], addedAt: daysAgo(9),
  },
  {
    id: 'res_03', topicId: 'probability', type: 'Course',
    title: 'Khan Academy — Statistics & Probability',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    description: 'Good for drilling counting, independence and conditional probability problems.',
    tags: ['practice'], addedAt: daysAgo(20),
  },
  {
    id: 'res_04', topicId: 'probability', type: 'Documentation',
    title: 'Seeing Theory — a visual introduction to probability',
    url: 'https://seeing-theory.brown.edu/basic-probability/index.html',
    description: 'Interactive simulations for basic probability and the law of large numbers.',
    tags: ['visual', 'simulation'], addedAt: daysAgo(14),
  },
  {
    id: 'res_05', topicId: 'central-limit-theorem', type: 'YouTube',
    title: 'But what is the Central Limit Theorem? — 3Blue1Brown',
    url: 'https://www.youtube.com/watch?v=zeJD6dqJ5lo',
    description: 'Builds the CLT from convolutions of distributions.',
    tags: ['clt', 'visual'], addedAt: daysAgo(4),
  },
  {
    id: 'res_06', topicId: 'covariance', type: 'ChatGPT',
    title: "Why zero covariance doesn't imply independence",
    url: 'https://chatgpt.com/c/68a0b1d9-3f10-8329-a1c4-6b0e2d9f4c33',
    description: 'Counter-example with Y = X² and symmetric X.',
    tags: ['independence', 'covariance'], addedAt: daysAgo(16),
  },
  {
    id: 'res_07', topicId: 'hypothesis-testing', type: 'Article',
    title: 'A Dirty Dozen: Twelve P-Value Misconceptions',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18582619/',
    description: 'Reference list of what a p-value is not.',
    tags: ['p-value'], addedAt: daysAgo(5),
  },
  {
    id: 'res_08', topicId: 'linear-algebra', type: 'YouTube',
    title: 'Essence of Linear Algebra — 3Blue1Brown',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    description: 'Geometric view of transformations, determinants and eigenvectors.',
    tags: ['geometry'], addedAt: daysAgo(12),
  },
  {
    id: 'res_09', topicId: 'eigenvalues-eigenvectors', type: 'ChatGPT',
    title: 'Eigenvectors as invariant directions — worked examples',
    url: 'https://chatgpt.com/c/689f9a77-b2c0-8325-8e1a-0d5f33c8ab12',
    description: 'Compared 2×2 shear, rotation and scaling matrices.',
    tags: ['eigen', 'examples'], addedAt: daysAgo(14),
  },
  {
    id: 'res_10', topicId: 'convex-optimization', type: 'Course',
    title: 'Convex Optimization — Boyd & Vandenberghe (free book)',
    url: 'https://web.stanford.edu/~boyd/cvxbook/',
    description: 'The canonical reference; start with chapters 2–4.',
    tags: ['textbook'], addedAt: daysAgo(30),
  },
  {
    id: 'res_11', topicId: 'linear-regression', type: 'Documentation',
    title: 'scikit-learn: Linear Models',
    url: 'https://scikit-learn.org/stable/modules/linear_model.html',
    description: 'OLS, Ridge, Lasso and friends with API notes.',
    tags: ['sklearn'], addedAt: daysAgo(35),
  },
  {
    id: 'res_12', topicId: 'decision-trees', type: 'Documentation',
    title: 'scikit-learn: Decision Trees',
    url: 'https://scikit-learn.org/stable/modules/tree.html',
    description: 'Impurity criteria, pruning and tips for practical use.',
    tags: ['sklearn', 'trees'], addedAt: daysAgo(3),
  },
  {
    id: 'res_13', topicId: 'decision-trees', type: 'ChatGPT',
    title: 'Gini vs Entropy — when does it actually matter?',
    url: 'https://chatgpt.com/c/68a2c4f1-1a88-832c-b7de-4f9a1c6e5d02',
    description: 'Short answer: rarely. Notes on computational cost and edge cases.',
    tags: ['impurity'], addedAt: daysAgo(2),
  },
  {
    id: 'res_14', topicId: 'gradient-boosting', type: 'Paper',
    title: 'Greedy Function Approximation: A Gradient Boosting Machine',
    url: 'https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full',
    description: "Friedman's original paper.",
    tags: ['boosting', 'paper'], addedAt: daysAgo(8),
  },
  {
    id: 'res_15', topicId: 'xgboost', type: 'Documentation',
    title: 'XGBoost documentation — Introduction to Boosted Trees',
    url: 'https://xgboost.readthedocs.io/en/stable/tutorials/model.html',
    description: 'Derivation of the regularised objective.',
    tags: ['xgboost'], addedAt: daysAgo(6),
  },
  {
    id: 'res_16', topicId: 'bias-variance', type: 'Article',
    title: 'Understanding the Bias-Variance Tradeoff — Scott Fortmann-Roe',
    url: 'http://scott.fortmann-roe.com/docs/BiasVariance.html',
    description: 'Clear diagrams and the formal decomposition.',
    tags: ['tradeoff'], addedAt: daysAgo(13),
  },
  {
    id: 'res_17', topicId: 'cross-validation', type: 'Documentation',
    title: 'scikit-learn: Cross-validation',
    url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
    description: 'Splitters for iid, grouped and time-series data.',
    tags: ['sklearn'], addedAt: daysAgo(5),
  },
  {
    id: 'res_18', topicId: 'embeddings', type: 'Article',
    title: 'The Illustrated Word2vec — Jay Alammar',
    url: 'https://jalammar.github.io/illustrated-word2vec/',
    description: 'Visual intro to learning embeddings from context.',
    tags: ['word2vec'], addedAt: daysAgo(30),
  },
  {
    id: 'res_19', topicId: 'ann', type: 'Paper',
    title: 'Efficient and robust approximate nearest neighbor search using HNSW',
    url: 'https://arxiv.org/abs/1603.09320',
    description: 'The HNSW paper — navigable small-world graphs.',
    tags: ['hnsw', 'paper'], addedAt: daysAgo(24),
  },
  {
    id: 'res_20', topicId: 'dense-retrieval', type: 'Paper',
    title: 'Dense Passage Retrieval for Open-Domain Question Answering',
    url: 'https://arxiv.org/abs/2004.04906',
    description: 'DPR: dual-encoder retrieval trained with in-batch negatives.',
    tags: ['dpr', 'paper'], addedAt: daysAgo(15),
  },
  {
    id: 'res_21', topicId: 'bm25', type: 'Article',
    title: 'The Probabilistic Relevance Framework: BM25 and Beyond',
    url: 'https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf',
    description: 'Robertson & Zaragoza overview of the theory behind BM25.',
    tags: ['bm25', 'paper'], addedAt: daysAgo(28),
  },
  {
    id: 'res_22', topicId: 'hybrid-search', type: 'ChatGPT',
    title: 'Reciprocal Rank Fusion vs weighted score fusion',
    url: 'https://chatgpt.com/c/68a1d0aa-5e21-832f-9c4d-8a3f7e12b9c0',
    description: 'Why RRF avoids score normalisation problems.',
    tags: ['rrf', 'fusion'], addedAt: daysAgo(10),
  },
  {
    id: 'res_23', topicId: 'chunking', type: 'Article',
    title: 'Chunking Strategies for LLM Applications',
    url: 'https://www.pinecone.io/learn/chunking-strategies/',
    description: 'Fixed, recursive and semantic chunking with trade-offs.',
    tags: ['chunking'], addedAt: daysAgo(9),
  },
  {
    id: 'res_24', topicId: 'reranking', type: 'Documentation',
    title: 'Sentence-Transformers: Cross-Encoders',
    url: 'https://www.sbert.net/examples/applications/cross-encoder/README.html',
    description: 'Retrieve & re-rank pipeline reference.',
    tags: ['cross-encoder'], addedAt: daysAgo(4),
  },
  {
    id: 'res_25', topicId: 'rag-evaluation', type: 'Documentation',
    title: 'Ragas — metrics for RAG evaluation',
    url: 'https://docs.ragas.io/en/stable/concepts/metrics/',
    description: 'Faithfulness, answer relevancy, context precision and recall.',
    tags: ['ragas', 'eval'], addedAt: daysAgo(8),
  },
  {
    id: 'res_26', topicId: 'fine-tuning-vs-rag', type: 'Paper',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    url: 'https://arxiv.org/abs/2005.11401',
    description: 'The original RAG paper from Lewis et al.',
    tags: ['rag', 'paper'], addedAt: daysAgo(7),
  },
  {
    id: 'res_27', topicId: 'agents', type: 'Paper',
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    url: 'https://arxiv.org/abs/2210.03629',
    description: 'Interleaving reasoning traces with tool actions.',
    tags: ['react', 'agents'], addedAt: daysAgo(3),
  },
  {
    id: 'res_28', topicId: 'mcp', type: 'Documentation',
    title: 'Model Context Protocol — Introduction',
    url: 'https://modelcontextprotocol.io/introduction',
    description: 'Architecture overview: hosts, clients and servers.',
    tags: ['mcp'], addedAt: daysAgo(1),
  },
  {
    id: 'res_29', topicId: 'llms', type: 'YouTube',
    title: 'Intro to Large Language Models — Andrej Karpathy',
    url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    description: 'A one-hour overview of how LLMs work and where they fail.',
    tags: ['llm', 'overview'], addedAt: daysAgo(19),
  },
];

export const notes: Note[] = [
  {
    id: 'note_01', topicId: 'probability',
    title: 'Conditional probability — core intuition',
    content: `## Core idea

Conditioning **restricts the sample space**. Once we know B happened, we only care about outcomes inside B.

> P(A | B) = P(A ∩ B) / P(B)

## Checklist for any problem

- Draw the **probability tree** first
- Name the events explicitly (D = disease, T = positive test)
- Ask: *what am I conditioning on?*

## Gotcha

P(A | B) ≠ P(B | A). The base-rate fallacy comes from confusing the two.`,
    tags: ['conditional', 'intuition'], createdAt: daysAgo(10), updatedAt: daysAgo(2),
  },
  {
    id: 'note_02', topicId: 'probability',
    title: "Bayes theorem — worked medical-test example",
    content: `A disease affects **1%** of people. A test has 95% sensitivity and 90% specificity.

1. P(D) = 0.01
2. P(+ | D) = 0.95
3. P(+ | ¬D) = 0.10

\`\`\`
P(D | +) = 0.95 * 0.01 / (0.95 * 0.01 + 0.10 * 0.99) ≈ 8.8%
\`\`\`

Even with a "good" test, a positive result means only ~9% chance of disease because the prior is tiny.`,
    tags: ['bayes', 'example'], createdAt: daysAgo(8), updatedAt: daysAgo(8),
  },
  {
    id: 'note_03', topicId: 'probability',
    title: 'Independence vs mutual exclusivity',
    content: `These are **different** (and almost opposite) ideas.

- **Independent**: P(A ∩ B) = P(A)·P(B). Knowing A tells you nothing about B.
- **Mutually exclusive**: P(A ∩ B) = 0. Knowing A means B is *impossible*.

If both have positive probability, mutually exclusive events are always *dependent*.`,
    tags: ['independence'], createdAt: daysAgo(6), updatedAt: daysAgo(6),
  },
  {
    id: 'note_04', topicId: 'covariance',
    title: "Why covariance doesn't imply independence",
    content: `Take X ~ Uniform(−1, 1) and Y = X².

- Y is a deterministic function of X → clearly **dependent**
- Cov(X, Y) = E[X³] − E[X]·E[X²] = 0

Covariance only captures *linear* association. Use mutual information or distance correlation for general dependence.

**Exception:** for a *jointly Gaussian* pair, zero covariance ⇒ independence.`,
    tags: ['independence', 'covariance'], createdAt: daysAgo(17), updatedAt: daysAgo(16),
  },
  {
    id: 'note_05', topicId: 'hypothesis-testing',
    title: 'What a p-value is (and is not)',
    content: `A p-value is **P(data at least this extreme | H₀ is true)**.

It is *not*:
- the probability H₀ is true
- the probability the result is due to chance
- a measure of effect size

Always report an effect size and an interval alongside it.`,
    tags: ['p-value'], createdAt: daysAgo(5), updatedAt: daysAgo(3),
  },
  {
    id: 'note_06', topicId: 'central-limit-theorem',
    title: 'CLT — checklist before using it',
    content: `- Independent observations?
- Finite variance? (Cauchy breaks it)
- n large enough for the skew of the source distribution?

Standard error = σ / √n. Quadrupling the sample size only **halves** the error.`,
    tags: ['clt'], createdAt: daysAgo(4), updatedAt: daysAgo(4),
  },
  {
    id: 'note_07', topicId: 'eigenvalues-eigenvectors',
    title: 'Eigen-intuition cheat sheet',
    content: `- An eigenvector is a direction that a matrix only **scales**: Av = λv
- λ tells you the stretch factor (negative → flips)
- Symmetric matrices have **real** eigenvalues and orthogonal eigenvectors
- PCA = eigendecomposition of the covariance matrix`,
    tags: ['eigen', 'pca'], createdAt: daysAgo(15), updatedAt: daysAgo(14),
  },
  {
    id: 'note_08', topicId: 'decision-trees',
    title: 'Impurity measures at a glance',
    content: `| Measure | Formula | Notes |
|---|---|---|
| Gini | 1 − Σ pᵢ² | cheaper, default in CART |
| Entropy | −Σ pᵢ log pᵢ | slightly more balanced splits |

Trees are **high variance** — small data changes can produce very different trees. That's what bagging fixes.`,
    tags: ['impurity', 'variance'], createdAt: daysAgo(3), updatedAt: daysAgo(1),
  },
  {
    id: 'note_09', topicId: 'bias-variance',
    title: 'Decomposition of expected error',
    content: `Expected test error = **Bias² + Variance + Irreducible noise**

- High bias → underfitting (model too simple)
- High variance → overfitting (model too sensitive to training sample)

Learning curves tell you which regime you're in.`,
    tags: ['tradeoff'], createdAt: daysAgo(13), updatedAt: daysAgo(12),
  },
  {
    id: 'note_10', topicId: 'regularization',
    title: 'L1 vs L2 — geometric picture',
    content: `- **L2 (Ridge)** shrinks all weights smoothly; constraint region is a *circle*
- **L1 (Lasso)** drives some weights to exactly zero; constraint region has *corners*
- Elastic Net blends the two — useful with correlated features`,
    tags: ['l1', 'l2'], createdAt: daysAgo(4), updatedAt: daysAgo(2),
  },
  {
    id: 'note_11', topicId: 'hybrid-search',
    title: 'RRF formula & defaults',
    content: `Reciprocal Rank Fusion: score(d) = Σ 1 / (k + rank_r(d))

- default **k = 60**
- needs *no score normalisation* between BM25 and dense
- great baseline before training a learned fusion`,
    tags: ['rrf'], createdAt: daysAgo(10), updatedAt: daysAgo(9),
  },
  {
    id: 'note_12', topicId: 'chunking',
    title: 'Chunk size experiments',
    content: `Tried 256 / 512 / 1024 tokens on a docs corpus:

- **256** — best precision, worst answer completeness
- **512** — best overall trade-off
- **1024** — recall up, but context gets noisy

Overlap of ~10–15% helped boundary cases.`,
    tags: ['experiment'], createdAt: daysAgo(9), updatedAt: daysAgo(8),
  },
  {
    id: 'note_13', topicId: 'rag-evaluation',
    title: 'Evaluating retrieval and generation separately',
    content: `Always separate the two failure modes:

1. **Retrieval** — did the right context make it into the prompt? (context recall / precision)
2. **Generation** — given the context, was the answer *faithful*?

A low-faithfulness score with high context recall means a prompting/model problem, not a retrieval one.`,
    tags: ['eval'], createdAt: daysAgo(8), updatedAt: daysAgo(8),
  },
];

export const questions: Question[] = [
  {
    id: 'q_01', topicId: 'covariance',
    question: 'Why does zero covariance not imply independence?',
    answer: 'Covariance only measures *linear* dependence. Y = X² with X symmetric about 0 has Cov = 0 yet Y is determined by X. For jointly normal variables the implication does hold.',
    status: 'understood', tags: ['independence'], createdAt: daysAgo(16),
  },
  {
    id: 'q_02', topicId: 'probability',
    question: "Why are mutually exclusive events with positive probability never independent?",
    answer: '',
    status: 'unresolved', tags: ['independence'], createdAt: daysAgo(5),
  },
  {
    id: 'q_03', topicId: 'hypothesis-testing',
    question: 'If p = 0.04, why can I not say there is a 96% chance the effect is real?',
    answer: 'The p-value conditions on H₀ being true. The probability that H₀ is false needs a prior — that is a Bayesian quantity.',
    status: 'unresolved', tags: ['p-value'], createdAt: daysAgo(4),
  },
  {
    id: 'q_04', topicId: 'central-limit-theorem',
    question: 'How large does n need to be before the CLT approximation is trustworthy for skewed data?',
    answer: '',
    status: 'unresolved', tags: ['clt'], createdAt: daysAgo(3),
  },
  {
    id: 'q_05', topicId: 'eigenvalues-eigenvectors',
    question: 'Why are eigenvectors of a symmetric matrix orthogonal?',
    answer: 'For distinct eigenvalues λ₁ ≠ λ₂: λ₁⟨v₁,v₂⟩ = ⟨Av₁,v₂⟩ = ⟨v₁,Av₂⟩ = λ₂⟨v₁,v₂⟩, so ⟨v₁,v₂⟩ = 0.',
    status: 'understood', tags: ['symmetric'], createdAt: daysAgo(14),
  },
  {
    id: 'q_06', topicId: 'bayesian-statistics',
    question: 'What is the practical difference between MAP and MLE when the prior is uniform?',
    answer: '',
    status: 'unresolved', tags: ['map', 'mle'], createdAt: daysAgo(21),
  },
  {
    id: 'q_07', topicId: 'bias-variance',
    question: 'Why can very large neural networks generalise despite zero training error (double descent)?',
    answer: '',
    status: 'unresolved', tags: ['double-descent'], createdAt: daysAgo(12),
  },
  {
    id: 'q_08', topicId: 'svm',
    question: 'What does the kernel trick avoid computing, exactly?',
    answer: 'The explicit feature map φ(x). The dual only needs inner products, so k(x, x′) = ⟨φ(x), φ(x′)⟩ replaces them.',
    status: 'understood', tags: ['kernel'], createdAt: daysAgo(18),
  },
  {
    id: 'q_09', topicId: 'random-forest',
    question: 'Why does feature subsampling at each split reduce variance further than plain bagging?',
    answer: '',
    status: 'unresolved', tags: ['variance'], createdAt: daysAgo(3),
  },
  {
    id: 'q_10', topicId: 'hybrid-search',
    question: 'When does BM25 still outperform dense retrieval in practice?',
    answer: 'Exact identifiers, rare terms, out-of-domain corpora and short keyword queries.',
    status: 'understood', tags: ['bm25'], createdAt: daysAgo(9),
  },
  {
    id: 'q_11', topicId: 'llms',
    question: 'How does temperature interact with top-p sampling?',
    answer: '',
    status: 'unresolved', tags: ['sampling'], createdAt: daysAgo(17),
  },
  {
    id: 'q_12', topicId: 'prompt-engineering',
    question: 'How do I defend a RAG prompt against injected instructions in retrieved documents?',
    answer: '',
    status: 'unresolved', tags: ['security'], createdAt: daysAgo(23),
  },
];

export const todayActivityKey = todayKey;
