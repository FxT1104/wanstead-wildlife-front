import { describe, expect, it } from 'vitest'
import { collectBlocks, pickVoice } from './readAloud'

const all = () => true

function page(html: string) {
  const main = document.createElement('main')
  main.innerHTML = html
  return main
}

describe('collectBlocks', () => {
  it('reads headings, paragraphs, list items and image descriptions in order', () => {
    const main = page(`
      <h1>Herons</h1>
      <p>A colony   nests
        on the island.</p>
      <ul><li>Grey heron</li><li><p>Little egret</p></li></ul>
      <img src="a.jpg" alt="A heron on its nest">
      <img src="b.jpg" alt="">`)
    expect(collectBlocks(main, all).map((b) => b.text)).toEqual([
      'Herons',
      'A colony nests on the island.',
      'Grey heron',
      'Little egret',
      'Image: A heron on its nest',
    ])
  })

  it('skips navigation, forms, hidden parts and announces tables instead of reading them', () => {
    const main = page(`
      <nav><p>Breadcrumb</p></nav>
      <form><p>Field hint</p></form>
      <p aria-hidden="true">Decoration</p>
      <p class="sr-only">Screen reader only</p>
      <table><caption>Records 2024</caption><tr><td>1</td></tr></table>
      <p>Visible</p>`)
    expect(collectBlocks(main, all).map((b) => b.text)).toEqual([
      'Table: Records 2024. The table is not read aloud.',
      'Visible',
    ])
  })

  it('ignores elements that are not displayed', () => {
    const main = page('<p id="a">Shown</p><p id="b">Hidden by CSS</p>')
    expect(collectBlocks(main, (el) => el.id !== 'b').map((b) => b.text)).toEqual(['Shown'])
  })
})

describe('pickVoice', () => {
  const voice = (lang: string, localService = false) => ({ lang, localService }) as SpeechSynthesisVoice

  it('prefers a local British voice, then any English voice', () => {
    expect(pickVoice([voice('fr-FR'), voice('en-US'), voice('en-GB'), voice('en-GB', true)])).toEqual(voice('en-GB', true))
    expect(pickVoice([voice('fr-FR'), voice('en-US')])).toEqual(voice('en-US'))
    expect(pickVoice([voice('fr-FR')])).toBeNull()
  })
})
