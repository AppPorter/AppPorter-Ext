chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'Open with AppPorter',
    title: 'Open with AppPorter',
    contexts: ['link'],
  })
})

// Add menu click handler
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'Open with AppPorter' && info.linkUrl) {
    sendToServer(info.linkUrl)
  }
})

// WebSocket connection state
let isConnecting = false
let ws = null

// WebSocket connection function
async function connectWebSocket() {
  if (isConnecting) return null

  isConnecting = true
  const wsUrl = 'ws://127.0.0.1:7535'
  let socket = new WebSocket(wsUrl)

  try {
    await new Promise((resolve, reject) => {
      socket.addEventListener(
        'open',
        () => {
          console.log('Connected to AppPorter WebSocket server')
          isConnecting = false
          resolve(socket)
        },
        { once: true }
      )

      socket.addEventListener(
        'error',
        () => {
          isConnecting = false
          reject(new Error('Connection failed'))
        },
        { once: true }
      )
    })

    return socket
  } catch (error) {
    isConnecting = false
    return null
  }
}

function showError(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'appporter.svg',
    title: 'AppPorter Error',
    message: message,
  })
}

// Send message with connection handling
async function sendToServer(data) {
  try {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = await connectWebSocket()
      if (!ws) {
        showError('Failed to connect to AppPorter server')
        return
      }
    }

    ws.send(data)
    console.log('Sent to server:', data)
  } catch (error) {
    showError('Failed to connect to AppPorter server')
    console.error('Connection error:', error)
  }
}
