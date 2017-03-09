'use strict';
//name: Big-T
//username: DChamp_Bot

const nconf = require('nconf');

const TelegramBot = require('node-telegram-bot-api');
const tournament = require('./tournament.js');

nconf.argv().env()
  .file({ file: './.env.json.default' });

const token = nconf.get('TELEGRAM_TOKEN');
// Setup polling way
const bot = new TelegramBot(token, {polling: true});

class Tournament {
  constructor (chatId, chatAdmin) {
    this.chatId = chatId;
    this.chatAdmin = chatAdmin;
    this.players = {};
    this.playingPlayers = [];
    this.theFinalPlayers = [];
    this.quickMatch = [];
    this.state = {
      registering: true,
      playing: false
    };
    this.tournament;
  }
}

const chatsOpen = {};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

bot.onText(/\/start/, function (msg, match) {
  const chatId = msg.chat.id;
  const respNew = `
    *Welcome!*

  Before we start the tournament, every player has to register.

  Please type /register to register at the tournament.
  Every player has to send /register.

  When ready, the administrator has to type /go to? start the tournament.

  Players can send /next to know the next opponent.
  If not playing, you can have fun watching some random /pic

  You can also play a single match 1 VS 1 by sending /quick

    `;

  if (msg.chat.type === 'group') {
    bot.getChatAdministrators(chatId)
    .then((data) => {
      const chatAdmin = data[0].user.username;
      if (msg.from.username === chatAdmin) {
        if (chatsOpen[chatId] === undefined) {
          chatsOpen[chatId] = new Tournament(chatId,chatAdmin);
          bot.sendMessage(chatId, respNew, {parse_mode: 'Markdown'});
        } else if (chatsOpen[chatId].myState.playing === true) {
          bot.sendMessage(chatId, 'You are already playing in a tournament.')
        } else bot.sendMessage(chatId, 'You already set up a tournament, send /go to start.')
      } else bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
    })
    .catch(function(err) {
      console.log(err);
    })
  }
});

bot.onText(/\/register/, function (msg, match) {
  const chatId = msg.chat.id;
  const user = msg.from;
  const tournament = chatsOpen[chatId]
  if (tournament && tournament.state.registering) {
    if (!tournament.players[user.id]) {
      tournament.players[user.id] = user.username
      bot.sendMessage(chatId, `${user.username} has been registered! Current players registered: ${Object.keys(tournament.players).length}.`)
    } else bot.sendMessage(chatId, `You have already been registered.`)
  } else bot.sendMessage(chatId, `Registrations are closed. /start a tournament if you haven't yet.`);
});

bot.onText(/\/deletetournament/, function (msg, match) {
  console.log(msg);
  const chatId = msg.chat.id;
  const tournament = chatsOpen[chatId]
  const opts = {
    reply_markup: JSON.stringify({
    keyboard: [[`YES`, `NO`]],
    one_time_keyboard: true,
    resize_keyboard: true,
    selective: true
    })
  };
  const hideKeyboard = {reply_markup: JSON.stringify({hide_keyboard: true})}

  if (tournament) {
    if (tournament.chatAdmin === msg.from.username) {
      bot.sendMessage(chatId, `Are you sure? @${tournament.chatAdmin}`, opts);
      bot.onText(/YES/, () => {
        delete chatsOpen[chatId];
        bot.sendMessage(chatId, `Current tournament deleted.`, hideKeyboard);
      })
      bot.onText(/NO/, () => {
        bot.sendMessage(chatId, `The tournament has not been deleted.`, hideKeyboard);
      })
    } else {
      bot.sendMessage(chatId, `Only the group admin can send me commands!`);
    }
  } else {
    bot.sendMessage(chatId, `You are not playing any tournament!`);
  }
});

// bot.on('message', function (msg) {
//   for (var i = 0; i < chatsOpen.length; i++) {
//     if (chatsOpen[i].chatId === chatId) {
//       if (msg.from.username === chatsOpen[i].chatAdmin) {
//         if (chatsOpen[i].theFinalPlayers.includes(msg.text)) {
//           setTimeout (function () {
//             bot.sendMessage(chatId, `Tournament ended. Congratulations to ${msg.text}!`);
//           }, 600);
//           let video = './champion/messilegend.mp4';
//           bot.sendVideo(chatId, video);
//           let gif = './champion/winner.gif';
//           bot.sendDocument(chatId, gif, {caption: "Who's the king?"});
//           chatsOpen[i].theFinalPlayers = [];
//         }
//
//         if (chatsOpen[i].playingPlayers.includes(msg.text)) {
//           let winner = msg.text;
//           let gif = `./gifs/${getRandomInt(1,11)}.gif`;
//           bot.sendMessage(chatId, `${msg.text} wins!`);
//           bot.sendDocument(chatId, gif, {caption: "Who's next?"});
//           // winner goes to next round
//           chatsOpen[i].newT.passRound(winner);
//           let nextMatch = chatsOpen[i].newT.nextMatch();
//           if (nextMatch.round === 'final') {
//             chatsOpen[i].theFinalPlayers = [nextMatch.player1, nextMatch.player2];
//             bot.sendMessage(chatId, `FINAL MATCH: ${nextMatch.player1} VS ${nextMatch.player2}`);
//             let opts = {
//               reply_markup: JSON.stringify({
//                 keyboard: [chatsOpen[i].theFinalPlayers],
//                 one_time_keyboard: true,
//                 resize_keyboard: true
//               })
//             };
//             setTimeout (function () {
//               bot.sendMessage(chatId, `Who is the CHAMPION? Choose the winner by clicking the button below.`, opts);
//             }, 600);
//             chatsOpen[i].myState.registering = false;
//             chatsOpen[i].myState.playing = false;
//             chatsOpen[i].newT = undefined;
//             chatsOpen[i].players = [];
//             chatsOpen[i].playingPlayers = [];
//           } else {
//               chatsOpen[i].playingPlayers = [nextMatch.player1, nextMatch.player2];
//               bot.sendMessage(chatId, `Next Match: ${nextMatch.player1} VS ${nextMatch.player2}`);
//               let opts = {
//                 reply_markup: JSON.stringify({
//                   keyboard: [chatsOpen[i].playingPlayers],
//                   one_time_keyboard: true,
//                   resize_keyboard: true
//                 })
//               };
//               setTimeout (function () {
//                 bot.sendMessage(chatId, `Who won the match? Choose the winner by clicking the button below.`, opts);
//               }, 600);
//             }
//         }
//
//         if ((msg.text).includes("-")) {
//           let re = /(.+)-(.+)/;
//           chatsOpen[i].quickMatch = msg.text.split(re);
//           chatsOpen[i].quickMatch.splice(0,1);
//           chatsOpen[i].quickMatch.splice(2,1);
//           bot.sendMessage(chatId, `Match ready!`);
//           let opts = {
//                 reply_markup: JSON.stringify({
//                   keyboard: [chatsOpen[i].quickMatch],
//                   one_time_keyboard: true,
//                   resize_keyboard: true
//                 })
//               };
//           setTimeout (function () {
//                 bot.sendMessage(chatId, `Who won the match? Choose the winner by clicking the button below.`, opts);
//               }, 2000);
//         }
//
//         if (chatsOpen[i].quickMatch.includes(msg.text)) {
//           setTimeout (function () {
//             bot.sendMessage(chatId, `${msg.text} rocks!`);
//           }, 600);
//           let gif = `./gifs/${getRandomInt(1,11)}.gif`;
//           bot.sendDocument(chatId, gif, {caption: "Too easy..."});
//           chatsOpen[i].quickMatch = [];
//         }
//
//       }
//     }
//   }
//   console.log('end of message');
// });
//

bot.onText(/\/help/, function (msg, match) {
  const chatId = msg.chat.id;
  const resp = `
    To start a tournament you have to add me to a Telegram group.

  Then type /start to start a tournament!
  Every player has to register before the tournament starts.
  Once the tournament has started, only the group administrator can send me commands, except /next.
  Players can type /next to know the next opponent.

  You can control me by sending these commands:

    /start - start the registration process
    /register - register at the tournament
    /go - start the tournament
    /next - show next opponent
    /deletetournament - delete an existing tournament
    /help - list of commands and help

    `;
  bot.getChatAdministrators(chatId)
  .then((data) => {
    const chatAdmin = data[0].user.username;
    if (chatAdmin === msg.from.username){
      bot.sendMessage(chatId, resp, {parse_mode: 'Markdown'});
    } else bot.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
  })
  .catch(err => {
    console.log(err);
  })
});


//
// bot.onText(/\/next/, function (msg, match) {
//   let chatId = msg.chat.id;
//   let user = msg.from.username;
//
//   for (let i = 0; i < chatsOpen.length; i++) {
//     if (chatId === chatsOpen[i].chatId) {
//       if (chatsOpen[i].myState.playing) {
//         if (chatsOpen[i].players.includes(user) || chatsOpen[i].playingPlayers.includes(user) || chatsOpen[i].theFinalPlayers.includes(user)) {
//           let opponent = chatsOpen[i].newT.nextOpponent(user);
//           let resp = `
//             ${user} your opponent is ${opponent}
//           `;
//         bot.sendMessage(chatId, resp);
//         } else {
//           bot.sendMessage(chatId, `You are not playing the current tournament`);
//           }
//       } else {
//           bot.sendMessage(chatId, `Not playing any tournament yet.`);
//         }
//     }
//   }
// });
//
// bot.onText(/\/go/, function (msg, match) {
//   let chatId = msg.chat.id;
//   for (let i = 0; i < chatsOpen.length; i++) {
//     if (chatId === chatsOpen[i].chatId) {
//       if (msg.from.username === chatsOpen[i].chatAdmin) {
//         if (chatsOpen[i].players.length < 4) {
//           bot.sendMessage(chatId, `You need at least 4 players to start a tournament and you are only ${chatsOpen[i].players.length}!`);
//         } else {
//           //set states, create and show the tournament
//           chatsOpen[i].myState.registering = false;
//           chatsOpen[i].myState.playing = true;
//           let number = chatsOpen[i].players.length;
//           chatsOpen[i].newT = tournament.createTournament(chatsOpen[i].players);
//           bot.sendMessage(chatId, `New tournament created with ${number} players! Start!`);
//
//           // shows next match and ask for the winner
//           let nextM = chatsOpen[i].newT.nextMatch();
//           chatsOpen[i].playingPlayers = [nextM.player1, nextM.player2];
//           bot.sendMessage(chatId, `Next Match: ${nextM.player1} VS ${nextM.player2}`);
//           let opts = {
//             reply_markup: JSON.stringify({
//               keyboard: [chatsOpen[i].playingPlayers],
//               one_time_keyboard: true,
//               resize_keyboard: true
//             })
//           };
//           setTimeout (function () {
//             bot.sendMessage(chatId, `Who won the match? Choose the winner by clicking the button below.`, opts);
//           }, 600);
//         }
//       } else {
//           bot.sendMessage(chatId, `Only ${chatsOpen[i].chatAdmin} can send me commands!`);
//         }
//     }
//   }
// });
//
