/**
 * Embedding comparison panel for analyzing similarity between selected embeddings
 */

import React from 'react'
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { EmbeddingData } from '../../types'
import { calculateAllMetrics, formatMetric, getMetricDescription, type SimilarityMetrics } from '../../utils/similarity'

export interface EmbeddingComparisonProps {
  embeddings: EmbeddingData[]
  onClose: () => void
}

interface ComparisonResult {
  embedding1: EmbeddingData
  embedding2: EmbeddingData
  metrics: SimilarityMetrics
}

export const EmbeddingComparison: React.FC<EmbeddingComparisonProps> = ({ embeddings, onClose }) => {
  const comparisons = React.useMemo(() => {
    const results: ComparisonResult[] = []

    // Generate pairwise comparisons
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        results.push({
          embedding1: embeddings[i],
          embedding2: embeddings[j],
          metrics: calculateAllMetrics(embeddings[i].vector, embeddings[j].vector)
        })
      }
    }

    return results
  }, [embeddings])

  if (embeddings.length < 2) {
    return (
      <div className="fixed bottom-4 right-4 w-96 bg-slate-900 opacity-100 border-2 border-slate-600 rounded-lg shadow-2xl p-4 z-50" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Embedding Comparison</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Close"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Select at least 2 embeddings to compare them.
        </p>
      </div>
    )
  }

  const getMetricIcon = (value: number, metric: keyof SimilarityMetrics) => {
    // For cosine similarity and dot product, higher is better
    if (metric === 'cosineSimilarity' || metric === 'dotProduct') {
      if (value > 0.9) return <TrendingUp size={14} className="text-green-400" />
      if (value > 0.7) return <Minus size={14} className="text-yellow-400" />
      return <TrendingDown size={14} className="text-red-400" />
    }

    // For distances, lower is better
    if (metric === 'euclideanDistance' || metric === 'manhattanDistance') {
      if (value < 1) return <TrendingUp size={14} className="text-green-400" />
      if (value < 5) return <Minus size={14} className="text-yellow-400" />
      return <TrendingDown size={14} className="text-red-400" />
    }

    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-[500px] max-h-[600px] bg-slate-900 opacity-100 border-2 border-slate-600 rounded-lg shadow-2xl flex flex-col z-50" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
      <div className="flex items-start justify-between p-4 border-b border-slate-700 bg-slate-900 opacity-100" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
        <div>
          <h3 className="text-sm font-semibold text-white">Embedding Comparison</h3>
          <p className="text-xs text-slate-400 mt-1">
            {embeddings.length} embeddings · {comparisons.length} comparison{comparisons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          title="Close"
        >
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 opacity-100" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
        {comparisons.map((comparison, idx) => (
          <div key={idx} className="bg-slate-800 opacity-100 rounded-lg p-3 border border-slate-600" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">
                <span className="font-semibold text-blue-400">A:</span> {comparison.embedding1.inputText.substring(0, 50)}
                {comparison.embedding1.inputText.length > 50 && '...'}
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-purple-400">B:</span> {comparison.embedding2.inputText.substring(0, 50)}
                {comparison.embedding2.inputText.length > 50 && '...'}
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(comparison.metrics).map(([metric, value]) => (
                <div key={metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(value, metric as keyof SimilarityMetrics)}
                    <span className="text-xs text-slate-300" title={getMetricDescription(metric as keyof SimilarityMetrics)}>
                      {metric === 'cosineSimilarity' && 'Cosine Similarity'}
                      {metric === 'euclideanDistance' && 'Euclidean Distance'}
                      {metric === 'dotProduct' && 'Dot Product'}
                      {metric === 'manhattanDistance' && 'Manhattan Distance'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-white">
                    {formatMetric(value, metric as keyof SimilarityMetrics)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-950 opacity-100" style={{ backgroundColor: 'rgb(2, 6, 23)' }}>
        <div className="text-xs text-slate-400 space-y-1">
          <div><strong className="text-slate-300">Cosine Similarity:</strong> 1 = identical, 0 = unrelated</div>
          <div><strong className="text-slate-300">Distances:</strong> Lower values = more similar</div>
        </div>
      </div>
    </div>
  )
}
