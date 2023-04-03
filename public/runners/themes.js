const TOGGLE_THEME = async () => {
  try {
    const body = document.querySelector('body')
    const navBar = document.querySelector('.navbar')
    const toggler = document.querySelector('#theme-toggle')
    const dropdown = document.querySelector('#drop_menu')
    let currentTheme = localStorage.getItem('theme')

    if (!currentTheme) currentTheme = 'light'

    body.classList.add(`bg-${currentTheme}`)
    navBar?.classList.add(`navbar-${currentTheme}`)
    navBar?.classList.add(`bg-${currentTheme}`)
    dropdown?.classList.add(`dropdown-menu-${currentTheme}`)

    // Add card classes
    const cards = document.querySelectorAll('.card')
    let currentCardTheme = localStorage.getItem('cardTheme')

    if (!currentCardTheme) {
      currentCardTheme =
        currentTheme === 'dark'
          ? 'card-dark-background'
          : 'card-light-background'
    }

    cards?.forEach(card => {
      card?.classList.add(currentCardTheme)
    })

    if (currentTheme === 'dark') {
      toggler ? (toggler.checked = true) : false
    }

    toggler?.addEventListener('change', function (e) {
      if (e.target.checked) {
        body.classList.replace('bg-light', 'bg-dark')
        navBar?.classList.replace('navbar-light', 'navbar-dark')
        navBar?.classList.replace('bg-light', 'bg-dark')
        dropdown?.classList.replace('dropdown-menu-light', 'dropdown-menu-dark')
        localStorage?.setItem('theme', 'dark')

        // Add card classes
        const cards = document.querySelectorAll('.card')
        cards?.forEach(card => {
          card.classList.remove('card-light-background')
          card.classList.add('card-dark-background')
        })

        // Save card theme to localStorage
        localStorage.setItem('cardTheme', 'card-dark-background')
      } else {
        body.classList.replace('bg-dark', 'bg-light')
        navBar?.classList.replace('navbar-dark', 'navbar-light')
        navBar?.classList.replace('bg-dark', 'bg-light')
        dropdown?.classList.replace('dropdown-menu-dark', 'dropdown-menu-light')
        localStorage?.setItem('theme', 'light')

        // Add card classes
        const cards = document.querySelectorAll('.card')
        cards?.forEach(card => {
          card.classList.remove('card-dark-background')
          card.classList.add('card-light-background')
        })

        // Save card theme to localStorage
        localStorage.setItem('cardTheme', 'card-light-background')
      }
    })

    window.addEventListener('storage', function (e) {
      if (e.key === 'theme') {
        currentTheme = e.newValue
        body.classList.replace('bg-light', `bg-${currentTheme}`)
        navBar?.classList.replace('navbar-light', `navbar-${currentTheme}`)
        navBar?.classList.replace('bg-light', `bg-${currentTheme}`)

        dropdown?.classList.replace(
          'dropdown-menu-light',
          `dropdown-menu-${currentTheme}`
        )

        // Add card classes
        const cards = document.querySelectorAll('.card')
        cards?.forEach(card => {
          if (currentTheme === 'dark') {
            card.classList.remove('card-light-background')
            card.classList.add('card-dark-background')
          } else {
            card.classList.remove('card-dark-background')
            card.classList.add('card-light-background')
          }
        })

        if (currentTheme === 'dark') {
          toggler.checked = true
        } else {
          toggler.checked = false
        }
      }
    })
    // message input
    inputTheme()
  } catch (e) {
    console.log(e)
  }
}
// input theme
function inputTheme () {
  let message_input = document.querySelector('.Q_n_A_form')
  let toggle_btn = document.querySelector('#theme-toggle')

  let initial_theme = localStorage.getItem('input__theme')
  if (!initial_theme) initial_theme = '_light_'

  message_input?.classList.add(`input_group${initial_theme && initial_theme}`)
  toggle_btn?.addEventListener('change', function (e) {
    if (e.target.checked) {
      message_input?.classList.replace(
        'input_group_light_',
        'input_group_dark_'
      )
      localStorage.setItem('input__theme', '_dark_')
    } else {
      message_input?.classList.replace(
        'input_group_dark_',
        'input_group_light_'
      )
      localStorage.setItem('input__theme', '_light_')
    }
  })

  window.addEventListener('storage', function (e) {
    if (e.key === 'input__theme') {
      initial_theme = e.newValue
      message_input?.classList.replace(
        'input_group_light_',
        `input_group-${initial_theme}`
      )

      if (initial_theme === '_dark_') {
        toggle_btn.checked = true
      } else {
        toggle_btn.checked = false
      }
    }
  })
}

export { TOGGLE_THEME }
