import * as Hammer from 'hammerjs'
import { open, close, translateMenu, backdropOpacity, getMenuWidth, OPEN_AFTER_SLIDE_RATIO } from '.'

const MAX_EDGE_CAN_SLIDE = 30

interface OpenSlideHandlerState {
  menuElement: HTMLElement | null
  backDropElement: HTMLElement | null
  canSlide: boolean
}

export default function OpenSlideHandler(
  mainEl: HTMLElement
) {

  const maxSlide = getMenuWidth()

  const state: OpenSlideHandlerState = {
    menuElement: null,
    backDropElement: null,
    canSlide: false
  }

  const mc = new Hammer.Manager(mainEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 10
  }))

  mc.on('panstart', (e: HammerInput) => {
    if (
      // TODO: fix this in a better way
      e.target.nodeName === 'PIECE' ||
      e.target.nodeName === 'SQUARE' ||
      e.target.className.startsWith('cg-board manipulable') ||
      e.center.x > MAX_EDGE_CAN_SLIDE
    ) {
      state.canSlide = false
    } else {
      state.menuElement = document.getElementById('side_menu')
      state.backDropElement = document.getElementById('menu-close-overlay')
      if (state.menuElement && state.backDropElement) {
        state.menuElement.style.visibility = 'visible'
        state.backDropElement.style.visibility = 'visible'
        state.canSlide = true
      }
    }
  })
  mc.on('panmove', (e: HammerInput) => {
    if (state.canSlide) {
      // disable scrolling of content when sliding menu
      e.preventDefault()
      const delta = e.deltaX
      if (delta <= maxSlide) {
        translateMenu(state.menuElement!, -maxSlide + delta)
        backdropOpacity(state.backDropElement!, (delta / maxSlide * 100) / 100 / 2)
      }
    }
  })
  mc.on('panend pancancel', (e: HammerInput) => {
    if (state.canSlide) {
      state.canSlide = false
      const velocity = e.velocityX
      const delta = e.deltaX
      if (
        velocity >= 0 &&
        (delta >= maxSlide * OPEN_AFTER_SLIDE_RATIO || velocity > 0.4)
      ) {
        open()
      } else {
        close()
      }
    }
  })
}

