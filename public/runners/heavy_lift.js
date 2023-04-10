import { RESPONSE_HTML } from './components.js'
import {
  formatDate,
  formatEmail,
  DELETE_USERDOCS,
  handleSessionError
} from './handlers.js'

const api = axios.create({
  baseURL: '/raybags/v1/wizard',
  timeout: 70000
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
function showNotification (message = '...') {
  // Check if a notification already exists and remove it
  const existingNotification = document.getElementById('notifications')
  if (existingNotification) {
    existingNotification.remove()
  }
  // Create the new notification element
  const notification = document.createElement('div')
  notification.id = 'notifications'
  notification.className =
    'alert alert-transparent p-1 rounded showNotification'
  notification.setAttribute('role', 'alert')
  notification.style.cssText =
    'min-width:fit-content;font-size:0.8rem;font-style:italic;'
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
function runLoader (isDone, message = 'Processing...') {
  const loader = document.querySelector('#main-page-loader')
  if (!isDone) {
    if (!loader) {
      const loaderHTML = `
        <div id="main-page-loader" class="d-flex align-items-center text-transparent justify-content-center"
          style="position:fixed; top:0; left:0; right:0; bottom:0;z-index:3000">
          <div class="d-flex">
            <h3 class="fs-4" id="my_text" style="position:absolute;top:50%;opacity:.7;left:50%;transform:translate(-50%, -50%);">
              ${message}
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

        showNotification(`Account for '${storedUser.name}' created.`)
        setTimeout(() => {
          runLoader(true)
          window.location.href = '/html/login.html'
        }, 5000)
        return
      }
      showNotification('Something went wrong, try again later.')
      setTimeout(() => runLoader(true), 3000)
    } catch (error) {
      let err_msg = error.response.data.error

      // Check if error message contains duplication error
      if (
        err_msg?.includes('E11000 duplicate key error') &&
        err_msg?.includes('index')
      ) {
        // Check if error message contains email or username
        if (err_msg?.includes('email') || err_msg?.includes('name')) {
          showNotification('Account already exists.')
          setTimeout(() => {
            runLoader(true)
            window.location.href = '/html/login.html'
          }, 3000)
          return
        }
      }
      showNotification('Failed to create user.')
      setTimeout(() => runLoader(true), 3000)
    }
  })
}
// login def
function LOGIN (loginForm) {
  loginForm?.addEventListener('submit', async event => {
    runLoader(false, 'On it....')
    event.preventDefault()
    const formData = new FormData(loginForm)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      let url = '/login'
      const response = await api.post(url, { email, password })
      if (response.status == 200) {
        runLoader(true)
        const token = response.headers.authorization.split(' ')[1]
        sessionStorage.setItem('token', JSON.stringify({ token, email }))
        // Redirect to main page
        sessionStorage.setItem('redirected', true)
        showNotification(`Login successfull`)
        setTimeout(() => {
          runLoader(true)
          window.location.href = '../index.html'
        }, 3000)
      }
    } catch (error) {
      runLoader(false, 'Failed!')
      const errorMessage = error.response.data.error || 'An error occurred.'
      showNotification(`Credentials: ${errorMessage}.`)
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
      window.history.replaceState(null, null, '/html/signup.html')
      window.location.href = '/html/signup.html'
    } else if (!redirected && user) {
      sessionStorage.setItem('redirected', true)
      window.history.replaceState(null, null, '/html/login.html')
      window.location.href = '/html/login.html'
    }
  })
}
function handleQuestionFormSubmit () {
  const question_formm = document.getElementById('question____form')
  const input = document.querySelector('#qn-inpuut')
  const button = document.querySelector('#message__btn')

  const submitForm = async () => {
    runLoader(false)
    const data = input.value.trim()

    if (!data) {
      showNotification('Invalid input, you must ask a valid question ')
      runLoader(true)
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

      if (res.statusText == 'OK') {
        const page = 1
        const perPage = 10
        url = '/data/documents-all'
        const query = { page, perPage, email }
        const res = await api.post(url, query, { headers })
        const latestQuestion = res.data.data[0]
        const { createdAt, question, response, _id, updatedAt } = latestQuestion
        RESPONSE_HTML(
          formatEmail(email),
          formatDate(createdAt),
          question,
          response,
          response,
          updatedAt,
          _id
        )
        question_formm.reset()
        runLoader(true)
      }
    } catch (error) {
      if (error.response.status === 429) {
        showNotification('Server is down, try again later.')
        button.disabled = false
        button.textContent = 'Send Message'
        input.focus()
        runLoader(true)
      }
      showNotification('Failed, try again lattter')
      runLoader(true)
    } finally {
      button.disabled = false
      button.textContent = 'Send Message'
      input.focus()
    }
  }

  input?.addEventListener('input', () => {
    const inputLength = input.value.trim().length
    button.disabled = inputLength < 5
  })

  question_formm?.addEventListener('submit', event => {
    event.preventDefault()
    submitForm()
  })

  button?.addEventListener('click', event => {
    event.preventDefault()
    submitForm()
  })
}
async function FETCH_DATA () {
  runLoader(false, 'Loading...')
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
      runLoader(true)
      const { data } = await res.data
      data.forEach(async (obj, index) => {
        const { _id, question, response, updatedAt, createdAt, user } =
          await obj
        RESPONSE_HTML(
          formatEmail(email),
          formatDate(createdAt),
          question,
          response,
          response,
          updatedAt,
          _id
        )
        const responses = document.querySelectorAll('.card')
        const lastIndex = responses.length - 1
        if (index === lastIndex) {
          responses[lastIndex].classList.add('bring_in')
        }
      })
      return
    }
    showNotification('Something went wrong. Try to ask your question again')
  } catch (error) {
    if (
      error?.response.data == 'Sorry I have nothing for you!' ||
      error?.response.status == 404
    ) {
      runLoader(true)
      console.warn(error.message)
      return showNotification('You dont have any saved documents.')
    }

    if (error?.response.status == 401) {
      showNotification('Session expired, please login.')
      setTimeout(() => {
        runLoader(true)
        window.history.replaceState(null, null, '/html/login.html')
        window.location.href = '../html/login.html'
      }, 3000)
    }
    if (error?.response.status == 404) {
      showNotification('Account not found. Please sign up.')
      setTimeout(() => {
        runLoader(true)
        window.history.replaceState(null, null, '/html/signup.html')
        window.location.href = '../html/signup.html'
      }, 3000)
    }
    console.warn(error.message)
  } finally {
    runLoader(true)
  }
}
async function searchDatabase (e) {
  e?.preventDefault()

  const searchingInput = document.querySelector('#search____input')
  const container_res = document.querySelector('#RES_container')
  let inputValue = searchingInput?.value.trim().toLowerCase()

  if (!sessionStorage.getItem('token')) return handleSessionError()
  if (window.location.pathname !== '/index.html') return

  try {
    runLoader(false, 'Searching...')
    const { email, token } = JSON.parse(sessionStorage.getItem('token'))
    let url = '/data/user-docs'
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    const body = { email }
    const res = await api.post(url, body, { headers })

    if (res.statusText === 'OK') {
      runLoader(true)
      const { data } = await res
      let hasResults = false
      // clear the contents of the container_res before appending search results
      container_res.innerHTML = ''
      data.documents.forEach((obj, index) => {
        const { _id, question, response, updatedAt, createdAt, user } = obj
        const toLowerQn = question.toLowerCase()
        const toLowerRes = response.toLowerCase()

        if (
          inputValue === '' ||
          toLowerQn.includes(inputValue) ||
          toLowerRes.includes(inputValue)
        ) {
          RESPONSE_HTML(
            formatEmail(email),
            formatDate(createdAt),
            question,
            response,
            response,
            updatedAt,
            user
          )
          hasResults = true
          const responses = document.querySelectorAll('.card')
          const lastIndex = responses.length - 1

          if (index === lastIndex) {
            responses[lastIndex].classList.add('bring_in')
          }
        } else {
          const card = document.querySelector(`[data-id="${_id}"]`)
          if (card) {
            card.classList.add('hide')
          }
        }
      })
      if (!hasResults) {
        showNotification(`No results found for "${inputValue}"`)
      }
    }
  } catch (error) {
    if (error.response.status === 404)
      return showNotification(`You dont have documents to search from.`)

    console.log(error)
  } finally {
    runLoader(true)
  }
}
async function fetchData (page = 1) {
  const sessionToken = sessionStorage.getItem('token')
  if (!sessionToken) return handleSessionError()

  const { email, token } = JSON.parse(sessionStorage.getItem('token'))
  const url = '/data/documents-all'
  const perPage = 10
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  const body = { email }
  const res = await api.post(url, body, {
    headers,
    params: { page, perPage }
  })
  if (res.statusText == 'OK') {
    return res.data.data
  } else {
    console.warn('Failed to fetch data')
  }
}

// call database on scroll
function fetchAndPaginateData () {
  let page = 1
  const container = document.querySelector('#RES_container')

  setTimeout(() => {
    if (!container) return
    const token = sessionStorage.getItem('token')
    if (!token) return handleSessionError('Your session has expired')

    const { email } = JSON.parse(sessionStorage.getItem('token'))

    let loading = false
    let target = container?.children[container.children.length - 2]

    const observer = new IntersectionObserver(async entries => {
      const lastEntry = entries[entries.length - 1]

      if (lastEntry.isIntersecting && !loading) {
        runLoader(false, 'Loading...')
        loading = true
        try {
          const data = await fetchData(++page)
          if (data.length) {
            data.forEach((obj, index) => {
              const { _id, question, response, updatedAt, createdAt } = obj
              RESPONSE_HTML(
                formatEmail(email),
                formatDate(createdAt),
                question,
                response,
                response,
                updatedAt,
                _id
              )
              const responses = document.querySelectorAll('.card')
              const lastIndex = responses.length - 1
              if (index === lastIndex) {
                responses[lastIndex].classList.add('bring_in')
              }
            })
            setTimeout(() => runLoader(true), 1000)

            if (data.length < 10) {
              showNotification(`Last page: ${page}`)
              observer.unobserve(target)
            } else {
              loading = false
              target = container.children[container.children.length - 2]
            }
          }
        } catch (error) {
          console.warn(error.message)
        } finally {
          runLoader(true)
        }
      }
    })
    const responses = document.querySelectorAll('.card')
    if (responses.length >= 10) {
      // Only start observing when there are at least 10 items on the first page
      observer.observe(target)
    }
  }, 1000)
}
fetchAndPaginateData()

function createProfileCard (
  username = 'name placeholder',
  email = 'email placeholder',
  createdAt = 'time placeholder',
  userId = 'user id placeholder'
) {
  const html = `
  <div class="container prof_cont">
    <div id="profilePic" class="card mb-3 shadow rounded bg-transparent"
        style="max-width:700px; width:80vw; padding:1rem; border-radius:.7rem !important;">
        <div class="container">
            <div class="container">
                <i id="icon-pl-prof" class="fa-solid fa-user img-fluid rounded-start"></i>
            </div>
                <div class="card-body">
                    <p class="lead text-danger">Name: <span class="text-light">${username}</span></p>
                    <p class="lead text-danger">Eail: <span class="text-light">${email}</span></p>
                    <p class="lead text-danger">Date: <span class="text-light">${createdAt}</span></p>
                    <p class="lead text-danger">UserId: <span class="text-light">${userId}</span></p>
                    <p class="lead text-danger">Documents:<span id="doc_count_" class="text-light"></span></p>
                </div>
                <div id="prof_btn_container" class="container d-flex container-fluid">
                    <a id="prof___delete" href="#"
                        class="btn btn-transparent flex-grow-1 m-1 pb-1 float-end text-danger text-muted btn-outline-danger">Delete
                        Me</a>
                    <a id="prof___remove"  href="#" class="btn m-1 btn-transparent flex-grow-1 text-red  btn-outline-secondary">Done
                        here</a>
                </div>
        </div>
    </div>
  </div>
`
  const container = document.createElement('div')
  container.innerHTML = html.trim()
  const navEle = document.querySelector('nav')
  navEle.parentNode.insertBefore(container.firstChild, navEle.nextSibling)
}
// delete card profile from DOM
function removeProfileCard () {
  let profileContainer = document.querySelector('.prof_cont')
  if (profileContainer) return profileContainer.remove()
  return
}

const p_profBtn = document.querySelector('#fetch_prof_link')
p_profBtn?.addEventListener('click', async () => {
  runLoader(false)
  // Get the email and token from sessionStorage
  const { email, token } = JSON.parse(sessionStorage.getItem('token'))
  const url = '/get-profile'
  const url_doc_count = '/data/user-docs'
  // Set the request headers
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  const body = { email }

  // Send the POST request
  let profile_response = await api.post(url, body, { headers })
  let doc_count_response

  try {
    doc_count_response = await api.post(url_doc_count, body, { headers })
  } catch (error) {
    console.warn(error.message)
    doc_count_response = { data: { count: 0 } }
  }

  if (profile_response.statusText === 'OK') {
    const { createdAt, email, name, _id } = await profile_response.data.user
    const doc_count = await doc_count_response.data.count
    createProfileCard(name, email, createdAt, _id, 0) // Start from 1
    runLoader(true)

    let closeProfBtn = document.querySelector('#prof___remove')
    let deleteProf = document.querySelector('#prof___delete')
    closeProfBtn?.addEventListener('click', () => removeProfileCard())

    deleteProf?.addEventListener('click', async () => {
      try {
        removeProfileCard()
        runLoader(false)
        setTimeout(async () => await DELETE_USERDOCS(), 2000)
      } catch (e) {
        console.warn(e.message)
      }
    })

    // Animate the document count
    let i = 1
    const interval = setInterval(() => {
      const docCountEl = document.querySelector(`#doc_count_`)
      if (i > doc_count) {
        clearInterval(interval)
      } else {
        docCountEl.innerText = ` ${i.toLocaleString()}`
        i++
      }
    }, 50)
  }
})

export {
  api,
  SIGNUP,
  showNotification,
  runLoader,
  LOGIN,
  INITIALIZER,
  handleQuestionFormSubmit,
  FETCH_DATA,
  searchDatabase
}
