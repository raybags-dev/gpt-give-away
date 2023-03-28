'use strict'
import { TOGGLE_THEME } from './themes.js'
import { generateDeleteModel } from './handlers.js'
import {
  SIGNUP,
  LOGIN,
  INITIALIZER,
  handleQuestionFormSubmit,
  FETCH_DATA,
  runLoader,
  searchDatabase
} from './heavy_lift.js'
const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login___form')
const logoutButton = document.querySelector('.log_out_btn')
const deleteAccountBTN = document.querySelector('#del__btn')
const delSingleDocBtn = document.getElementById('delete__document')

TOGGLE_THEME()
// Initial setup
INITIALIZER()
// Signup handler
SIGNUP(signupForm)
// Login handler
LOGIN(loginForm)

// logout user
const LOGOUT = async e => {
  try {
    e.preventDefault()
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('redirected')

    // Redirect to login page if there is no token
    const token = JSON.parse(sessionStorage.getItem('token'))
    if (!token) {
      window.history.pushState(null, null, '../html/login.html')
      window.location.href = '../html/login.html'
    }
    window.history.pushState(null, null, '../html/login.html')
    window.location.href = '../html/login.html'
    window.addEventListener('popstate', () => {
      window.history.pushState(null, null, '../html/login.html')
    })

    sessionStorage.setItem('redirected', true)
  } catch (e) {
    console.log(e.message)
    runLoader(true)
  }
}

logoutButton?.addEventListener('click', LOGOUT)
// ask question
handleQuestionFormSubmit()
FETCH_DATA()
deleteAccountBTN?.addEventListener('click', () => {
  generateDeleteModel()
})
// search
const searchingInput = document.querySelector('#search____input')
let typingTimer = null
const doneTypingInterval = 300 // 300 millisecond delay

function inputEventHandler () {
  clearTimeout(typingTimer)
  typingTimer = setTimeout(searchDatabase, doneTypingInterval)
}

// Add an event listener to the input
searchingInput.addEventListener('input', inputEventHandler)
