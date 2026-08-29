export type StaticReviewQuestion = {
  id: string;
  skillId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const STATIC_REVIEW_QUESTIONS: Record<string, StaticReviewQuestion[]> = {
  "python-fundamentals": [
    {
      id: "py-q1",
      skillId: "python-fundamentals",
      question: "Which data structure in Python is immutable?",
      options: ["List", "Dictionary", "Tuple", "Set"],
      correctIndex: 2,
      explanation: "Tuples in Python cannot be modified after creation, making them immutable.",
    },
    {
      id: "py-q2",
      skillId: "python-fundamentals",
      question: "What is the time complexity of looking up a key in a Python dictionary on average?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      correctIndex: 0,
      explanation: "Python dictionaries use hash tables, providing O(1) average time complexity for key lookups.",
    },
  ],
  "deep-learning-fundamentals": [
    {
      id: "dl-q1",
      skillId: "deep-learning-fundamentals",
      question: "Which activation function helps mitigate the vanishing gradient problem in deep networks?",
      options: ["Sigmoid", "ReLU", "Tanh", "Softmax"],
      correctIndex: 1,
      explanation: "ReLU (Rectified Linear Unit) has a constant gradient of 1 for positive inputs, preventing vanishing gradients.",
    },
    {
      id: "dl-q2",
      skillId: "deep-learning-fundamentals",
      question: "What is the purpose of backpropagation in neural network training?",
      options: [
        "To initialize model weights randomly",
        "To compute gradients of the loss function with respect to weights",
        "To increase model training time",
        "To compress the dataset",
      ],
      correctIndex: 1,
      explanation: "Backpropagation applies the chain rule of calculus to compute loss gradients for updating network weights.",
    },
  ],
  "ml-fundamentals": [
    {
      id: "ml-q1",
      skillId: "ml-fundamentals",
      question: "Which metric is most appropriate for evaluating a model on an imbalanced classification dataset?",
      options: ["Accuracy", "F1-Score / PR-AUC", "Mean Squared Error", "R-squared"],
      correctIndex: 1,
      explanation: "F1-Score and Precision-Recall AUC balance precision and recall, preventing deceptive high accuracy scores in skewed classes.",
    },
    {
      id: "ml-q2",
      skillId: "ml-fundamentals",
      question: "What does L2 regularization (Ridge) primarily do during regression training?",
      options: [
        "Sets irrelevant weights strictly to zero",
        "Penalizes large weight magnitudes quadratically to reduce overfitting",
        "Randomly drops neurons during epochs",
        "Scales features between 0 and 1",
      ],
      correctIndex: 1,
      explanation: "L2 regularization adds a squared penalty on weight magnitudes, shrinking coefficients towards zero to prevent overfitting.",
    },
  ],
  "react-fundamentals": [
    {
      id: "react-q1",
      skillId: "react-fundamentals",
      question: "When does the useEffect hook execute if passed an empty dependency array `[]`?",
      options: [
        "On every component render",
        "Only once after the initial component mount",
        "Only when component props update",
        "Before the DOM is painted",
      ],
      correctIndex: 1,
      explanation: "An empty dependency array tells React to run the effect only once after the initial mount and cleanup on unmount.",
    },
    {
      id: "react-q2",
      skillId: "react-fundamentals",
      question: "Why should you avoid directly mutating state in React (e.g. `state.count = 5`)?",
      options: [
        "It throws a compiler error",
        "React cannot detect the state change to trigger a re-render",
        "It breaks JavaScript garbage collection",
        "It converts state to undefined",
      ],
      correctIndex: 1,
      explanation: "React relies on reference equality to schedule re-renders; mutating state in-place prevents change detection.",
    },
  ],
  "typescript-fundamentals": [
    {
      id: "ts-q1",
      skillId: "typescript-fundamentals",
      question: "What is the difference between `unknown` and `any` in TypeScript?",
      options: [
        "There is no difference",
        "`unknown` is type-safe and requires type narrowing before usage, whereas `any` disables all type checking",
        "`any` is only for primitives",
        "`unknown` is deprecated",
      ],
      correctIndex: 1,
      explanation: "`unknown` is the type-safe counterpart of `any`. TypeScript enforces type guards or narrowing before performing operations on `unknown`.",
    },
  ],
  "containers-docker": [
    {
      id: "docker-q1",
      skillId: "containers-docker",
      question: "What is the primary difference between a Docker image and a Docker container?",
      options: [
        "An image is a running instance; a container is a static template",
        "An image is a static blueprint/template; a container is an active running instance of an image",
        "Images only work on Linux",
        "Containers do not need images",
      ],
      correctIndex: 1,
      explanation: "A Docker image is an immutable build artifact containing code and dependencies; a container is a live running execution of that image.",
    },
  ],
};

/**
 * Returns fallback review questions for a given skill, or generates a generic fallback question.
 */
export function getFallbackReviewQuestions(skillId: string, skillName: string): StaticReviewQuestion[] {
  if (STATIC_REVIEW_QUESTIONS[skillId]) {
    return STATIC_REVIEW_QUESTIONS[skillId];
  }

  return [
    {
      id: `fallback-${skillId}-q1`,
      skillId,
      question: `Which statement best describes the primary application of ${skillName}?`,
      options: [
        `It provides foundational principles and core practices for ${skillName} development`,
        "It is solely used for legacy database migrations",
        "It replaces all underlying computer networking protocols",
        "It is an obsolete theoretical concept with no modern usage",
      ],
      correctIndex: 0,
      explanation: `${skillName} represents an active core competency applied in modern software engineering and data workflows.`,
    },
    {
      id: `fallback-${skillId}-q2`,
      skillId,
      question: `What is a recommended best practice when working with ${skillName}?`,
      options: [
        "Ignore error handling and telemetry",
        "Follow established architecture patterns, modular design, and robust testing",
        "Hardcode all credentials in public files",
        "Disable type checking and validation",
      ],
      correctIndex: 1,
      explanation: "Following established engineering standards, modular architecture, and validation ensures maintainability and reliability.",
    },
  ];
}
