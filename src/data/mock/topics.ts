import type { Concept, Status, Topic } from '../../types';
import { daysAgo, slugify } from '../../lib/utils';

/**
 * Compact authoring format for the curriculum.
 * [name, summary, status, progress, lastStudiedDaysAgo, concepts]
 * Concepts are `|`-separated; `Name::summary` attaches a description.
 */
type Row = [string, string, 'C' | 'P' | 'R' | 'N', number, number | null, string];

const S: Record<'C' | 'P' | 'R' | 'N', Status> = {
  C: 'completed',
  P: 'in_progress',
  R: 'needs_revision',
  N: 'not_started',
};

interface Section {
  domainId: string;
  group: string;
  rows: Row[];
}

const sections: Section[] = [
  // ───────────── 01 — Statistics & Mathematics ─────────────
  {
    domainId: 'stats-math',
    group: 'Statistics',
    rows: [
      ['Descriptive Statistics', 'Summarise data with centre, spread, shape and robust measures.', 'C', 100, 41, 'Mean, Median, Mode|Variance & Standard Deviation|Quantiles & IQR|Skewness & Kurtosis|Outliers & Robust Statistics'],
      ['Probability', 'Understand events, conditional probability, Bayes theorem and independence.', 'P', 62, 0,
        'Sample Space::The set of all possible outcomes of an experiment.|Events::Subsets of the sample space; unions, intersections and complements.|Conditional Probability::P(A∣B) = P(A ∩ B) / P(B) — probability updated by information.|Independence::A and B are independent iff P(A ∩ B) = P(A)·P(B).|Bayes Theorem::Invert conditioning: P(A∣B) = P(B∣A)·P(A) / P(B).|Law of Total Probability::Break P(B) into cases over a partition of the sample space.|Random Variables::Map outcomes to numbers so probability can be analysed algebraically.'],
      ['Random Variables', 'Discrete and continuous random variables, expectation and variance.', 'C', 100, 24, 'Discrete vs Continuous|PMF, PDF and CDF|Expectation|Variance & Moments|Linearity of Expectation'],
      ['Distributions', 'The families of distributions that show up everywhere in data work.', 'C', 100, 18, 'Bernoulli & Binomial|Poisson & Exponential|Uniform|Normal Distribution|Student t, Chi-square & F|Joint & Marginal Distributions'],
      ['Sampling', 'How samples relate to populations, and where bias creeps in.', 'C', 100, 33, 'Population vs Sample|Simple Random Sampling|Stratified & Cluster Sampling|Sampling Bias|Bootstrap Resampling'],
      ['Central Limit Theorem', 'Why sample means become normal and what that buys you.', 'P', 45, 3, 'Sampling Distribution of the Mean|Statement of the CLT|Standard Error|Conditions & Failure Cases|Simulation Intuition'],
      ['Law of Large Numbers', 'Sample averages converge to expectations as n grows.', 'N', 0, null, 'Weak Law|Strong Law|Convergence in Probability|LLN vs CLT'],
      ['Hypothesis Testing', 'Frame decisions under uncertainty with null and alternative hypotheses.', 'P', 38, 2, 'Null & Alternative Hypotheses|p-values|Type I & Type II Errors|Statistical Power|t-tests & z-tests|Multiple Comparisons'],
      ['Confidence Intervals', 'Quantify the uncertainty of an estimate without overclaiming.', 'P', 20, 6, 'Point vs Interval Estimates|Interpreting 95% Coverage|Margin of Error|Bootstrap Intervals|Intervals for Proportions'],
      ['Correlation', 'Measure linear and monotonic association between variables.', 'C', 100, 29, "Pearson's r|Spearman & Kendall|Correlation vs Causation|Spurious Correlation|Simpson's Paradox"],
      ['Covariance', 'How two variables vary together, and what it fails to capture.', 'R', 70, 17, 'Definition of Covariance|Covariance Matrix|Covariance vs Correlation|Zero Covariance vs Independence|Sample Covariance'],
      ['Bayesian Statistics', 'Update beliefs with evidence: priors, likelihoods and posteriors.', 'R', 50, 22, 'Prior, Likelihood, Posterior|Conjugate Priors|MAP vs MLE|Credible Intervals|Bayesian vs Frequentist'],
      ['Regression Statistics', 'Inference for linear models: coefficients, residuals and diagnostics.', 'N', 0, null, 'OLS Assumptions|Coefficient Inference|R² & Adjusted R²|Residual Diagnostics|Multicollinearity'],
      ['Experimental Design', 'Design experiments that can actually answer the question being asked.', 'N', 0, null, 'Randomisation|Control & Treatment Groups|A/B Testing|Sample Size & Power|Confounders & Blocking'],
    ],
  },
  {
    domainId: 'stats-math',
    group: 'Mathematics',
    rows: [
      ['Linear Algebra', 'The language of data: vectors, matrices and the spaces they live in.', 'P', 55, 1, 'Vector Spaces|Linear Transformations|Rank & Null Space|Orthogonality & Projections|Matrix Decompositions|Determinants'],
      ['Calculus', 'Rates of change and accumulation; the engine behind learning algorithms.', 'P', 30, 5, 'Limits & Continuity|Functions & Composition|Chain Rule|Integration|Taylor Series'],
      ['Optimization', 'Finding the best parameters under constraints and objectives.', 'N', 0, null, 'Objective Functions|Constraints & Lagrange Multipliers|Local vs Global Minima|Saddle Points|Stochastic Methods'],
      ['Vectors', 'Magnitude, direction, dot products and geometric intuition.', 'C', 100, 38, 'Vector Operations|Dot Product|Norms (L1, L2, L∞)|Cosine Similarity|Basis & Span'],
      ['Matrices', 'Matrix algebra, inverses and how matrices act on vectors.', 'C', 100, 36, 'Matrix Multiplication|Transpose & Inverse|Identity & Diagonal Matrices|Symmetric & Positive Definite|Block Structure'],
      ['Eigenvalues & Eigenvectors', 'Directions a transformation only stretches — and why PCA cares.', 'R', 60, 14, 'Definition & Geometry|Characteristic Polynomial|Diagonalisation|Spectral Theorem|SVD Connection'],
      ['Derivatives', 'Slopes, rules of differentiation and local linear approximation.', 'C', 100, 45, 'Limit Definition|Product, Quotient & Chain Rules|Common Derivatives|Higher-order Derivatives|Linearisation'],
      ['Partial Derivatives', 'Differentiate along one axis at a time in multivariable functions.', 'N', 0, null, 'Partial Derivatives|Mixed Partials|Directional Derivatives|Jacobian|Hessian'],
      ['Gradients', 'The direction of steepest ascent; the compass of gradient descent.', 'N', 0, null, 'Gradient Vector|Gradient Descent Intuition|Learning Rate|Gradient of Common Losses|Numerical Gradients'],
      ['Convex Optimization', 'When every local minimum is global: convex sets, functions and duality.', 'N', 0, null, 'Convex Sets|Convex Functions|First & Second-order Conditions|Duality|KKT Conditions'],
    ],
  },

  // ───────────── 02 — Machine Learning ─────────────
  {
    domainId: 'machine-learning',
    group: 'Supervised Learning',
    rows: [
      ['Linear Regression', 'Fit a line (or hyperplane) by minimising squared error.', 'C', 100, 27, 'Ordinary Least Squares|Normal Equation|Assumptions|Interpreting Coefficients|Polynomial Features'],
      ['Logistic Regression', 'Model class probabilities with the sigmoid and log-loss.', 'C', 100, 21, 'Sigmoid & Log-odds|Maximum Likelihood|Decision Boundary|Multiclass (Softmax)|Calibration'],
      ['KNN', 'Predict from the labels of the nearest training examples.', 'C', 100, 34, 'Distance Metrics|Choosing k|Curse of Dimensionality|Weighted Voting|Scaling Requirements'],
      ['Naive Bayes', 'A fast probabilistic classifier built on conditional independence.', 'C', 100, 31, "Bayes' Rule for Classification|Independence Assumption|Gaussian & Multinomial Variants|Laplace Smoothing|Text Classification"],
      ['Decision Trees', 'Recursively split the feature space to reduce impurity.', 'P', 70, 1, 'Gini & Entropy|Information Gain|Greedy Splitting|Pruning|Handling Categorical Features'],
      ['SVM', 'Maximum-margin classifiers and the kernel trick.', 'R', 50, 19, 'Margin & Support Vectors|Hard vs Soft Margin|Kernel Trick|RBF Kernel|Hinge Loss'],
    ],
  },
  {
    domainId: 'machine-learning',
    group: 'Ensembles & Boosting',
    rows: [
      ['Random Forest', 'Average many decorrelated trees to cut variance.', 'P', 45, 4, 'Bagging|Feature Subsampling|Out-of-bag Error|Feature Importance|Tuning Depth & Trees'],
      ['Gradient Boosting', 'Build models sequentially to correct previous residuals.', 'P', 30, 7, 'Additive Modelling|Residual Fitting|Shrinkage (Learning Rate)|Loss Functions|Overfitting Control'],
      ['XGBoost', 'Regularised, fast gradient boosting with second-order information.', 'N', 0, null, 'Objective & Regularisation|Second-order Approximation|Tree Construction|Missing Values|Early Stopping'],
      ['LightGBM', 'Histogram-based boosting with leaf-wise growth.', 'N', 0, null, 'Histogram Binning|Leaf-wise Growth|GOSS & EFB|Categorical Support'],
      ['Ensemble Methods', 'Bagging, boosting and stacking — when combining models helps.', 'N', 0, null, 'Bagging vs Boosting|Stacking|Voting|Diversity of Models|Blending'],
    ],
  },
  {
    domainId: 'machine-learning',
    group: 'Unsupervised Learning',
    rows: [
      ['K-Means', 'Partition data into k clusters by minimising within-cluster variance.', 'N', 0, null, "Lloyd's Algorithm|Initialisation (k-means++)|Choosing k|Inertia & Silhouette|Limitations"],
      ['Clustering', 'Group unlabeled data and evaluate whether groups are meaningful.', 'N', 0, null, 'Hard vs Soft Clustering|Distance & Linkage|Cluster Validity|Gaussian Mixtures'],
      ['Hierarchical Clustering', 'Build a dendrogram of nested clusters.', 'N', 0, null, 'Agglomerative vs Divisive|Linkage Criteria|Dendrograms|Cutting the Tree'],
      ['DBSCAN', 'Density-based clustering that finds arbitrary shapes and noise.', 'N', 0, null, 'Core, Border & Noise Points|eps and minPts|Density Reachability|Comparison with k-means'],
      ['PCA', 'Project data onto directions of maximum variance.', 'N', 0, null, 'Covariance & Variance Explained|Principal Components|Eigen / SVD View|Choosing Components|Whitening'],
      ['Dimensionality Reduction', 'Linear and non-linear methods for compressing features.', 'N', 0, null, 't-SNE|UMAP|Autoencoders|Manifold Hypothesis'],
      ['Anomaly Detection', 'Spot rare and unusual observations.', 'N', 0, null, 'Isolation Forest|One-class SVM|Statistical Methods|Evaluation Without Labels'],
    ],
  },
  {
    domainId: 'machine-learning',
    group: 'Model Development',
    rows: [
      ['Regularization', 'Constrain model complexity to generalise better.', 'P', 55, 2, 'L1 (Lasso)|L2 (Ridge)|Elastic Net|Early Stopping|Dropout'],
      ['Bias-Variance', 'The tradeoff between underfitting and overfitting.', 'R', 65, 12, 'Bias & Variance Decomposition|Underfitting vs Overfitting|Learning Curves|Model Capacity|Double Descent'],
      ['Feature Engineering', 'Turn raw data into signals a model can use.', 'C', 100, 26, 'Encoding Categoricals|Scaling & Normalisation|Interaction Features|Binning|Target Leakage'],
      ['Data Preprocessing', 'Cleaning, imputation and pipelines you can trust.', 'N', 0, null, 'Missing Value Strategies|Outlier Handling|Pipelines|Train/Test Hygiene'],
      ['Imbalanced Data', 'Learning when the interesting class is rare.', 'N', 0, null, 'Resampling (SMOTE)|Class Weights|Threshold Moving|Appropriate Metrics'],
      ['Model Evaluation', 'Choose metrics that match the problem and the cost of errors.', 'P', 60, 3, 'Confusion Matrix|Precision, Recall, F1|ROC & PR Curves|RMSE, MAE, R²|Calibration Curves'],
      ['Cross Validation', 'Estimate generalisation without wasting data.', 'P', 40, 5, 'k-fold|Stratified Folds|Time-series Splits|Nested CV|Data Leakage'],
      ['Hyperparameter Optimization', 'Search the configuration space efficiently.', 'N', 0, null, 'Grid & Random Search|Bayesian Optimisation|Successive Halving|Search Spaces'],
      ['Loss Functions', 'The objective a model is actually trained to minimise.', 'N', 0, null, 'MSE, MAE, Huber|Cross-entropy|Hinge Loss|Custom Losses'],
      ['Gradient Descent', 'Iteratively follow the negative gradient to a minimum.', 'N', 0, null, 'Batch, Mini-batch, SGD|Momentum|Adam|Learning Rate Schedules'],
      ['Model Interpretability', 'Explain what a model learned and why it predicted what it did.', 'N', 0, null, 'Feature Importance|Partial Dependence|SHAP|LIME'],
      ['Time Series Basics', 'Handle temporal structure, seasonality and leakage.', 'N', 0, null, 'Trend & Seasonality|Stationarity|ARIMA Intuition|Lag Features|Backtesting'],
      ['Neural Network Basics', 'Perceptrons, layers and backpropagation in a nutshell.', 'N', 0, null, 'Perceptron|Activation Functions|Backpropagation|Initialisation|Overfitting in Deep Nets'],
    ],
  },

  // ───────────── 03 — RAG & GenAI ─────────────
  {
    domainId: 'rag-genai',
    group: 'Retrieval Foundations',
    rows: [
      ['Embeddings', 'Represent text as dense vectors that encode meaning.', 'C', 100, 15, 'Word vs Sentence Embeddings|Contrastive Training|Dimensionality|Embedding Models|Domain Adaptation'],
      ['Vector Space', 'Geometry of meaning: distance, similarity and neighbourhoods.', 'C', 100, 16, 'Cosine vs Dot Product|Euclidean Distance|Normalisation|Anisotropy|Hubness'],
      ['Vector Databases', 'Stores and indexes built for similarity search.', 'C', 100, 20, 'Indexing Strategies|Metadata Filtering|Upserts & Sharding|Managed vs Self-hosted|Trade-offs'],
      ['ANN', 'Approximate nearest neighbour search: speed vs recall.', 'C', 100, 23, 'HNSW|IVF|Product Quantisation|Recall vs Latency|Index Build Cost'],
      ['BM25', 'The classical lexical ranking function that is still hard to beat.', 'C', 100, 28, 'TF & IDF|Length Normalisation|k1 and b Parameters|Tokenisation Effects|Strengths & Weaknesses'],
      ['Dense Retrieval', 'Bi-encoders that retrieve by semantic similarity.', 'C', 100, 13, 'Bi-encoder vs Cross-encoder|DPR|Hard Negatives|Training Objectives|Failure Modes'],
      ['Sparse Retrieval', 'Inverted indexes, SPLADE and learned sparse representations.', 'C', 100, 25, 'Inverted Index|Term Expansion|SPLADE|Vocabulary Mismatch'],
      ['Hybrid Search', 'Combine lexical and semantic retrieval for robust recall.', 'C', 100, 9, 'Score Fusion|Reciprocal Rank Fusion|Weighting Strategies|When Hybrid Wins'],
    ],
  },
  {
    domainId: 'rag-genai',
    group: 'Retrieval Pipeline',
    rows: [
      ['Chunking', 'Split documents so retrieved context is complete and focused.', 'C', 100, 8, 'Fixed-size Chunks|Semantic Chunking|Overlap|Hierarchical / Parent-child|Chunk Size Trade-offs'],
      ['Document Loaders & Parsing', 'Get clean text out of PDFs, HTML and messy sources.', 'N', 0, null, 'PDF Parsing|HTML Cleaning|Tables & Figures|OCR|Metadata Extraction'],
      ['Metadata Filtering', 'Constrain retrieval with structured attributes.', 'N', 0, null, 'Pre vs Post Filtering|Schema Design|Self-querying Retrievers|Access Control'],
      ['Query Rewriting', 'Transform user queries to retrieve better evidence.', 'P', 60, 2, 'Query Expansion|HyDE|Multi-query|Step-back Prompting|Conversation Condensation'],
      ['Reranking', 'Use a stronger model to reorder the first-stage candidates.', 'P', 40, 4, 'Cross-encoders|Two-stage Retrieval|Latency Budgets|LLM Rerankers|ColBERT / Late Interaction'],
    ],
  },
  {
    domainId: 'rag-genai',
    group: 'Evaluation',
    rows: [
      ['Precision', 'Of what was retrieved, how much was relevant?', 'C', 100, 11, 'Precision@k|Relevance Judgments|Precision vs Recall|Binary vs Graded Relevance'],
      ['Recall', 'Of what was relevant, how much was retrieved?', 'C', 100, 10, 'Recall@k|Coverage|Cost of Misses|Recall Ceiling in RAG'],
      ['MRR', 'Mean Reciprocal Rank: how early does the first right answer appear?', 'P', 70, 3, 'Reciprocal Rank|MRR vs MAP|nDCG|Limitations'],
      ['Retrieval Evaluation', 'Build test sets and measure the retriever in isolation.', 'P', 50, 6, 'Golden Datasets|Synthetic Queries|Offline vs Online Eval|Error Analysis'],
      ['RAG Evaluation', 'Judge faithfulness, relevance and answer quality end to end.', 'P', 25, 8, 'Faithfulness / Groundedness|Answer Relevance|Context Precision & Recall|LLM-as-judge|Ragas & TruLens'],
    ],
  },
  {
    domainId: 'rag-genai',
    group: 'LLMs & Agents',
    rows: [
      ['Fine-tuning vs RAG', 'Know when to teach the model and when to give it a library.', 'P', 35, 5, 'Knowledge vs Behaviour|Cost & Latency|Freshness|Hybrid Approaches|LoRA / PEFT'],
      ['Agentic RAG', 'Let an agent plan retrieval, iterate and verify.', 'N', 0, null, 'Routing|Iterative Retrieval|Self-reflection|Tool-augmented Retrieval'],
      ['LLMs', 'Transformers, tokens, context and how generation actually works.', 'R', 60, 18, 'Tokenisation|Attention & Transformers|Pretraining vs Instruction Tuning|Sampling Parameters|Hallucination'],
      ['Prompt Engineering', 'Steer models with structure, examples and constraints.', 'R', 45, 24, 'System vs User Prompts|Few-shot Examples|Chain-of-thought|Structured Output|Prompt Injection'],
      ['Context Windows', 'Long context, lost-in-the-middle and context budgeting.', 'N', 0, null, 'Context Length Limits|Lost in the Middle|Context Packing|Caching'],
      ['Tool Calling', 'Let models call functions with structured arguments.', 'N', 0, null, 'Function Schemas|Parallel Tool Calls|Error Handling|Validation'],
      ['MCP', 'Model Context Protocol: a standard interface to tools and data.', 'N', 0, null, 'Hosts, Clients & Servers|Resources, Tools & Prompts|Transports|Security Considerations'],
      ['Agents', 'Loops of reasoning and action with memory and tools.', 'N', 0, null, 'ReAct Pattern|Planning|Memory|Multi-agent Systems|Evaluation of Agents'],
      ['Guardrails & Hallucination', 'Reduce unsupported answers and unsafe behaviours.', 'N', 0, null, 'Grounding & Citations|Refusal Behaviour|Output Validation|Red-teaming'],
    ],
  },
];

const OVERRIDES: Record<string, Partial<Topic>> = {
  probability: {
    subtitle:
      'Understanding uncertainty, events and the mathematical foundations of statistical reasoning.',
    overview:
      'Probability gives us a formal language for uncertainty. Everything downstream — distributions, inference, Bayesian methods, probabilistic models like Naive Bayes — assumes you can reason cleanly about events, conditioning and independence. Focus on building intuition first (trees, tables, simulations), then on the algebra.',
  },
  covariance: {
    overview:
      'Covariance measures how two variables move together. Its sign gives direction, its magnitude depends on units, and — crucially — zero covariance only rules out a *linear* relationship, not dependence in general.',
  },
  'central-limit-theorem': {
    subtitle: 'Why averages of many independent samples look normal, regardless of the source distribution.',
  },
};

export const buildTopicsAndConcepts = () => {
  const topics: Topic[] = [];
  const concepts: Concept[] = [];
  let order = 0;

  for (const section of sections) {
    for (const [name, summary, st, progress, ago, conceptStr] of section.rows) {
      const id = slugify(name);
      const status = S[st];
      const studied = ago === null ? null : daysAgo(ago, 9 + (order % 9));
      topics.push({
        id,
        domainId: section.domainId,
        group: section.group,
        name,
        summary,
        subtitle: summary,
        overview: summary,
        status,
        progress,
        lastStudiedAt: studied,
        // Opened roughly when last studied, so "Continue Learning" has a natural order
        lastOpenedAt: studied,
        order: order++,
        ...OVERRIDES[id],
      });

      const items = conceptStr.split('|');
      const understoodCount = Math.round((progress / 100) * items.length);
      items.forEach((raw, i) => {
        const [cName, cSummary] = raw.split('::');
        concepts.push({
          id: `${id}--${slugify(cName)}`,
          topicId: id,
          name: cName.trim(),
          summary: cSummary?.trim(),
          understood: i < understoodCount,
          order: i,
        });
      });
    }
  }
  return { topics, concepts };
};
