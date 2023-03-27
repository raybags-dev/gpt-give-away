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
        <div class="card shadow rounded ${cardClass}">
        <div class="card-header container-fluid d-flex align-content-between"
        <p class="card-header text-muted">${email || 'username placeholder'}</p>
        <a class="nav-link dropdown-toggle float-end" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          </a>
          <ul class="dropdown-menu bg-transparent" style="backdrop-filter:blur(3px);z-index:10; background: rgba(240, 240, 240, 0.5) !important;" aria-labelledby="navbarDropdownMenuLink">
          <li><a id="delete__document" class="dropdown-item" href="#">Delete document</a></li>
          <li><a id="expand__document" class="dropdown-item" href="#">Full screen</a></li>
        </ul>
        </div>
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
