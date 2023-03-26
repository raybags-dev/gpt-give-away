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
  newResponse.innerHTML = `
        <div class="card  shadow rounded ${cardClass}">
        <a class="btn-close rounded" style="position:fixed;right:1%;top:2%;width:10px;height:10px;"></a>
        <p class="card-header text-muted">${email || 'username placeholder'}</p>

        <div class="card-body">
            <p class="fst-italic text-muted">Created: ${
              doc_generated || 'id placeholder'
            }</p>
            <p class="card-text para__ans">${qn || 'question placeholder'}</p>
            <div class="accordion accordion-flush" id="accordionFlushExample">
                <div class="accordion-item bg-transparent">
                    <h2 class="accordion-header" id="flush-headingOne">
                        <button class="accordion-button summery_smry rounded collapsed" style="z-index:10000" type="button"
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
        <div class="card-footer"><small class="text-muted">
        <span class="float-start">${updatedAt || 'timestamp placeholder'}</span>
        <span class="float-end">${id || 'timestamp placeholder'}</span>
        </small>
        </div>`
  resContainer.prepend(newResponse)
}

export { RESPONSE_HTML }
