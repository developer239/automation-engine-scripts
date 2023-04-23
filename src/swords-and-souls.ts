//
// Initialize areas for collision detection

const appleAreaTop = Registry.Instance().createEntity()
appleAreaTop.setTag('top')
appleAreaTop.addComponentEditable()
appleAreaTop.addComponentBoundingBox({
  position: { x: 150, y: 220 },
  size: { width: 200, height: 100 },
  thickness: 2,
  color: { r: 255, g: 0, b: 0 },
})

const appleAreaMid = Registry.Instance().createEntity()
appleAreaMid.setTag('mid')
appleAreaMid.addComponentEditable()
appleAreaMid.addComponentBoundingBox({
  position: { x: 130, y: 340 },
  size: { width: 205, height: 35 },
  thickness: 2,
  color: { r: 0, g: 255, b: 0 },
})

const appleAreaBottom = Registry.Instance().createEntity()
appleAreaBottom.setTag('bottom')
appleAreaBottom.addComponentEditable()
appleAreaBottom.addComponentBoundingBox({
  position: { x: 130, y: 420 },
  size: { width: 210, height: 35 },
  thickness: 2,
  color: { r: 0, g: 0, b: 255 },
})

const starArea = Registry.Instance().createEntity()
starArea.setTag('back')
starArea.addComponentEditable()
starArea.addComponentBoundingBox({
  position: { x: 30, y: 250 },
  size: { width: 40, height: 100 },
  thickness: 2,
  color: { r: 0, g: 255, b: 255 },
})

//
// Initialize YOLO detector

const swordsAndSoulsObjectDetector = Registry.Instance().createEntity()
swordsAndSoulsObjectDetector.addComponentDetection()
swordsAndSoulsObjectDetector.addComponentDetectObjects({
  id: 'object-detector',
  confidenceThreshold: 0.3,
  nonMaximumSuppressionThreshold: 0.1,
  pathToModel:
    '/Users/michaljarnot/IdeaProjects/flappy-bird-script/models/swords-and-souls-detection-n-640.onnx',
  pathToClasses:
    '/Users/michaljarnot/IdeaProjects/flappy-bird-script/models/swords-and-souls-class.names',
})

//
// Automation

const lastActionAt = { value: 0 }
const actionLastAt = {
  top: 0,
  mid: 0,
  bottom: 0,
  back: 0,
}

const areas: (keyof typeof areasEntities)[] = ['top', 'bottom', 'mid']
const areasEntities = createAreaEntities()
const actions = createActions()

function createAreaEntities() {
  return {
    top: Registry.Instance().getEntityByTag('top'),
    mid: Registry.Instance().getEntityByTag('mid'),
    bottom: Registry.Instance().getEntityByTag('bottom'),
    back: Registry.Instance().getEntityByTag('back'),
  }
}

function createActions() {
  return {
    top: () => Keyboard.Instance().arrowUp(),
    mid: () => Keyboard.Instance().arrowRight(),
    bottom: () => Keyboard.Instance().arrowDown(),
    back: () => Keyboard.Instance().arrowLeft(),
  }
}

function processAppleCollision(now: number, apple: Entity) {
  const ACTION_THROTTLE = 200
  const THROTTLE = 5
  if (now - lastActionAt.value > THROTTLE) {
    const collisions = {
      top: false,
      mid: false,
      bottom: false,
    }

    for (const area of areas) {
      const areaEntity = areasEntities[area]
      const isCollision = checkCollision(apple, areaEntity)

      if (isCollision) {
        collisions[area as keyof typeof collisions] = true
      }
    }

    let nextAction: keyof typeof actions | undefined
    for (const area of areas) {
      const isCollision = collisions[area as keyof typeof collisions]

      if(isCollision) {
        const areaLastPlayedAt = actionLastAt[area]
        if (now - areaLastPlayedAt > ACTION_THROTTLE) {
          if (!nextAction) {
            nextAction = area
          }

          const nextActionLastPlayedAt = actionLastAt[nextAction]
          if (areaLastPlayedAt < nextActionLastPlayedAt) {
            nextAction = area
          }
        }
      }
    }

    if (nextAction) {
      const action = actions[nextAction as keyof typeof actions]
      Bus.Instance().emitMessageEvent(`press arrow ${nextAction}`)
      action()
      actionLastAt[nextAction as keyof typeof actions] = now
      lastActionAt.value = now
    } else {
      const stars = Registry.Instance().getEntitiesByGroup('star')
      if (stars.length > 0 && now - lastActionAt.value > 50) {
        for (let i = 0; i < stars.length; i++) {
          const star = stars.at(i)!
          processStarCollision(now, star)
        }
      }
    }
  }
}

function processStarCollision(now: number, star: Entity) {
  const areaEntity = areasEntities.back
  const isCollision = checkCollision(star, areaEntity)

  if (isCollision) {
    const action = actions.back
    const actionThrottle = 250

    if (now - actionLastAt.back > actionThrottle) {
      Bus.Instance().emitMessageEvent('press arrow left')
      action()
      actionLastAt.back = now
      lastActionAt.value = now
    }
  }
}

//
// Main object

main = {
  onUpdate: () => {
    const now = getTicks()
    const apples = Registry.Instance().getEntitiesByGroup('apple')

    if (apples.length > 1 && now - lastActionAt.value > 5) {
      sortByX(apples, false)

      for (let i = 0; i < apples.length; i++) {
        const apple = apples.at(i)!
        processAppleCollision(now, apple)
      }
    }
  },
  screen: {
    width: 800,
    height: 600,
    x: 0,
    y: 65,
  },
}
