export type SkillDef = {
  id: string;
  name: string;
  category: string; // domain id
  description: string;
  prerequisites: string[];
};

// Hand-authored skill DAG spanning all six domains. Every id referenced in
// `prerequisites` must exist in this list - lib/skillGraph.ts topologically
// sorts this at runtime for gap analysis and path ordering.
export const SKILLS: SkillDef[] = [
  // ---- cross-cutting foundations ----
  { id: "git-basics", name: "Git & Version Control", category: "web-dev", description: "Tracking changes, branching, committing, collaborating.", prerequisites: [] },

  // ---- web development ----
  { id: "html", name: "HTML", category: "web-dev", description: "Semantic markup and page structure.", prerequisites: [] },
  { id: "css", name: "CSS", category: "web-dev", description: "Styling, layout, flexbox and grid.", prerequisites: ["html"] },
  { id: "responsive-design", name: "Responsive Design", category: "web-dev", description: "Building layouts that adapt across devices.", prerequisites: ["css"] },
  { id: "js-fundamentals", name: "JavaScript Fundamentals", category: "web-dev", description: "Variables, functions, control flow, arrays/objects.", prerequisites: ["html"] },
  { id: "dom-manipulation", name: "DOM Manipulation", category: "web-dev", description: "Reading and updating the page from JavaScript.", prerequisites: ["js-fundamentals"] },
  { id: "typescript", name: "TypeScript", category: "web-dev", description: "Static typing on top of JavaScript.", prerequisites: ["js-fundamentals"] },
  { id: "react-fundamentals", name: "React Fundamentals", category: "web-dev", description: "Components, props, JSX, rendering.", prerequisites: ["dom-manipulation"] },
  { id: "state-management", name: "State Management", category: "web-dev", description: "Managing complex UI state across components.", prerequisites: ["react-fundamentals"] },
  { id: "nodejs-fundamentals", name: "Node.js Fundamentals", category: "web-dev", description: "Running JavaScript server-side, npm, modules.", prerequisites: ["js-fundamentals"] },
  { id: "rest-apis", name: "REST APIs", category: "web-dev", description: "Designing and consuming HTTP APIs.", prerequisites: ["nodejs-fundamentals"] },
  { id: "sql", name: "SQL", category: "web-dev", description: "Relational queries, joins, schema design.", prerequisites: [] },
  { id: "fullstack-integration", name: "Full-Stack Integration", category: "web-dev", description: "Wiring a frontend, API and database together.", prerequisites: ["state-management", "rest-apis", "sql"] },
  { id: "testing-fundamentals", name: "Testing Fundamentals", category: "web-dev", description: "Unit and integration testing practices.", prerequisites: ["js-fundamentals"] },

  // ---- data science ----
  { id: "python-fundamentals", name: "Python Fundamentals", category: "data-science", description: "Syntax, control flow, functions in Python.", prerequisites: [] },
  { id: "python-data-structures", name: "Python Data Structures", category: "data-science", description: "Lists, dicts, comprehensions, iterators.", prerequisites: ["python-fundamentals"] },
  { id: "statistics-fundamentals", name: "Statistics Fundamentals", category: "data-science", description: "Descriptive stats, distributions, hypothesis testing.", prerequisites: [] },
  { id: "probability", name: "Probability", category: "data-science", description: "Random variables, expectation, Bayes' theorem.", prerequisites: ["statistics-fundamentals"] },
  { id: "data-analysis-pandas", name: "Data Analysis with Pandas", category: "data-science", description: "DataFrames, cleaning, aggregation.", prerequisites: ["python-data-structures", "statistics-fundamentals"] },
  { id: "data-visualization", name: "Data Visualization", category: "data-science", description: "Communicating data visually (matplotlib/seaborn).", prerequisites: ["data-analysis-pandas"] },
  { id: "data-wrangling", name: "Data Wrangling", category: "data-science", description: "Joining, reshaping and cleaning messy datasets.", prerequisites: ["data-analysis-pandas", "sql"] },
  { id: "exploratory-data-analysis", name: "Exploratory Data Analysis", category: "data-science", description: "Finding structure and signal before modeling.", prerequisites: ["data-visualization", "data-wrangling"] },

  // ---- AI / ML ----
  { id: "linear-algebra", name: "Linear Algebra", category: "ai-ml", description: "Vectors, matrices, transformations.", prerequisites: [] },
  { id: "calculus-basics", name: "Calculus Basics", category: "ai-ml", description: "Derivatives and gradients for optimization.", prerequisites: [] },
  { id: "ml-fundamentals", name: "Machine Learning Fundamentals", category: "ai-ml", description: "The ML workflow: train/test, features, loss.", prerequisites: ["python-data-structures", "statistics-fundamentals", "linear-algebra"] },
  { id: "supervised-learning", name: "Supervised Learning", category: "ai-ml", description: "Regression and classification models.", prerequisites: ["ml-fundamentals"] },
  { id: "unsupervised-learning", name: "Unsupervised Learning", category: "ai-ml", description: "Clustering and dimensionality reduction.", prerequisites: ["ml-fundamentals"] },
  { id: "model-evaluation", name: "Model Evaluation", category: "ai-ml", description: "Metrics, cross-validation, avoiding overfitting.", prerequisites: ["supervised-learning"] },
  { id: "deep-learning-fundamentals", name: "Deep Learning Fundamentals", category: "ai-ml", description: "Neural network basics, backpropagation.", prerequisites: ["supervised-learning", "calculus-basics"] },
  { id: "neural-networks", name: "Neural Network Architectures", category: "ai-ml", description: "CNNs, RNNs and modern architectures.", prerequisites: ["deep-learning-fundamentals"] },
  { id: "nlp-fundamentals", name: "NLP Fundamentals", category: "ai-ml", description: "Text processing, embeddings, sequence models.", prerequisites: ["deep-learning-fundamentals"] },
  { id: "computer-vision-fundamentals", name: "Computer Vision Fundamentals", category: "ai-ml", description: "Image processing and CNN-based vision models.", prerequisites: ["deep-learning-fundamentals"] },
  { id: "llm-and-genai", name: "LLMs & Generative AI", category: "ai-ml", description: "Transformers, prompting, fine-tuning, RAG.", prerequisites: ["nlp-fundamentals"] },

  // ---- cloud & devops ----
  { id: "linux-fundamentals", name: "Linux Fundamentals", category: "cloud-devops", description: "Shell, filesystem, permissions, processes.", prerequisites: [] },
  { id: "cloud-fundamentals", name: "Cloud Fundamentals", category: "cloud-devops", description: "Core cloud concepts: compute, storage, networking.", prerequisites: [] },
  { id: "containers-docker", name: "Containers with Docker", category: "cloud-devops", description: "Images, containers, Dockerfiles, registries.", prerequisites: ["linux-fundamentals"] },
  { id: "ci-cd-fundamentals", name: "CI/CD Fundamentals", category: "cloud-devops", description: "Automated build, test and deploy pipelines.", prerequisites: ["git-basics", "containers-docker"] },
  { id: "cloud-deployment", name: "Cloud Deployment", category: "cloud-devops", description: "Deploying and scaling apps on a cloud provider.", prerequisites: ["cloud-fundamentals", "containers-docker"] },
  { id: "kubernetes-basics", name: "Kubernetes Basics", category: "cloud-devops", description: "Pods, deployments, services, scaling.", prerequisites: ["containers-docker"] },
  { id: "infrastructure-as-code", name: "Infrastructure as Code", category: "cloud-devops", description: "Declaratively provisioning cloud infrastructure.", prerequisites: ["cloud-deployment"] },

  // ---- mobile dev ----
  { id: "mobile-dev-fundamentals", name: "Mobile Dev Fundamentals", category: "mobile-dev", description: "Mobile app architecture, lifecycle, UI patterns.", prerequisites: ["js-fundamentals"] },
  { id: "react-native-basics", name: "React Native Basics", category: "mobile-dev", description: "Cross-platform mobile UI with React Native.", prerequisites: ["react-fundamentals", "mobile-dev-fundamentals"] },
  { id: "mobile-app-deployment", name: "Mobile App Deployment", category: "mobile-dev", description: "Building, signing and shipping to app stores.", prerequisites: ["react-native-basics"] },

  // ---- cybersecurity ----
  { id: "networking-fundamentals", name: "Networking Fundamentals", category: "cybersecurity", description: "TCP/IP, DNS, HTTP, network topology.", prerequisites: [] },
  { id: "security-fundamentals", name: "Security Fundamentals", category: "cybersecurity", description: "CIA triad, threat modeling, common attack classes.", prerequisites: ["networking-fundamentals"] },
  { id: "cryptography-basics", name: "Cryptography Basics", category: "cybersecurity", description: "Symmetric/asymmetric encryption, hashing, TLS.", prerequisites: ["security-fundamentals"] },
  { id: "web-security", name: "Web Security", category: "cybersecurity", description: "OWASP Top 10: XSS, CSRF, injection, auth flaws.", prerequisites: ["security-fundamentals", "js-fundamentals"] },
  { id: "penetration-testing-basics", name: "Penetration Testing Basics", category: "cybersecurity", description: "Reconnaissance, scanning, exploitation basics.", prerequisites: ["web-security", "networking-fundamentals"] },
];

export const SKILLS_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));
