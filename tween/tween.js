$(function(){


var Q = Quintus()
    .include('Sprites, Scenes, Anim')
    .setup({
        width: 320
        , height: 320
    });


Q.scene('scene1', function(stage){

    var sprite = new Q.Sprite({
            asset: 'enemy01.png'
            , x: 32
            , y: 32
            , scale: 1
        });

    sprite.add('tween');
    stage.insert(sprite);

    sprite
        .animate({x: 288, y: 288}, 1, Q.Easing.Quadratic.InOut, {delay: 2})
        ;

});


Q.load(['enemy01.png'], function(){
    Q.stageScene('scene1');
});



});
