import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createAnchorManager } from '../src/anchor.js'

class FakeStyle {
  leftSets = 0
  topSets = 0
  cssTextSets = 0
  #left = ''
  #top = ''
  #cssText = ''

  get left() {
    return this.#left
  }

  set left(value) {
    this.leftSets++
    this.#left = value
  }

  get top() {
    return this.#top
  }

  set top(value) {
    this.topSets++
    this.#top = value
  }

  get cssText() {
    return this.#cssText
  }

  set cssText(value) {
    this.cssTextSets++
    this.#cssText = value
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase()
    this.children = []
    this.parentElement = null
    this.removed = false
    this.style = new FakeStyle()
    this.textContentSets = 0
    this._textContent = ''
  }

  append(...children) {
    for (const child of children) {
      child.parentElement = this
      this.children.push(child)
    }
  }

  remove() {
    this.removed = true
    if (!this.parentElement) return
    this.parentElement.children = this.parentElement.children.filter(
      child => child !== this,
    )
    this.parentElement = null
  }

  get textContent() {
    return this._textContent
  }

  set textContent(value) {
    this.textContentSets++
    this._textContent = value
  }
}

function installFakeDocument() {
  const head = new FakeElement('head')
  globalThis.document = {
    head,
    createElement: tagName => new FakeElement(tagName),
  }
  return { head }
}

function getStyleElement(head) {
  assert.equal(head.children.length, 1)
  return head.children[0]
}

function getAnchorElement(wrapper) {
  assert.equal(wrapper.children.length, 1)
  return wrapper.children[0]
}

beforeEach(() => {
  installFakeDocument()
})

afterEach(() => {
  delete globalThis.document
})

test('updates the visibility stylesheet only when visible anchors change', () => {
  const { head } = installFakeDocument()
  const wrapper = new FakeElement('div')
  const manager = createAnchorManager(wrapper)
  const styleEl = getStyleElement(head)

  manager.m([{ id: 'marker-a', location: [0, 0] }], () => ({
    x: 0.1,
    y: 0.2,
    visible: true,
  }))
  manager.s()

  assert.equal(styleEl.textContentSets, 1)
  assert.equal(styleEl.textContent, ':root{--cobe-visible-marker-a:N;}')

  manager.m([{ id: 'marker-a', location: [0, 0] }], () => ({
    x: 0.3,
    y: 0.4,
    visible: true,
  }))
  manager.s()

  assert.equal(styleEl.textContentSets, 1)

  manager.m([{ id: 'marker-a', location: [0, 0] }], () => ({
    x: 0.3,
    y: 0.4,
    visible: false,
  }))
  manager.s()

  assert.equal(styleEl.textContentSets, 2)
  assert.equal(styleEl.textContent, ':root{}')
})

test('skips marker left/top writes when projected position is unchanged', () => {
  const wrapper = new FakeElement('div')
  const manager = createAnchorManager(wrapper)
  const marker = { id: 'marker-a', location: [0, 0] }

  manager.m([marker], () => ({ x: 0.1, y: 0.2, visible: true }))

  const anchor = getAnchorElement(wrapper)
  assert.equal(anchor.style.left, '10%')
  assert.equal(anchor.style.top, '20%')
  assert.equal(anchor.style.leftSets, 1)
  assert.equal(anchor.style.topSets, 1)

  manager.m([marker], () => ({ x: 0.1, y: 0.2, visible: true }))

  assert.equal(anchor.style.leftSets, 1)
  assert.equal(anchor.style.topSets, 1)

  manager.m([marker], () => ({ x: 0.15, y: 0.25, visible: true }))

  assert.equal(anchor.style.left, '15%')
  assert.equal(anchor.style.top, '25%')
  assert.equal(anchor.style.leftSets, 2)
  assert.equal(anchor.style.topSets, 2)
})
