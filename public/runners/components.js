import { api, runLoader, showNotification } from './heavy_lift.js'
function RESPONSE_HTML (
  email,
  doc_generated,
  qn,
  res_summery,
  response,
  updatedAt,
  id
) {
  let res_sum =
    res_summery
      .trim()
      .replace(/^[\W]+/g, '')
      .split(' ')
      .slice(0, 3)
      .join(' ') + '...'
  const mainTheme = localStorage.getItem('theme')
  const resContainer = document.querySelector('#RES_container')
  const newResponse = document.createElement('div')
  const cardClass =
    mainTheme === 'dark' ? 'card-dark-background' : 'card-light-background'
  const expandBtnId = id
  const buttonId = `accordion-button-${id}`
  const contentId = `accordion-content-${id}`

  // Add click event listener to delete icon
  const deleteIcon = newResponse.querySelector('#dele__icon')
  deleteIcon?.addEventListener('click', function () {
    const card = deleteIcon.closest('.card')
    card.remove()
  })

  newResponse.innerHTML = `
        <div class="card shadow rounded ${cardClass}" style="border-radius: .7rem !important;overflow:hidden">
        <div class="card-header container-fluid d-flex align-content-between"
        <p class="card-header text-muted">${email || 'username placeholder'}</p>
        <span id="dele__icon" class="delete_icon_container" style="position:fixed;right:1%;top:1%;display:inline-block;text-align:center;cursor:pointer">
          <i class="fa-regular fa-trash-can">
        </i></span>
        </div>
        <div class="card-body">
            <p class="fst-italic text-muted">Created: ${
              doc_generated || 'id placeholder'
            }</p>
            <p class="card-text para__ans">${qn || 'question placeholder'}</p>
            <div class="accordion accordion-flush" id="accordionFlushExample">
                <div class="accordion-item bg-transparent">
                        ${createResButton(
                          expandBtnId,
                          contentId,
                          buttonId,
                          res_sum
                        )}
                    <div id="${contentId}" class="accordion-collapse collapse"
                        aria-labelledby="${buttonId}" data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">${
                          response || 'response placeholder'
                        }</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer"><small class="text-muted">
        <span class="float-start">${updatedAt || 'timestamp placeholder'}</span>
        <span class="float-end">${id || 'timestamp placeholder'}</span>
        </small>
        </div>`
  resContainer.prepend(newResponse)
  // Implimenting DELETION
  document
    .querySelector('#dele__icon')
    ?.addEventListener('click', async function (e) {
      CreateDeleModal()
      let card = e.target.closest('.card')
      let small = card.querySelector('.card-footer small')
      let span = small.querySelector('span:nth-child(2)')
      let _id = span.textContent.trim()

      document
        .querySelector('#purgeItem')
        .addEventListener('click', async e => {
          runLoader(false, 'Deleteing...')
          const email = JSON.parse(sessionStorage.getItem('token')).email
          const token = JSON.parse(sessionStorage.getItem('token')).token
          const url = `/delete-document/${_id}`
          try {
            const res = await api.delete(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              data: { email }
            })
            if (res.status === 200) {
              setTimeout(() => {
                runLoader(true)
                card.remove()
              }, 2000)
              return
            }
            showNotification('Request failed. Please try again later')
          } catch (error) {
            console.log(error)
          }
        })
    })
}

// create delete model

function CreateDeleModal () {
  let container = document.querySelector('#main__wrapper')
  let wrapperElement = `
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content del_modall bg-dark">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete Document</h5>
                </div>
                <div class="modal-body">
                    You are about to delete this document
                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-transparent btn-outline-success btn-sm text-white" data-bs-dismiss="modal">Cancel</button>
                    <button id="purgeItem" type="button" class="btn btn-sm text-danger btn-outline-danger" data-bs-dismiss="modal">Delete</button>
                </div>
            </div>
        </div>
    </div>
  `
  // Convert wrapperElement to a DOM element
  let wrapperElementDOM = document
    .createRange()
    .createContextualFragment(wrapperElement)

  // Insert the wrapperElementDOM before the second child of container
  container.insertBefore(wrapperElementDOM, container.children[1])

  // Click the .showDelModal link
  var showDelModalLink = document.querySelector('.deleAnchor')
  showDelModalLink.click()
}
// create details button
function createResButton (expId, contId, btnId, resp_sum) {
  const mainTheme = localStorage.getItem('theme')
  const btnClass = mainTheme === 'dark' ? 'bg-dark' : 'bg-light'
  return `
  <button class="accordion-button ${expId} summery_smry ${btnClass} rounded collapsed"
    data-bs-toggle="collapse" data-bs-target="#${contId}"
    aria-expanded="false" aria-controls="${contId}" id="${btnId}">
    ${resp_sum || 'summery placeholder'}
  </button>
  `
}

// handler for card details theme
const themeToggle = document.querySelector('#theme-toggle')
themeToggle?.addEventListener('change', function () {
  let mainTheme = localStorage.getItem('theme')
  const btns = document.querySelectorAll('.summery_smry')
  btns?.forEach(btn => {
    if (mainTheme === 'light') {
      btn?.classList.add('bg-dark')
      btn?.classList.remove('bg-light')
      localStorage.setItem('theme', 'dark')
    } else {
      btn?.classList.add('bg-light')
      btn?.classList.remove('bg-dark')
      localStorage.setItem('theme', 'light')
    }
  })
})

export { RESPONSE_HTML }
