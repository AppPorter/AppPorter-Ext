;(function () {
  // Check for dark mode preference before page loads
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    // Apply dark class immediately
    document.documentElement.classList.add('dark')
  }
})()

// Theme maintenance part: Keep theme updated and listen for changes
document.addEventListener('DOMContentLoaded', function () {
  // Function to update theme based on system preference
  function updateTheme() {
    const isDarkMode =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Update GitHub icon based on theme
    const githubIcon = document.getElementById('github-icon')
    if (githubIcon) {
      githubIcon.src = isDarkMode
        ? 'assets/github-mark-white.svg'
        : 'assets/github-mark.svg'
    }
  }

  // Add click handler to GitHub link to close popup
  const githubLink = document.getElementById('github-link')
  if (githubLink) {
    githubLink.addEventListener('click', function (event) {
      // Prevent default link behavior
      event.preventDefault()

      // Get the href attribute
      const url = this.getAttribute('href')

      // Open link in new tab
      chrome.tabs.create({ url: url })

      // Close the popup immediately
      window.close()
    })
  }

  // Initial theme check (redundant but keeping for safety)
  updateTheme()

  // Listen for changes in system theme
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', updateTheme)
})
