const game = require("../gameData");
const config = require("../config");
const calculateMovement = require("../util/move");

const removeBullet = i => game.bullets.splice(i, 1);

module.exports = () => {
    game.bullets.forEach((bullet, i) => {

        //Movement
        const movement = calculateMovement(bullet.direction, config.bulletSpeed);
        bullet.x += movement.x;
        bullet.y += movement.y;

        //Map Bounds
        if (
            bullet.x < 0 - config.mapSize / 2 ||
            bullet.x > 0 + config.mapSize / 2 ||
            bullet.y < 0 - config.mapSize / 2 ||
            bullet.y > 0 + config.mapSize / 2
        ) return removeBullet(i);

        //Player Hit
        Object.keys(game.players).forEach(id => {
            const player = game.players[id];
            if (
                player.x - config.playerHitbox < bullet.x &&
                player.x + config.playerHitbox > bullet.x &&
                player.y - config.playerHitbox < bullet.y &&
                player.y + config.playerHitbox > bullet.y &&
                id !== bullet.owner
            ) {
                //Get Bullet Owner
                const owner = game.players[bullet.owner];
                if (owner) {

                    //Award Points
                    game.players[bullet.owner].score += config.bulletHitGain;

                }

                //Deduct points from victim
                player.score -= bullet.bulletPower;

                //Spread Plague
                if (bullet.plague) player.plague = true;

                //Update victim and remove bullet
                game.players[id] = player;
                removeBullet(i);
            }
        });
    });
};