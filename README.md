![build](https://travis-ci.org/ndillon1/tournament-bot.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/ndillon1/tournament-bot/badge.svg?branch=testing)](https://coveralls.io/github/ndillon1/tournament-bot?branch=testing)

# Tournament Bot

## Description

TournamentBot organises a tournament of any sport or activity with 4 players or more and visualises the tournament bracket after every game.


###### Bot Commands

* /start - start the registration process
* /register - register at the tournament
* /go - start the tournament
* /next - show next opponent
* /game - start the next game
* /deletetournament - delete an existing tournament
* /help - list of commands and help

## Installation

* Clone this Repo
* Run `npm install`
* Create a Telegram bot using [Bot Father](https://core.telegram.org/bots#6-botfather) and retrieve a key
* Add key to `env.json` file
* Run `nodemon main.js`

After completing these steps you should be able to chat with your bot in Telegram

## Tech Stack

**Main Framework**
* Node JS

**Libraries**
* [D3](https://github.com/d3/d3)
* [Node Telegram Bot API](https://github.com/yagop/node-telegram-bot-api) / [Telegram API](https://core.telegram.org/)

**Testing Frameworks**
* [Mocha](https://github.com/mochajs/mocha)
* [Chai](https://github.com/chaijs/chai)
* [Sinon](https://github.com/sinonjs/sinon)
