function RESPONSE_HTML (
  id,
  doc_generated,
  qn,
  res_summery,
  response,
  updatedAt
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
  newResponse.innerHTML = `
        <div class="card  shadow rounded ${cardClass}">
        <p class="card-header text-muted">${id || 'username placeholder'}</p>
        <div class="card-body">
            <p class="fst-italic text-muted">Generated on: ${
              doc_generated || 'id placeholder'
            }</p>
            <p class="card-text para__ans">${qn || 'question placeholder'}</p>
            <div class="accordion accordion-flush" id="accordionFlushExample">
                <div class="accordion-item bg-transparent">
                    <h2 class="accordion-header" id="flush-headingOne">
                        <button class="accordion-button rounded collapsed" type="button"
                            data-bs-toggle="collapse" data-bs-target="#flush-collapseOne"
                            aria-expanded="false" aria-controls="flush-collapseOne">
                            ${res_sum || 'summery placeholder'}
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
          updatedAt || 'timestamp placeholder'
        }</small>
        </div>`
  resContainer.prepend(newResponse)
}

export { RESPONSE_HTML }
