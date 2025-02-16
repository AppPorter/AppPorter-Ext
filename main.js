// Create context menu
browser.menus.create({
  id: 'Install and Subscribe',
  title: 'Install and Subscribe',
  contexts: ['link'],
})

// Add menu click handler
browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'Install and Subscribe' && info.linkUrl) {
    sendToServer(info.linkUrl)
  }
})

// WebSocket connection state
let isConnecting = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
let ws = null

// WebSocket connection function with improved retry logic
function connectWebSocket() {
  if (isConnecting) return null

  isConnecting = true
  const wsUrl = 'ws://127.0.0.1:9002'
  const ws = new WebSocket(wsUrl)

  const resetConnection = () => {
    isConnecting = false
    reconnectAttempts = 0
  }

  ws.addEventListener('open', (event) => {
    console.log('Connected to AppPorter WebSocket server')
    resetConnection()
  })

  ws.addEventListener('message', (event) => {
    const message = event.data
    console.log('Message from server:', message)
  })

  ws.addEventListener('close', (event) => {
    isConnecting = false
    ws = null
  })

  ws.addEventListener('error', (event) => {
    isConnecting = false
    ws = null
  })

  return ws
}

// Send message with connection handling
async function sendToServer(data) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = connectWebSocket()
    if (!ws) return

    // Wait for connection to be established
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Connection timeout')),
        5000
      )

      ws.addEventListener(
        'open',
        () => {
          clearTimeout(timeout)
          resolve()
        },
        { once: true }
      )

      ws.addEventListener(
        'error',
        () => {
          clearTimeout(timeout)
          reject(new Error('Connection failed'))
        },
        { once: true }
      )
    })
  }

  ws.send(data)
  console.log('Sent to server:', data)
}
