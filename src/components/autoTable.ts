type cell = HTMLElement
type row = cell[]

export const table = (bodyCells: row[], headerCells?: row, footerCells?: row) => {

  // elements for the table
  const table = document.createElement('table')

  if (headerCells) {
    const thead = document.createElement('thead')
    const tr = document.createElement('tr')
    for (const currentCell of headerCells) {
      const th = document.createElement('th')
      th.appendChild(
        (currentCell instanceof HTMLElement)
          ? currentCell
          : document.createTextNode('')
      )
      tr.appendChild(th)
    }
    thead.appendChild(tr)
    table.appendChild(thead)
  }

  const tbody = document.createElement('tbody')
  for (const currentRow of bodyCells) {
    const tr = document.createElement('tr')
    for (const currentCell of currentRow) {
      const td = document.createElement('td')
      td.style.verticalAlign = 'top'
      td.appendChild(
        (currentCell instanceof HTMLElement)
          ? currentCell
          : document.createTextNode('')
      )
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)

  if (headerCells || footerCells) {
    const tfoot = document.createElement('tfoot')
    const tr = document.createElement('tr')
    for (const currentCell of footerCells || headerCells) {
      const th = document.createElement('th')
      th.appendChild(
        (currentCell instanceof HTMLElement)
          ? currentCell
          : document.createTextNode('')
      )
      tr.appendChild(th)
    }
    tfoot.appendChild(tr)
    table.appendChild(tfoot)
  }

  return table
}