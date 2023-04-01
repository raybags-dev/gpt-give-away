import { runLoader, api, showNotification } from './heavy_lift.js'
function formatDate (timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${year}-${month}-${day},${hours}:${minutes}`
}

function formatEmail (email) {
  const atIndex = email.indexOf('@')
  if (atIndex !== -1) {
    const username = email.slice(0, atIndex)
    const domain = email.slice(atIndex + 1)
    return `@${username}`
  }
  return ''
}

// Delete model
function generateDeleteModel () {
  let mainContainer = document.querySelector('#main__wrapper')
  let modalHTML = `
          <div class="modal fade delete_modell" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered ">
            <div id="dele-mole" class="modal-content" style="backdrop-filter:blur(5px); background: rgba(240, 240, 240, 0.2) !important;">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalToggleLabel">Are you sure ?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                If you delete your account, you will delete all the documents you have created will be delete as well. This process is irreversible. If this is what you want, proceed and press the button below.
              </div>
              <div class="modal-footer">
                <button id="___finalDelete" class="btn btn-danger"data-bs-dismiss="modal" aria-label="Close">Yes. Proceed.</button>
              </div>
            </div>
          </div>
        </div>
        <a id="xxx" data-bs-toggle="modal" style="opacity:.001" href="#exampleModalToggle" role="button"></a>
        `
  mainContainer.insertAdjacentHTML('beforeend', modalHTML)
  document.querySelector('#xxx').click()

  // delete finctionality
  document
    .querySelector('#___finalDelete')
    .addEventListener('click', async () => {
      try {
        await DELETE_USERDOCS()
      } catch (e) {
        console.log(e)
      }
    })
}
async function DELETE_USERDOCS () {
  try {
    runLoader(false, 'Deleting...')
    const email = JSON.parse(sessionStorage.getItem('token')).email
    const token = JSON.parse(sessionStorage.getItem('token')).token
    let url1 = '/user/token'

    const res = await api.post(
      url1,
      { email },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    //res.data.email
    // res.data._id
    await delUserHelper(res.data.email, res.data._id, token)
    runLoader(true, 'Finalizing...')
  } catch (error) {
    console.log(error)
    showNotification('Error', 'Something went wrong. Please try again later.')
  } finally {
    runLoader(true)
  }
}
async function delUserHelper (email, userId, token) {
  runLoader(false, 'Finalizing...')
  let url2 = '/purge-account'
  try {
    const response = await api.delete(
      `${url2}/${userId}`,
      { data: { email }, headers: { Authorization: `Bearer ${token}` } } // merge headers with request config object
    )
    if (response.status == 200) {
      showNotification('Done', 'Account deleted')
      setTimeout(() => {
        showNotification('Success...', 'Its done.')
        runLoader(true)
        window.location.href = '/html/signup.html'
      }, 2000)
      return
    }
  } catch (e) {
    console.log(e)
  }
}
export { formatDate, generateDeleteModel, formatEmail }
