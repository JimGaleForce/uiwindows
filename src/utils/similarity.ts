/**
 * Vector similarity calculation utilities for embedding comparison
 * From AIU implementation - enables semantic analysis of chat messages
 */

export interface SimilarityMetrics {
  cosineSimilarity: number
  euclideanDistance: number
  dotProduct: number
  manhattanDistance: number
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical direction
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Calculate Euclidean distance between two vectors
 * Lower values indicate more similar vectors (0 = identical)
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

/**
 * Calculate dot product of two vectors
 * Higher values indicate more similarity
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let product = 0
  for (let i = 0; i < a.length; i++) {
    product += a[i] * b[i]
  }

  return product
}

/**
 * Calculate Manhattan distance (L1 norm) between two vectors
 * Lower values indicate more similar vectors (0 = identical)
 */
export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i])
  }

  return sum
}

/**
 * Calculate all similarity metrics between two vectors
 */
export function calculateAllMetrics(a: number[], b: number[]): SimilarityMetrics {
  return {
    cosineSimilarity: cosineSimilarity(a, b),
    euclideanDistance: euclideanDistance(a, b),
    dotProduct: dotProduct(a, b),
    manhattanDistance: manhattanDistance(a, b)
  }
}

/**
 * Format a metric value for display
 */
export function formatMetric(value: number, metric: keyof SimilarityMetrics): string {
  switch (metric) {
    case 'cosineSimilarity':
      return value.toFixed(6)
    case 'euclideanDistance':
    case 'manhattanDistance':
      return value.toFixed(4)
    case 'dotProduct':
      return value.toFixed(2)
    default:
      return value.toFixed(4)
  }
}

/**
 * Get human-readable description of metric
 */
export function getMetricDescription(metric: keyof SimilarityMetrics): string {
  switch (metric) {
    case 'cosineSimilarity':
      return 'Cosine Similarity (1 = identical direction, 0 = orthogonal, -1 = opposite)'
    case 'euclideanDistance':
      return 'Euclidean Distance (0 = identical, lower is more similar)'
    case 'dotProduct':
      return 'Dot Product (higher = more similar)'
    case 'manhattanDistance':
      return 'Manhattan Distance (0 = identical, lower is more similar)'
    default:
      return ''
  }
}
