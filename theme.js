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
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Initial theme check (redundant but keeping for safety)
  updateTheme()

  // Listen for changes in system theme
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', updateTheme)
})
