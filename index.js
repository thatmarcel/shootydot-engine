const game = require("./gameData");
const config = require("./config");

//HTTP Server
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(require("cors")());
http.listen(8081);

//Setup Functions
require("./gameFunctions/generateStars")();

//Tick
setInterval(() => {

    //Emit Game Data
    io.emit("data", {
        players: (() => {
            const players = {};
            Object.keys(game.players).forEach(id => {
                const player = game.players[id];
                players[id] = {
                    name: player.name,
                    score: player.score,
                    x: player.x,
                    y: player.y,
                    speedBoost: player.speedBoost,
                    plague: player.plague
                };
            });
            return players;
        })(),
        bullets: game.bullets.map(bullet => ({
            x: bullet.x,
            y: bullet.y
        })),
        stars: game.stars
    });

    //Game Functions
    require("./gameFunctions/newStar")();
    require("./gameFunctions/playerUpdate")();
    require("./gameFunctions/bulletUpdate")();

}, 1000 / config.tickSpeed);

//Socket.io Connection
io.on("connection", socket => {

    //Player Action
    socket.on("action", data => {
        const player = game.players[data.id];
        if (!player || player.secret !== data.secret) return;

        switch (data.action) {

            //Change Direction
            case "changeDirection":
                player.direction = data.param;
                break;
            
            //Activate Speed Boost
            case "speedBoost":
                if (player.speedBoost.full < 100) return;
                player.speedBoost.active = true;
                break;
            
            //Shoot Bullet
            case "shoot":
                if (game.bullets.length > config.maxBullets) return; //Maximum Bullets in Arena
                player.score--;
                game.bullets.push({
                    owner: data.id,
                    bulletPower: player.bulletPower,
                    direction: player.direction,
                    x: player.x,
                    y: player.y,
                    plague: player.plague
                });
                break;

        }

        game.players[data.id] = player;
    });

});

//Join
app.post("/join", require("./api/join"));

//Stats
app.get("/stats", require("./api/stats"));