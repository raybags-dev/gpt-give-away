function showNotification (heading, message) {
  // Check if a notification already exists and remove it
  const existingNotification = document.getElementById('notifications')
  if (existingNotification) {
    existingNotification.remove()
  }

  // Create the new notification element
  const notification = document.createElement('div')
  notification.id = 'notifications'
  notification.className = 'alert alert-transparent rounded showNotification'
  notification.setAttribute('role', 'alert')

  // Create the heading element and add it to the notification
  const headingElement = document.createElement('p')
  headingElement.className = 'lead'
  headingElement.innerText = heading || 'Nothing to see...'
  notification.appendChild(headingElement)

  // Create the message element and add it to the notification
  const messageElement = document.createElement('p')
  messageElement.innerText = message || 'Nothing to see...'
  notification.appendChild(messageElement)

  // Append the notification to the body
  document.body.appendChild(notification)

  // Wait 5 seconds and remove the showNotification class
  setTimeout(() => {
    notification.classList.remove('showNotification')

    // Wait for the animation to finish and remove the notification from the DOM
    setTimeout(() => {
      notification.remove()
    }, 500)
  }, 5000)
}

export { showNotification }
