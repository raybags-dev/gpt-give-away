import { RESPONSE_HTML } from './components.js'
import { formatDate } from './handlers.js'

const api = axios.create({
  baseURL: '/raybags/v1/wizard',
  timeout: 10000
})
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401 && data.error === 'Invalid token') {
        // Redirect to login page
        sessionStorage.removeItem('token')
        window.location.href = '../login.html'
      }
    }
    return Promise.reject(error)
  }
)

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
// Main page loader
function runLoader (isDone) {
  const loader = document.querySelector('#main-page-loader')
  if (!isDone) {
    if (!loader) {
      const loaderHTML = `
        <div id="main-page-loader" class="d-flex align-items-center text-transparent justify-content-center"
          style="position:fixed; top:0; left:0; right:0; bottom:0;z-index:3000">
          <div class="d-flex">
            <h3 class="fs-4" id="my_text" style="position:absolute;top:50%;opacity:.7;left:50%;transform:translate(-50%, -50%);">
              Processing...
            </h3>
            <span class="loader text-white" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);"></span>
          </div>
        </div>
      `
      const wrapper = document.querySelector('#main__wrapper')
      wrapper.insertAdjacentHTML('beforeend', loaderHTML)
    }
  } else {
    if (loader) {
      loader.remove()
    }
  }
}
// signup def
function SIGNUP (signupForm) {
  signupForm?.addEventListener('submit', async event => {
    event.preventDefault()
    const formData = new FormData(signupForm)
    const user = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    }
    try {
      runLoader(false)
      let url = '/users'
      const response = await api.post(url, user, {
        headers: { 'Content-Type': 'application/json' }
      })
      const { data, status } = await response
      const { email, name } = data.user

      if (status === 201) {
        runLoader(true)
        const storedUser = { name, email, isUser: true }
        localStorage.setItem('user', JSON.stringify(storedUser))

        showNotification(
          'Success',
          `Hi ${storedUser.name}. Your account has been created`
        )
        setTimeout(() => {
          runLoader(true)
          window.location.href = '/html/login.html'
        }, 5000)
        return
      }
      showNotification('Error', 'Something went wrong, try again later.')
      setTimeout(() => runLoader(true), 3000)
    } catch (error) {
      if (error.response.status == 409) {
        showNotification(
          'Account exists!',
          `It'd seem you already have an account. You'll be redirected to login page`
        )
        sessionStorage.setItem('redirected', true)
        setTimeout(() => {
          runLoader(true)
          window.location.href = '/html/login.html'
        }, 3000)
        return
      }
      showNotification('Error', 'Failed to create user.')
      setTimeout(() => runLoader(true), 3000)
    }
  })
}
// login def
function LOGIN (loginForm) {
  loginForm?.addEventListener('submit', async event => {
    event.preventDefault()
    const formData = new FormData(loginForm)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      let url = '/login'
      const response = await api.post(url, { email, password })

      const token = response.headers.authorization.split(' ')[1]
      sessionStorage.setItem('token', JSON.stringify({ token, email }))
      // Redirect to main page
      sessionStorage.setItem('redirected', true)
      showNotification('Success', `You have successfully logged in.`)
      setTimeout(() => {
        runLoader(true)
        window.location.href = '../index.html'
      }, 3000)
    } catch (error) {
      runLoader(false)
      const errorMessage =
        error.response.data.error || 'An error occurred during login'
      showNotification('Error', `Credentials not recognized - ${errorMessage}.`)
      setTimeout(() => runLoader(true), 3000)
    }
  })
}
function INITIALIZER () {
  window.addEventListener('load', () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const token = JSON.parse(sessionStorage.getItem('token'))
    const redirected = sessionStorage.getItem('redirected')

    if (!redirected && !user && !token) {
      sessionStorage.setItem('redirected', true)
      window.history.pushState(null, null, '/html/signup.html')
      window.location.href = '/html/signup.html'
    } else if (!redirected && user) {
      sessionStorage.setItem('redirected', true)
      window.history.pushState(null, null, '/html/login.html')
      window.location.href = '/html/login.html'
    }
  })
}
// ========== QUETION HANDLER ==================
function handleQuestionFormSubmit () {
  const question_formm = document.getElementById('question____form')
  const input = document.querySelector('#qn-inpuut')
  const button = document.querySelector('#message__btn')

  input?.addEventListener('input', () => {
    const inputLength = input.value.trim().length
    button.disabled = inputLength < 5
  })

  question_formm?.addEventListener('submit', async event => {
    runLoader(false)
    event.preventDefault()
    const data = input.value.trim()

    if (!data) {
      showNotification(
        'Ohhh did you forget ?',
        'You must ask a valid question '
      )
      input.focus()
      return
    }

    button.disabled = true
    button.textContent = 'Sending...'

    try {
      const email = JSON.parse(sessionStorage.getItem('token')).email
      const token = JSON.parse(sessionStorage.getItem('token')).token
      let url = '/ask-me'
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      const res = await api.post(url, { data, email }, { headers })

      if (res.status == 200 && res.statusText == 'OK') {
        const page = 1
        const perPage = 10
        url = '/data'
        const query = { page, perPage, email }
        const response = await api.post(url, query, { headers })
        const latestQuestion = response.data.data[0]
        RESPONSE_HTML(
          latestQuestion._id,
          formatDate(latestQuestion.createdAt),
          latestQuestion.question,
          latestQuestion.response,
          latestQuestion.response,
          latestQuestion.updatedAt,
          true // set as latest question with expandable summary
        )

        question_formm.reset()
        runLoader(true)
        return
      }
      showNotification(
        'Hi there.',
        'Its me your AI assistant. I feel a little sleepy at this time. But lets try again. Hit me. '
      )
    } catch (error) {
      console.log(error)
      showNotification('Oops', 'Something went wrong. Try again lattter')
      runLoader(true)
    } finally {
      button.disabled = false
      button.textContent = 'Send Message'
      input.focus()
    }
  })
}
async function FETCH_DATA () {
  try {
    // Check if user is logged in
    if (!sessionStorage.getItem('token')) {
      return
    }

    // Check if user is on main page
    if (window.location.pathname !== '/index.html') {
      return
    }
    // Get the email and token from sessionStorage
    const { email, token } = JSON.parse(sessionStorage.getItem('token'))
    // Set the endpoint URL
    const url = '/data/documents-all'
    // Set the pagination parameters
    const page = 1
    const perPage = 10
    // Set the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    // Set the request body
    const body = { email }
    // Send the POST request
    const res = await api.post(url, body, {
      headers,
      params: { page, perPage }
    })
    if (res.statusText == 'OK') {
      const { data } = await res.data
      data.forEach(async obj => {
        const { _id, question, response, updatedAt, createdAt } = await obj
        RESPONSE_HTML(
          _id,
          formatDate(createdAt),
          question,
          response,
          response,
          updatedAt
        )
      })
      return
    }
    showNotification(
      '....',
      'Something went wrong. Try to ask your question again'
    )
  } catch (error) {
    if (
      error?.response.data == 'Sorry I have nothing for you!' ||
      error?.response.status == 404
    ) {
      return showNotification(
        'Your in.',
        'You dont seem to have any documents in the database.'
      )
    } else {
      console.log(error)
    }
  }
}

export {
  SIGNUP,
  showNotification,
  runLoader,
  LOGIN,
  INITIALIZER,
  handleQuestionFormSubmit,
  FETCH_DATA
}
