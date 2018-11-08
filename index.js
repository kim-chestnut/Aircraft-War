    let score = 0;
    let index = -1;
    //游戏结束类
    class Gameover{
        constructor(plane){
            this.plane = plane;
            this.$endBox = $("#end");
            this.$thisScore = $("#this-score");
            this.$maxScore = $("#max-score");
            this.$resetBtn = $("#reset-btn");
            this.maxScore = 0;
            this.thisScore = 0;
        }
        init(){
            this.showOverGameView();
            this.stopGame();
            this.cacheScore();
            this.showScore();
            this.resetGame();
        }
        //暂停游戏
        stopGame(){
            clearInterval(this.plane.timeBullet);
            clearInterval(this.plane.timeEatHot);
            clearInterval(this.plane.timePlane)
            clearInterval(this.plane.timePrincipal);
            this.plane.$planeBox.html("");
            this.plane.$principalBox.html("");
        }
        //显示游戏结束界面
        showOverGameView(){
            this.$endBox.css("display","block");
        }
        //分数存入本地
        cacheScore(){
            var arrScore = [];
            localStorage.setItem(new Date().getTime(),score);
            for(let prop in localStorage){
                if(! isNaN(Number(prop))) {
                    arrScore.push(localStorage.getItem(prop));
                }
            }
            this.maxScore = Reflect.apply(Math.max,Math,arrScore);
        }
        showScore(){
            this.$thisScore.html(score);
            this.$maxScore.html(this.maxScore);
        }
        resetGame(){
            this.$resetBtn.on("click",()=>{
                this.$endBox.css("display","none");
                clearInterval(this.plane.timeBullet);
                clearInterval(this.plane.timeEatHot);
                clearInterval(this.plane.timePlane)
                clearInterval(this.plane.timePrincipal);
                this.plane.$planeBox.html("");
                this.plane.$principalBox.html("");
                new Game().init();
            })
        }
    }
    
    // 游戏类
    class Game {
        constructor(){
            this.$contentBox = $("#content");
            this.$planeBox = $("#plane-box");
            this.$principalBox = $("#principal-box");
            this.timeBullet = null;
            this.timePrincipal = null;
            this.timeEatHot = null;
            this.timePlane = null;
            this.principalArr = new Set();
            this.bulletArr = new Set();
        }
        init(){
            clearInterval(this.timeBullet);
            clearInterval(this.timeEatHot);
            clearInterval(this.timePlane)
            clearInterval(this.timePrincipal);
            this.$planeBox.html("");
            this.$principalBox.html("");
            this.addContent();
        }
        addContent(){
            this.ceratePlane();
            this.$planeBox.append($(this.plane));
        }
        //生成飞机
        ceratePlane(){
            this.plane = document.createElement('div');
            $(this.plane).addClass("plane");
            this.enterPlane();
            this.movePlane();
            this.createBullet();
            this.createPrincipal();
            this.isEatHot();
            this.isPanleCollisionPrincipal();
        }
        //飞机进入页面
        enterPlane(){
            $(this.plane).animate({
                bottom : "50px",
            },500);
        }
        //飞机移动
        movePlane(){
            let endX,endY;
            this.$contentBox.on("touchstart", (e) => {
                this.$contentBox.on('touchmove', (e) => {
                    var e = e || window.event;
                    var touchMove = e.touches[0];
                    endX = Number(touchMove.pageX);
                    endY = Number(touchMove.pageY);
                    $(this.plane).css({
                        top: endY - 50 ,
                        left: endX - 50,
                    })
                });
                this.$contentBox.on("touchend",()=> {
                    this.$contentBox.off("touchmove");
                })
            });
        }
        //生成子弹
        createBullet(){
            var _self = this;
            this.timeBullet = setInterval(() => {
                var planeX = parseInt($(this.plane).css("left"));
                var planeY = parseInt($(this.plane).css("top"));
                var bulletX = planeX + 45;
                var bulletY = planeY - 40;
                var bullet = document.createElement("span");
                $(bullet).addClass("bullet");
                $(bullet).css({
                    top: bulletY,
                    left:bulletX,
                })
                this.bulletArr.add(bullet);
                this.$planeBox.append($(bullet));
                $(bullet).animate({
                    top: "-50px",
                },800,"linear",function(){
                    _self.bulletArr.delete(this);
                    $(this).remove();
                    this.time = null;
                })
            },150)
        }
        //生成校长
        createPrincipal(){
            var _selt = this;
            this.timePrincipal = setInterval( () => {
                var principal = document.createElement("span");
                var parentWidth = parseInt(this.$principalBox.css("width"));
                var principalLeft = Math.floor(Math.random() * (parentWidth-25));
                $(principal).addClass("principal nohit").css({
                    left: principalLeft,
                });
                principal.hit = false;
                this.principalArr.add(principal);
                this.$principalBox.append($(principal));
                $(principal).animate({
                    bottom:"-50px",
                },5000,"linear",function(){
                    $(this).remove();
                    _selt.principalArr.delete(this);
                })
            },500)
        }
        //判断是否吃到热狗
        isEatHot(){
            this.timeEatHot = setInterval(() => {
                for (let pri of this.principalArr) {
                    for (let bul of this.bulletArr) {
                        pri.priX = parseInt($(pri).css("left"));
                        pri.priY = parseInt($(pri).css("top"));
                        bul.bulX = parseInt($(bul).css("left"));
                        bul.bulY = parseInt($(bul).css("top"));
                        if ((bul.bulX - pri.priX > 0 && bul.bulX - pri.priX < 50)) {
                            if (bul.bulY - pri.priX < 30){
                                score ++;
                                $(pri).removeClass('nohit').addClass("hit");
                                $(bul).remove();
                                setTimeout(function(){
                                    $(pri).remove();
                                },500)
                                
                            } 
                        }
                    }
                }
            },300)
        }
        //判断飞机是否和王校长碰撞
        isPanleCollisionPrincipal(){
            this.timePlane = setInterval( () => {
                var planeX = parseInt($(this.plane).css("left"));
                var planeY = parseInt($(this.plane).css("top"));
                for(let pri of this.principalArr) {
                    var priX = parseInt($(pri).css("left"));
                    var priY = parseInt($(pri).css("top"));
                    if(planeY - priY < 60 &&  planeY - priY > -100) {
                        if(planeX - priX <60 && priX - planeX < 120) {
                            index++;
                            new Gameover(this).init();
                        }
                    }
                }
            },0)
        }

    }
    
    
    
    //开始游戏类
    class Start {
        constructor(){
            this.$startBtn = $("#start_btn");
            this.$startBox = $("#start");
        }
        init(){
            this.bindEvent();
        }
        bindEvent(){
            this.$startBtn.on("click", this.startGame.bind(this));
        }
        startGame() {
            this.$startBox.css("display","none");
            new Game().init();
        }
    }
    const start = new Start();
    start.init();


// bullet.time = setInterval(function (that) {
//     // 判断是否打中
//     for (var ele of _self.principalArr) {
//         ele.eleX = parseInt($(ele).css("left"));
//         ele.eleY = parseInt($(ele).css("top"));
//         that.bulX = parseInt($(that).css("left"));
//         that.bulY = parseInt($(that).css("top"));
//         if ((that.bulX - ele.eleX > 0 && that.bulX - ele.eleX < 50) && (that.bulY - ele.eleY < 30)) {
//             $(ele).removeClass('nohit').addClass("hit");
//             $(ele).fadeOut();
//             $(that).remove();
//             that.time = null;
//         }
//     }
// }, 1000, bullet)