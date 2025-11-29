const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because"
];

const CODE_WORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "try", "catch", "throw", "finally",
  "class", "extends", "super", "this", "new", "import", "export", "default",
  "null", "undefined", "true", "false", "NaN", "Infinity", "async", "await",
  "promise", "resolve", "reject", "map", "filter", "reduce", "forEach", "find",
  "push", "pop", "shift", "unshift", "splice", "slice", "split", "join",
  "string", "number", "boolean", "object", "array", "symbol", "bigint",
  "interface", "type", "enum", "implements", "public", "private", "protected",
  "static", "readonly", "abstract", "namespace", "module", "declare", "as"
];

const COMPLEX_WORDS = [
  "algorithm", "complexity", "structure", "implementation", "optimization",
  "performance", "scalability", "reliability", "availability", "consistency",
  "distribution", "concurrency", "parallelism", "synchronization", "deadlock",
  "race", "condition", "mutex", "semaphore", "monitor", "atomic", "transaction",
  "isolation", "durability", "atomicity", "middleware", "framework", "library",
  "dependency", "injection", "inversion", "control", "container", "component",
  "service", "microservice", "monolith", "architecture", "pattern", "design",
  "system", "interface", "abstraction", "encapsulation", "inheritance",
  "polymorphism", "composition", "aggregation", "association", "delegation"
];

export type Difficulty = 'easy' | 'medium' | 'hard';

export const generateWords = (difficulty: Difficulty, count: number): string => {
  let pools: string[] = [];

  switch (difficulty) {
    case 'easy':
      pools = [...COMMON_WORDS];
      break;
    case 'medium':
      pools = [...COMMON_WORDS, ...CODE_WORDS];
      break;
    case 'hard':
      pools = [...CODE_WORDS, ...COMPLEX_WORDS];
      break;
  }

  const words: string[] = [];
  let lastWord = '';

  for (let i = 0; i < count; i++) {
    let word = pools[Math.floor(Math.random() * pools.length)];
    while (word === lastWord) {
      word = pools[Math.floor(Math.random() * pools.length)];
    }
    words.push(word);
    lastWord = word;
  }

  return words.join(' ');
};
