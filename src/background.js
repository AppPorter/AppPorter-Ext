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

// Import crypto utilities
importScripts('crypto.js')

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
        async () => {
          console.log('Connected to AppPorter WebSocket server')

          // Send handshake message
          const handshakeMsg = JSON.stringify({ type: 'handshake' })
          socket.send(handshakeMsg)

          // Wait for handshake response
          socket.addEventListener(
            'message',
            (event) => {
              try {
                const response = JSON.parse(event.data)
                if (
                  response.type === 'handshake_response' &&
                  response.status === 'ready'
                ) {
                  console.log('Handshake completed successfully')
                  isConnecting = false
                  cryptoManager.setSessionKey(
                    response.session_key,
                    response.session_id
                  ) // Set session key and ID
                  resolve(socket)
                }
              } catch (e) {
                console.error('Handshake failed:', e)
                isConnecting = false
                reject(new Error('Handshake failed'))
              }
            },
            { once: true }
          )
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

// Send message with encryption
async function sendToServer(data) {
  try {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = await connectWebSocket()
      if (!ws) {
        showError('Failed to connect to AppPorter server')
        return
      }
    } // Encrypt the URL before sending
    const encrypted = await cryptoManager.encryptData(data)
    const message = JSON.stringify({
      type: 'encrypted_url',
      data: encrypted.data,
      nonce: encrypted.nonce,
      session_id: cryptoManager.getSessionId(),
    })

    ws.send(message)
    console.log('Sent encrypted data to server')

    // Listen for encrypted response
    ws.addEventListener(
      'message',
      async (event) => {
        try {
          const response = JSON.parse(event.data)
          if (response.type === 'encrypted_response') {
            const decryptedResponse = await cryptoManager.decryptData(
              response.data,
              response.nonce
            )
            console.log('Received encrypted response:', decryptedResponse)
          }
        } catch (e) {
          console.error('Failed to decrypt response:', e)
        }
      },
      { once: true }
    )
  } catch (error) {
    showError('Failed to send encrypted data to AppPorter server')
    console.error('Encryption or connection error:', error)
  }
}
