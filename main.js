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
let ws = null

// WebSocket connection function
async function connectWebSocket() {
  if (isConnecting) return null

  isConnecting = true
  const wsUrl = 'ws://127.0.0.1:9002'
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
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icon-48.png',
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
