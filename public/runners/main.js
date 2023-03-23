'use strict'
import { TOGGLE_THEME } from './themes.js'
import { showNotification } from './heavy_lift.js'
import { QN_FACTORY, RESPONSE_FACTORY } from './components.js'
const mainRrwapper = document.querySelector('#main__wrapper')
TOGGLE_THEME()

const handleSubmit = async e => {
  try {
    e.preventDefault()
    let question_text = textArea.value
    if (!question_text)
      return showNotification('Missing input.', 'Input value ust not be empty')

    sendButton.innerText = 'Processing...'
    await postFetch(question_text)
    sendButton.innerText = 'submit question'
    form.reset()
  } catch (e) {
    console.log('An error occurred:', e.message)
    showNotification(
      'Error',
      `Something went wrong:\n ${e.message} `,
      '#nav_barrr'
    )
  }
}

// QN_FACTORY()
// RESPONSE_FACTORY()
// showNotification('testing', 'testing')
