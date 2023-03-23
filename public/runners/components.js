function QN_FACTORY (head, qn) {
  const mainTheme = localStorage.getItem('theme')
  const container = document.getElementById('QN__container')
  const newCard = document.createElement('div')
  newCard.classList.add(
    'card',
    'card_qn',
    'shadow',
    'shadow',
    'rounded',
    mainTheme === 'dark' ? 'card-dark-background' : 'card-light-background'
  )

  newCard.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${head || 'placeholder for question'}</h5>
        <p class="card-text">${qn || 'placeholder for response'}</p>
      </div>
    `
  container.insertBefore(newCard, container.firstChild)
  return container.innerHTML
}
function RESPONSE_FACTORY (username, id, qn, qn_summery, response, created_at) {
  const mainTheme = localStorage.getItem('theme')
  const resContainer = document.querySelector('#RES_container')
  const newResponse = document.createElement('div')
  const cardClass =
    mainTheme === 'dark' ? 'card-dark-background' : 'card-light-background'
  newResponse.innerHTML = `
        <div class="card  shadow rounded ${cardClass}">
        <div class="card-header bg-transparent border-success">${
          username || 'username placeholder'
        }</div>
        <div class="card-body">
            <p class="fst-italic">${id || ' id placeholder'}</p>
            <p class="card-text para__ans">${qn || 'question placeholder'}</p>
            <div class="accordion accordion-flush" id="accordionFlushExample">
                <div class="accordion-item bg-transparent">
                    <h2 class="accordion-header" id="flush-headingOne">
                        <button class="accordion-button rounded collapsed" type="button"
                            data-bs-toggle="collapse" data-bs-target="#flush-collapseOne"
                            aria-expanded="false" aria-controls="flush-collapseOne">
                            ${qn_summery || 'summery placeholder'}
                        </button>
                    </h2>
                    <div id="flush-collapseOne" class="accordion-collapse collapse text-transparent"
                        aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">${
                          response || 'response placeholder'
                        }</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer"><small class="text-muted">${
          created_at || 'timestamp placeholder'
        }</small>
        </div>`
  resContainer.prepend(newResponse)
}

// function handleLogOut () {
//   localStorage.removeItem('userToken')
//   window.location.href = '/public/html/login.html'
// }

export { QN_FACTORY, RESPONSE_FACTORY }
