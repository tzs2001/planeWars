/*
 *  已知的 BUG :
 *      1、该 BUG 导致当游戏窗口改变时，飞机的移动范围不变。
 *      2、该 BUG 导致当连续敲击空格时，敌机不会出现。（暂时无法修复）
*/

window.onload = function() {
    function getId(idName) {
        return document.getElementById(idName);
    }

    let game = getId("game")
    ,   gameStart = getId("gameStart")
    ,   playButton = getId("play")
    ,   gameEnter = getId("gameEnter")
    ,   myTank = getId("myTank")
    ,   bullets = getId("bullets")
    ,   enemys = getId("enemys")
    ,   score = getId("scores").firstElementChild.firstElementChild;
    ;


    function getStyle(ele, attr) {
        let res = null;

        if (ele.currentStyle) {
            res = ele.currentStyle[attr];
        } else {
            res = window.getComputedStyle(ele, null)[attr];
        }

        return parseFloat(res);
    }

    let gameW = getStyle(game, "width")
    ,   gameH = getStyle(game, "height")
    ;

    let myTankW = getStyle(myTank, "width")
    ,   myTankH = getStyle(myTank, "height")
    ;

    let bulletW = 9
    ,   bulletH = 21
    ;

    let gameStatus = false
    ,   bulletTimer = null
    ,   enemyTimer = null
    ,   bgTimer = null
    ,   bgPositionY = 0
    ,   scores = 0
    ,   bulletss = []
    ,   enemyss = []
    ;

    playButton.onclick = function() {
        gameStart.style.display = "none";
        gameEnter.style.display = "block";

        document.onkeyup = function(evt) {
            let keyVal = evt.keyCode;

            if (keyVal == 32) {
                if (!gameStatus) {
                    scores = 0;
                    this.onmousemove = myTankMove;

                    bgMove();
                    shot();
                    appearEnemy();

                    if (bulletss != 0) reStart(bulletss, 1);
                    if (enemyss != 0) reStart(enemyss);
                } else {
                    this.onmousemove = null;

                    clearInterval(bulletTimer);
                    clearInterval(enemyTimer);
                    clearInterval(bgTimer);
                    bulletTimer = null;
                    enemyTimer = null;
                    bgTimer = null;

                    clear(bulletss);
                    clear(enemyss);
                }
                gameStatus = !gameStatus;
            }
        }
    }

    function myTankMove(evt) {
        let e = evt || window.event;
        
        let mouse_x = e.x || e.pageX
        ,   mouse_y = e.y || e.pageY
        ;

        let last_myTank_left = mouse_x - myTankW / 2
        ,   last_myTank_top = mouse_y - myTankH / 2
        ;

        if (last_myTank_left <= 0) {
            last_myTank_left = 0;
        } else if (last_myTank_left >= gameW - myTankW) {
            last_myTank_left = gameW - myTankW;
        }
        
        if (last_myTank_top <= 0) {
            last_myTank_top = 0;
        } else if (last_myTank_top >= gameH - myTankH) {
            last_myTank_top = gameH - myTankH;
        } 

        myTank.style.left = last_myTank_left + "px";
        myTank.style.top = last_myTank_top + "px";
    }


    function shot() {
        if (bulletTimer) return;

        bulletTimer = setInterval(function() {
            createBullet();
        }, 100);
    }

    function createBullet() {
        let bullet = new Image();
        bullet.src = "images/bullet1.png"
        bullet.className = "b";

        let myTankL = getStyle(myTank, "left")
        ,   myTankT = getStyle(myTank, "top")
        ;

        let bulletL = myTankL + myTankW / 2 - bulletW / 2
        ,   bulletT = myTankT - bulletH
        ;

        bullet.style.left = bulletL + "px";
        bullet.style.top = bulletT + "px";
        bullets.appendChild(bullet);
        bulletss.push(bullet);
       
        move(bullet, "top");
    }

    function move(ele, attr) {
        let speed = -10;

        ele.timer = setInterval(function() {
            let moveVal = getStyle(ele, attr);

            if (moveVal <= -bulletH) {
                clearInterval(ele.timer);
                ele.parentNode.removeChild(ele);
                bulletss.splice(0, 1);
            } else {
                ele.style[attr] = moveVal + speed + "px";
            }
        }, 10);
    }


    let enemysObj = {
        enemy1: {
            width: 57,
            height: 51,
            score: 100,
            hp: 100
        },
        enemy2: {
            width: 69,
            height: 95,
            score: 500,
            hp: 500
        },
        enemy3: {
            width: 169,
            height: 258,
            score: 1000,
            hp: 1000
        }
    }

    function appearEnemy() {
        if (enemyTimer) return;

        enemyTimer = setInterval(function() {
            createEnemy();
            delEnemy();
        }, 1000)
    }

    function createEnemy() {
        let percentData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3];
        let enemyType = percentData[Math.floor(Math.random() * percentData.length)];
        let enemyData = enemysObj["enemy" + enemyType];
        let enemy = new Image(enemyData.width, enemyData.height);

        if (enemyType == 3) {
            enemy.src = "images/enemy" + enemyType + ".gif";
        } else {
            enemy.src = "images/enemy" + enemyType + ".png";
        }

        enemy.score = enemyData.score;
        enemy.hp = enemyData.hp;
        enemy.type = enemyType;
        enemy.className = "e";

        let enemyL = Math.floor(Math.random() * (gameW - enemyData.width + 1))
        ,   enemyT = -enemyData.height
        ;

        enemy.style.left = enemyL + "px";
        enemy.style.top = enemyT + "px";
        enemys.appendChild(enemy);
        enemyss.dead = false;
        enemyss.push(enemy);

        enemyMove(enemy, "top");
    }

    function enemyMove(ele, attr) {
        let speed = null;

        if (ele.type == 1) {
            speed = 1.5;
        } else if (ele.type == 2) {
            speed = 1;
        } else if (ele.type == 3) {
            speed = 0.5;
        }
        
        ele.timer = setInterval(function() {
            let moveVal = getStyle(ele, attr);

            if (moveVal >= gameH) {
                clearInterval(ele.timer);
                enemys.removeChild(ele);
                enemyss.splice(0, 1);
            } else {
                ele.style[attr] = moveVal + speed + "px";

                danger(ele);
                gameover();
            }
        }, 10)
    }

    function clear(childs) {
        for (let i = 0; i < childs.length; i++) {
            clearInterval(childs[i].timer);
        }
    }

    function reStart(childs, type) {
        for (let i = 0; i < childs.length; i++) {
            type == 1 ?  move(childs[i], "top") : enemyMove(childs[i], "top");
        }
    }

    function bgMove() {
        if (bgTimer) return;

        bgTimer = setInterval(function() {
             bgPositionY += 0.4;

             if (bgPositionY >= gameH) {
                 bgPostionY = 0;
             }

             gameEnter.style.backgroundPositionY = bgPositionY + "px";
        }, 10)
    }

    function danger(enemy) {
        for (let i = 0; i < bulletss.length; i++) {
            let bulletL = getStyle(bulletss[i], "left")
            ,   bulletT = getStyle(bulletss[i], "top")
            ;

            let enemyL = getStyle(enemy, "left")
            ,   enemyT = getStyle(enemy, "top")
            ,   enemyH = getStyle(enemy, "height")
            ,   enemyW = getStyle(enemy, "width")
            ;

            let condition = bulletL + bulletH >= enemyL
                         && bulletL <= enemyL + enemyW
                         && bulletT <= enemyT + enemyH
                         && bulletT + bulletH >= enemyT
            ;

            if (condition) {
                clearInterval(bulletss[i].timer);
                bullets.removeChild(bulletss[i]);
                bulletss.splice(i, 1);

                enemy.hp -= 50;
                if (enemy.hp == 0) {
                    clearInterval(enemy.timer);

                    enemy.src = "images/bz" + enemy.type + ".gif";
                    enemy.dead = true;

                    scores += enemy.score;
                    score.innerHTML = scores;
                }
            }
        }
    }

    function delEnemy() {
        for (let i = enemyss.length - 1; i >= 0; i--) {
            if (enemyss[i].dead) {
                (function(index) {
                    enemys.removeChild(enemyss[index]);
                    enemyss.splice(index, 1);
                })(i)
            }
        }
    }

    function gameover() {
        for (let i = 0; i < enemyss.length; i++) {
            if (!enemyss[i].dead) {
                let enemyL = getStyle(enemyss[i], "left")
                ,   enemyT = getStyle(enemyss[i], "top")
                ,   enemyH = getStyle(enemyss[i], "height")
                ,   enemyW = getStyle(enemyss[i], "width")
                ;

                let myTankL = getStyle(myTank, "left")
                ,   myTankT = getStyle(myTank, "top")
                ;

                let condition = myTankL + myTankW >= enemyL
                             && myTankL <= enemyL + enemyW
                             && myTankT <= enemyT + enemyH
                             && myTankT + myTankW >= enemyT
                ;

                if (condition) {
                    clearInterval(bulletTimer);
                    clearInterval(enemyTimer);
                    clearInterval(bgTimer);
                    bulletTimer = null;
                    enemyTimer = null;
                    bgTimer = null;

                    remove(bulletss);
                    remove(enemyss);

                    bulletss = [];
                    enemyss = [];

                    document.onmousemove = null;

                    alert("就这？？？？？");

                    gameStart.style.display = "block";
                    gameEnter.style.display = "none";

                    myTank.style.left = "calc(50% - 49.5px)";
                    myTank.style.top = gameH - myTankH + "px";
                }
            }
        }
    }

    function remove(childs) {
        for (let i = childs.length - 1; i >= 0; i--) {
            clearInterval(childs[i].timer);
            childs[i].parentNode.removeChild(childs[i]);
        }
    }
}                                                                                                                                                                                              