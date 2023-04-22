--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
function createAreaEntities(self)
    return {
        top = Registry:Instance():getEntityByTag("top"),
        mid = Registry:Instance():getEntityByTag("mid"),
        bottom = Registry:Instance():getEntityByTag("bottom"),
        back = Registry:Instance():getEntityByTag("back")
    }
end
function createActions(self)
    return {
        top = function() return Keyboard:Instance():arrowUp() end,
        mid = function() return Keyboard:Instance():arrowRight() end,
        bottom = function() return Keyboard:Instance():arrowDown() end,
        back = function() return Keyboard:Instance():arrowLeft() end
    }
end
appleAreaTop = Registry:Instance():createEntity()
appleAreaTop:setTag("top")
appleAreaTop:addComponentEditable()
appleAreaTop:addComponentBoundingBox({position = {x = 150, y = 220}, size = {width = 150, height = 100}, thickness = 2, color = {r = 255, g = 0, b = 0}})
appleAreaMid = Registry:Instance():createEntity()
appleAreaMid:setTag("mid")
appleAreaMid:addComponentEditable()
appleAreaMid:addComponentBoundingBox({position = {x = 150, y = 340}, size = {width = 180, height = 35}, thickness = 2, color = {r = 0, g = 255, b = 0}})
appleAreaBottom = Registry:Instance():createEntity()
appleAreaBottom:setTag("bottom")
appleAreaBottom:addComponentEditable()
appleAreaBottom:addComponentBoundingBox({position = {x = 150, y = 420}, size = {width = 180, height = 35}, thickness = 2, color = {r = 0, g = 0, b = 255}})
starArea = Registry:Instance():createEntity()
starArea:setTag("back")
starArea:addComponentEditable()
starArea:addComponentBoundingBox({position = {x = 30, y = 250}, size = {width = 40, height = 100}, thickness = 2, color = {r = 0, g = 255, b = 255}})
swordsAndSoulsObjectDetector = Registry:Instance():createEntity()
swordsAndSoulsObjectDetector:addComponentDetection()
swordsAndSoulsObjectDetector:addComponentDetectObjects({
    id = "object-detector",
    confidenceThreshold = 0.4,
    nonMaximumSuppressionThreshold = 0.1,
    pathToModel = "/Users/michaljarnot/IdeaProjects/flappy-bird-script/models/swords-and-souls-detection-n-640.onnx",
    pathToClasses = "/Users/michaljarnot/IdeaProjects/flappy-bird-script/models/swords-and-souls-class.names"
})
lastActionAt = {value = 0}
actionLastAt = {top = 0, mid = 0, bottom = 0, back = 0}
areas = {"top", "bottom", "mid"}
areasEntities = createAreaEntities(nil)
actions = createActions(nil)
function processAppleCollision(self, now, apple)
    for ____, area in ipairs(areas) do
        local areaEntity = areasEntities[area]
        local isCollision = checkCollision(apple, areaEntity)
        if isCollision then
            local action = actions[area]
            local actionThrottle = 280
            if now - actionLastAt[area] > actionThrottle then
                Bus:Instance():emitMessageEvent("press arrow " .. area)
                action(nil)
                actionLastAt[area] = now
                lastActionAt.value = now
                return true
            end
        end
    end
    return false
end
function processStarCollision(self, now, star)
    local areaEntity = areasEntities.back
    local isCollision = checkCollision(star, areaEntity)
    if isCollision then
        local action = actions.back
        local actionThrottle = 250
        if now - actionLastAt.back > actionThrottle then
            Bus:Instance():emitMessageEvent("press arrow left")
            action(nil)
            actionLastAt.back = now
            lastActionAt.value = now
        end
    end
end
main = {
    onUpdate = function()
        local now = getTicks(nil)
        local apples = Registry:Instance():getEntitiesByGroup("apple")
        local stars = Registry:Instance():getEntitiesByGroup("star")
        if #apples > 1 and now - lastActionAt.value > 5 then
            sortByX(apples, false)
            do
                local i = 0
                while i < #apples do
                    local apple = apples:at(i)
                    processAppleCollision(nil, now, apple)
                    i = i + 1
                end
            end
        end
        if #stars > 0 and now - lastActionAt.value > 50 then
            do
                local i = 0
                while i < #stars do
                    local star = stars:at(i)
                    processStarCollision(nil, now, star)
                    i = i + 1
                end
            end
        end
    end,
    screen = {width = 800, height = 600, x = 0, y = 65}
}
