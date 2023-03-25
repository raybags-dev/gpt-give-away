'use strict'
import { TOGGLE_THEME } from './themes.js'
import {
  SIGNUP,
  LOGIN,
  INITIALIZER,
  handleQuestionFormSubmit,
  FETCH_DATA
} from './heavy_lift.js'
const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login___form')
const logoutButton = document.querySelector('.log_out_btn')

TOGGLE_THEME()
// Initial setup
INITIALIZER()
// Signup handler
SIGNUP(signupForm)
// Login handler
LOGIN(loginForm)

// logout user
const LOGOUT = e => {
  console.log(e)
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
}
logoutButton?.addEventListener('click', LOGOUT)
// call usage modle
// ask question
handleQuestionFormSubmit()
FETCH_DATA()
