/*
 *  已知的 BUG :
 *      1、该 BUG 导致当游戏窗口改变时，飞机的移动范围不会改变。
 *      2、该 BUG 导致当连续暂停游戏时，敌机不会出现。
 *      3、该 BUG 导致当敌机爆炸时暂停游戏，爆炸动画延长。
 *      4、该 BUG 导致敌机爆炸动画时间不一，甚至没有爆炸动画。
 *      5、该 BUG 导致敌机爆炸时停留在页面并循环爆炸动画。
 *      6、该 BUG 导致死亡次数多时，游戏崩溃。
 *      7、该 BUG 导致长按开始游戏时，可以在任意位置开始。
*/

window.onload = function() {
    function getId(idName) {
        return document.getElementById(idName);
    }

    function getStyle(ele, attr) {
        let res = null;

        if (ele.currentStyle) {
            res = ele.currentStyle[attr];
        } else {
            res = window.getComputedStyle(ele, null)[attr];
        }

        return parseFloat(res);
    }

    let game = getId("game")
    ,   gameStart = getId("gameStart")
    ,   playButton = getId("play")
    ,   gameEnter = getId("gameEnter")
    ,   myPlane = getId("myPlane")
    ,   bullets = getId("bullets")
    ,   enemys = getId("enemys")
    ,   tips = getId("tips")
    ,   score = getId("scores").firstElementChild.firstElementChild;
    ;

    let gameW = getStyle(game, "width")
    ,   gameH = getStyle(game, "height")
    ;

    let myPlaneW = getStyle(myPlane, "width")
    ,   myPlaneH = getStyle(myPlane, "height")
    ;

    let maxW = document.body.clientWidth - myPlane.offsetWidth
    ,   maxH = document.body.clientHeight - myPlane.offsetHeight
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

    tips.onclick = function() {
        tips.style.display = "none"
    }

    playButton.onclick = function() {
        gameStart.style.display = "none";
        gameEnter.style.display = "block";

        document.onmousedown = function(evt) {
            this.onmousemove = myPlaneMove;

            bgMove();
            shot();
            appearEnemy();

            if (bulletss != 0) reStart(bulletss, 1);
            if (enemyss != 0) reStart(enemyss);
        }

        document.onmouseup = function(evt) {
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

        document.addEventListener("touchstart", function(evt) {
            let e = evt || window.event;
            let touch = e.targetTouches[0];

            oL = touch.clientX - myPlane.offsetLeft;
            oT = touch.clientY - myPlane.offsetTop;

                    
            this.ontouchmove = myPlaneMove;

            bgMove();
            shot();
            appearEnemy();

            if (bulletss != 0) reStart(bulletss, 1);
            if (enemyss != 0) reStart(enemyss);
        })

        document.addEventListener("touchmove", function(evt) {
            let e = evt || window.event;
            let touch = e.targetTouches[0];

            let oLeft = touch.clientX - oL
            ,   oTop = touch.clientY - oT
            ;

            if (oLeft < 0) {
                oLeft = 0;
            } else if (oLeft >= maxW) {
                oLeft = maxW;
            }

            if (oTop < 0) {
                oTop = 0;
            } else if (oTop >= maxH) {
                oTop = maxH; 
            }

            myPlane.style.left = oLeft + "px";
            myPlane.style.top = oTop + "px";  
        })

        document.addEventListener("touchend", function() {
            this.onmousemove = null;

            clearInterval(bulletTimer);
            clearInterval(enemyTimer);
            clearInterval(bgTimer);
            bulletTimer = null;
            enemyTimer = null;
            bgTimer = null;

            clear(bulletss);
            clear(enemyss);

            document.removeEventListener("touchmove", defaultEvent);
        })
    }


    function myPlaneMove(evt) {
        let e = evt || window.event;
        
        let mouse_x = e.x || e.pageX
        ,   mouse_y = e.y || e.pageY
        ;

        let last_myPlane_left = mouse_x - myPlaneW / 2
        ,   last_myPlane_top = mouse_y - myPlaneH / 2
        ;

        if (last_myPlane_left <= 0) {
            last_myPlane_left = 0;
        } else if (last_myPlane_left >= gameW - myPlaneW) {
            last_myPlane_left = gameW - myPlaneW;
        }
        
        if (last_myPlane_top <= 0) {
            last_myPlane_top = 0;
        } else if (last_myPlane_top >= gameH - myPlaneH) {
            last_myPlane_top = gameH - myPlaneH;
        } 

        myPlane.style.left = last_myPlane_left + "px";
        myPlane.style.top = last_myPlane_top + "px";
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

        let myPlaneL = getStyle(myPlane, "left")
        ,   myPlaneT = getStyle(myPlane, "top")
        ;

        let bulletL = myPlaneL + myPlaneW / 2 - bulletW / 2
        ,   bulletT = myPlaneT - bulletH
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

                let myPlaneL = getStyle(myPlane, "left")
                ,   myPlaneT = getStyle(myPlane, "top")
                ;

                let condition = myPlaneL + myPlaneW >= enemyL
                             && myPlaneL <= enemyL + enemyW
                             && myPlaneT <= enemyT + enemyH
                             && myPlaneT + myPlaneW >= enemyT
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
                    scores = 0;
                    score.innerHTML = scores;

                    document.onmousemove = null;
                    gameStatus = !gameStatus;

                    alert("就这？？？？？");

                    gameStart.style.display = "block";
                    gameEnter.style.display = "none";

                    myPlane.style.left = "calc(50% - 49.5px)";
                    myPlane.style.top = gameH - myPlaneH + "px";
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