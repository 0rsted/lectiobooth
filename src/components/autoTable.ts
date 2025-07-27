type cell = HTMLElement | Text | undefined
type row = cell[]
type config = {
  headerCells?: row
  footerCells?: row
  style?: string
  className?: string
}

export const table = (bodyCells: row[], config?: config) => {
  const {headerCells, footerCells, style, className} = config ?? {}
  const cellNumber = Math.max(...bodyCells.filter(e => e).map(e => e.length))
  // elements for the table
  const table = document.createElement('table')
  if(style)
    table.setAttribute('style', style)
  if(className)
    table.className = className

  if (headerCells) {
    const thead = document.createElement('thead')
    const tr = document.createElement('tr')
    for (const currentCell of headerCells) {
      const th = document.createElement('th')
      th.appendChild(
        (currentCell instanceof HTMLElement || currentCell instanceof Text)
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
      if(currentRow.length === 1 && cellNumber > 1)
        td.colSpan = cellNumber
      td.appendChild(
        (currentCell instanceof HTMLElement || currentCell instanceof Text)
        ? currentCell
        : document.createTextNode('\u00A0')
      )
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)
  
  if (headerCells || footerCells) {
    const tfoot = document.createElement('tfoot')
    const tr = document.createElement('tr')
    for (const currentCell of (footerCells || headerCells)) {
      const th = document.createElement('th')
      th.appendChild(
        (currentCell instanceof HTMLElement || currentCell instanceof Text)
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