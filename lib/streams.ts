// Real-time streaming architecture for microservice communication
// Uses Postgres LISTEN/NOTIFY for pub-sub messaging between services

export const STREAM_CHANNELS = {
  // LCI Service Events
  LCI_MAPPED: "lca.lci.mapped",
  LCI_VALIDATED: "lca.lci.validated",
  LCI_UPDATED: "lca.lci.updated",
  
  // Data Quality Service Events  
  QUALITY_PASSED: "lca.quality.passed",
  QUALITY_FAILED: "lca.quality.failed",
  QUALITY_WARNING: "lca.quality.warning",
  
  // LCIA Service Events
  LCIA_STARTED: "lca.lcia.started",
  LCIA_PROGRESS: "lca.lcia.progress",
  LCIA_COMPLETED: "lca.lcia.completed",
  LCIA_FAILED: "lca.lcia.failed",
  
  // Report Service Events
  REPORT_REQUESTED: "lca.report.requested",
  REPORT_PROGRESS: "lca.report.progress",
  REPORT_RENDERED: "lca.report.rendered",
  REPORT_FAILED: "lca.report.failed",
  
  // Project Service Events
  PROJECT_CREATED: "lca.project.created",
  PROJECT_UPDATED: "lca.project.updated",
  PROJECT_DELETED: "lca.project.deleted",
  
  // File Service Events
  FILE_UPLOADED: "lca.file.uploaded",
  FILE_PROCESSED: "lca.file.processed",
  FILE_FAILED: "lca.file.failed",
} as const

export type StreamChannel = (typeof STREAM_CHANNELS)[keyof typeof STREAM_CHANNELS]

interface StreamMessage {
  channel: StreamChannel
  projectId: string
  timestamp: string
  data: any
  messageId: string
}

interface StreamSubscription {
  channel: StreamChannel
  callback: (message: StreamMessage) => void
  unsubscribe: () => void
}

// Global subscription registry
const subscriptions = new Map<string, StreamSubscription>()

// WebSocket connection for real-time streaming (fallback from Postgres LISTEN)
let wsConnection: WebSocket | null = null
const WS_URL = process.env.NEXT_PUBLIC_STREAM_WS_URL || "ws://localhost:8080/stream"

// Initialize WebSocket connection for streaming
function initializeWebSocket(): void {
  if (typeof window === 'undefined') return // Server-side guard
  
  try {
    wsConnection = new WebSocket(WS_URL)
    
    wsConnection.onopen = () => {
      console.log('[STREAM] WebSocket connected')
      
      // Resubscribe to all active channels
      subscriptions.forEach((sub) => {
        wsConnection?.send(JSON.stringify({
          type: 'subscribe',
          channel: sub.channel
        }))
      })
    }
    
    wsConnection.onmessage = (event) => {
      try {
        const message: StreamMessage = JSON.parse(event.data)
        console.log(`[STREAM] Received message on ${message.channel}:`, message)
        
        // Find and call relevant subscription callbacks
        subscriptions.forEach((sub) => {
          if (sub.channel === message.channel) {
            sub.callback(message)
          }
        })
      } catch (error) {
        console.error('[STREAM] Error parsing message:', error)
      }
    }
    
    wsConnection.onclose = () => {
      console.log('[STREAM] WebSocket disconnected, attempting reconnect...')
      setTimeout(initializeWebSocket, 5000) // Reconnect after 5 seconds
    }
    
    wsConnection.onerror = (error) => {
      console.error('[STREAM] WebSocket error:', error)
    }
  } catch (error) {
    console.error('[STREAM] Failed to initialize WebSocket:', error)
  }
}

// Subscribe to a stream channel
export function subscribe(channel: StreamChannel, callback: (message: StreamMessage) => void): () => void {
  const subscriptionId = `${channel}-${Date.now()}-${Math.random()}`
  
  console.log(`[STREAM] Subscribing to ${channel}`)
  
  // Create subscription object
  const subscription: StreamSubscription = {
    channel,
    callback,
    unsubscribe: () => {
      console.log(`[STREAM] Unsubscribing from ${channel}`)
      subscriptions.delete(subscriptionId)
      
      // Send unsubscribe message via WebSocket
      if (wsConnection?.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'unsubscribe',
          channel
        }))
      }
    }
  }
  
  subscriptions.set(subscriptionId, subscription)
  
  // Initialize WebSocket if not already connected
  if (!wsConnection || wsConnection.readyState === WebSocket.CLOSED) {
    initializeWebSocket()
  }
  
  // Send subscribe message via WebSocket
  if (wsConnection?.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify({
      type: 'subscribe',
      channel
    }))
  }
  
  // Return unsubscribe function
  return subscription.unsubscribe
}

// Unsubscribe from a stream channel
export function unsubscribe(channel: StreamChannel): void {
  console.log(`[STREAM] Unsubscribing from all ${channel} subscriptions`)
  
  // Remove all subscriptions for this channel
  const toRemove: string[] = []
  subscriptions.forEach((sub, id) => {
    if (sub.channel === channel) {
      toRemove.push(id)
    }
  })
  
  toRemove.forEach(id => subscriptions.delete(id))
  
  // Send unsubscribe message via WebSocket
  if (wsConnection?.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify({
      type: 'unsubscribe',
      channel
    }))
  }
}

// Publish a message to a stream channel (for testing/development)
export function publish(channel: StreamChannel, projectId: string, data: any): void {
  if (wsConnection?.readyState === WebSocket.OPEN) {
    const message: StreamMessage = {
      channel,
      projectId,
      timestamp: new Date().toISOString(),
      data,
      messageId: `msg-${Date.now()}-${Math.random()}`
    }
    
    wsConnection.send(JSON.stringify({
      type: 'publish',
      message
    }))
    
    console.log(`[STREAM] Published message to ${channel}:`, message)
  }
}

// Get connection status
export function getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
  if (!wsConnection) return 'disconnected'
  
  switch (wsConnection.readyState) {
    case WebSocket.OPEN: return 'connected'
    case WebSocket.CONNECTING: return 'connecting'
    default: return 'disconnected'
  }
}

// Close all connections and subscriptions
export function cleanup(): void {
  console.log('[STREAM] Cleaning up all subscriptions and connections')
  
  subscriptions.clear()
  
  if (wsConnection) {
    wsConnection.close()
    wsConnection = null
  }
}

// Hook for React components to manage subscriptions
export function useStreamSubscription(
  channel: StreamChannel, 
  callback: (message: StreamMessage) => void,
  dependencies: any[] = []
) {
  if (typeof window === 'undefined') return // Server-side guard
  
  const { useEffect } = require('react')
  
  useEffect(() => {
    const unsubscribeFn = subscribe(channel, callback)
    return unsubscribeFn
  }, [channel, ...dependencies])
}
