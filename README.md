# Automation Engine Scripts

This repository contains a collection of scripts that can be loaded by an 📚 [automation engine](https://github.com/developer239/automation-engine) to automate
various tasks. The scripts are written in TypeScript. (Lua)

## Swords and Souls

The goal of the training mini game is to slice apples before they hit the player. Apples come at the player from
three different directions. The player receives bonus points for collecting stars that fall behind them. As the player
progresses, the game becomes increasingly faster.

The automation script does the following:

- Defines four areas (top, middle, bottom, back) to determine when apples and stars are within the player's reach.
- Sets up a YOLO object detector to detect apples and stars.
- Checks for collision detection when apples collide with the top, middle, or bottom areas, triggering the corresponding
  action (up, right, or down).
- Checks for collision detection when stars collide with the back area, triggering the left arrow action.
- Throttles actions to prevent the bot from spamming keyboard keys too often (16ms)
- Throttles actions to prevent the bot from getting stuck focusing only to apples in one area and ignoring others (
  260ms)

![Swords and Souls](./docs/swords-and-souls-preview.gif)
