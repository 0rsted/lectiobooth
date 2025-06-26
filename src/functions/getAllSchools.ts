import { getUrlAsJson, type childElement } from './getUrlAsJson'

export const getAllSchools = async () => {
  const data = await getUrlAsJson('https://www.lectio.dk/lectio/login_list.aspx')
  const output = data.dom
    .children.find((e: childElement) => e.name === 'html')
    .children.find((e: childElement) => e.name === 'body')
    .children.find((e: childElement) => e.attribs.id === 'schoolsdiv')
    .children.map((e: childElement) => {
      if(e.children[0].attribs.href.startsWith('/'))
        return {name: e.children[0].children[0].data, id: e.children[0].attribs.href.split('/')[2]}
    }).filter((e: any) => e)
  return output
}