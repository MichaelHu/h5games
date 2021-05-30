function init(){

    var B2 = Box2D, 
        b2Vec2 = B2.Common.Math.b2Vec2,
        b2AABB = B2.Collision.b2AABB,
        b2BodyDef = B2.Dynamics.b2BodyDef,
        b2Body = B2.Dynamics.b2Body,
        b2FixtureDef = B2.Dynamics.b2FixtureDef,
        b2Fixture = B2.Dynamics.b2Fixture,
        b2World = B2.Dynamics.b2World,
        b2PolygonShape = B2.Collision.Shapes.b2PolygonShape,
        b2DebugDraw = B2.Dynamics.b2DebugDraw;


    var canvas = document.getElementById('canvas'),
        canvasPosition = getElementPosition(canvas),
        context = canvas.getContext('2d');



    var worldScale = 30,
        dragConstant = 0.05,
        dampingConstant = 2,
        world = new b2World(
            new b2Vec2(0, 10)
            , true
        );


    document.addEventListener('mousedown', onMouseDown);
    debugDraw();
    window.setInterval(update, 1000/60);


    CreateBox( 640, 30, 320, 480, b2Body.b2_staticBody, null);
    CreateBox( 640, 30, 320, 0, b2Body.b2_staticBody, null);
    CreateBox( 30, 480, 0, 240, b2Body.b2_staticBody, null);
    CreateBox( 30, 480, 640, 240, b2Body.b2_staticBody, null);



    function onMouseDown(e){
        var evt = e || window.event;
        createArrow(
            e.clientX - canvasPosition.x
            , e.clientY - canvasPosition.y
        );
    }

    function createArrow(pX, pY){

        // var angle = Math.atan2(pY - 450, pX);
        var angle = Math.atan2(pY - 440, pX - 30);

        var vertices = [];
        vertices.push(new b2Vec2(-1.4, 0));
        vertices.push(new b2Vec2(0, -0.1));
        vertices.push(new b2Vec2(0.6, 0));
        vertices.push(new b2Vec2(0, 0.1));

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set( 30 / worldScale, 440 / worldScale);
        bodyDef.userData = 'Arrow';

        var polygonShape = new b2PolygonShape;
        polygonShape.SetAsVector(vertices, 4);

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.5;
        fixtureDef.restitution = 0.2;
        fixtureDef.shape = polygonShape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);

        body.SetLinearVelocity(
            new b2Vec2(50 * Math.cos(angle), 50 * Math.sin(angle))
        );
        body.SetAngle(angle);
        body.SetAngularDamping(dampingConstant);
    }

    function CreateBox(width, height, pX, pY, type, data){
        var bodyDef = new b2BodyDef;
        bodyDef.type = type;
        bodyDef.position.Set(pX / worldScale, pY / worldScale);
        bodyDef.userData = data;

        var polygonShape = new b2PolygonShape;
        polygonShape.SetAsBox( width / 2 / worldScale, height / 2 / worldScale );

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.5;
        fixtureDef.restitution = 0;
        fixtureDef.shape = polygonShape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
    }

    function debugDraw(){
        var debugDraw = new b2DebugDraw();

        with(debugDraw){
            SetSprite(context);
            SetDrawScale(worldScale);
            SetFillAlpha(0.6);
            SetLineThickness(1.0);
        }

        // can not be within with
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

        world.SetDebugDraw(debugDraw);
    }

    function update(){
        world.Step( 1 / 60, 10, 10);
        world.ClearForces();

        for(var b = world.m_bodyList; b != null; b = b.m_next){
            if(b.GetUserData() === 'Arrow'){
                updateArrow(b);
            }
        }

        world.DrawDebugData();
    }

    function updateArrow(arrowBody){
        var flightSpeed = Normalize2( arrowBody.GetLinearVelocity() );

        var bodyAngle = arrowBody.GetAngle();
        var pointingDirection = new b2Vec2( Math.cos(bodyAngle), -Math.sin(bodyAngle));

        var flightAngle = Math.atan2(
                arrowBody.GetLinearVelocity().y
                , arrowBody.GetLinearVelocity().x
            );
        var flightDirection = new b2Vec2(
                Math.cos(flightAngle)
                , Math.sin(flightAngle)
            );

        var dot = b2Dot( flightDirection, pointingDirection );
        var dragForceMagnitude = ( 1 - Math.abs( dot ) )
                * flightSpeed 
                * flightSpeed
                * dragConstant
                * arrowBody.GetMass();

        var arrowTailPosition = arrowBody.GetWorldPoint( new b2Vec2( -1.4, 0 ) );
        arrowBody.ApplyForce( new b2Vec2 (
                dragForceMagnitude * - flightDirection.x
                , dragForceMagnitude * -flightDirection.y
            )
            , arrowTailPosition
        );
    }

    function b2Dot(a, b){
        return a.x * b.x + a.y * b.y;
    }

    function Normalize2(b){
        return Math.sqrt( b.x * b.x + b.y * b.y);
    }

    function getElementPosition(element){
        var elem = element, 
            tagName = '',
            x = 0,
            y = 0;

        while( typeof elem == 'object' && typeof elem.tagName == 'string' ){
            x += elem.offsetTop;
            y += elem.offsetLeft;

            tagName = elem.tagName.toUpperCase();

            if('BODY' == tagName){
                elem = 0;
            }

            if(typeof elem == 'object'){
                elem = elem.offsetParent;
            }
        }
        return {x: x, y: y};
    }

}
