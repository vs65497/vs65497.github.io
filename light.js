import { Vector } from './vector.class.js';
import { MathExt } from './math-extend.class.js';
import { Sound } from './sound.js';

var content;
var canvas;
var cursor = {x:9999,y:9999};
var cursor3d = {pitch:0, yaw:0};
var cursor_info;
var is_clicking = false;
var ctx, ctx2;

var viewport = {w:1024/1.5,h:768/1.5};
var origin = {x:0, y:0, z:0};

var sphere = {};
var colors = {
    teal: '0, 128, 128',
    cyan: '0, 255, 255',
    blue: '0, 0, 255',
    purple: '128, 0, 128',
    yellow: '255, 255, 0',
    orange: '255, 165, 0',
    white: '255, 255, 255',
    black: '0, 0, 0',
    red: '255, 0, 0'
};

var camera = {
    direction: {i:0,j:0,k:0}, // leave here for camera movement
    fov: MathExt.prototype.to_radians(30),
    center: {x:0,y:0}
};

var light = {
    center: {x:0,y:0,z:0},
    color: colors.white,
    intensity: 1
}

var redraw; // animation interval
var sphere_density = 3;
var animation_speed = 60;
var is_playing = false;
var step_increment = 2;
var original_axis = {w:0,i:.704,j:.71,k:0};
var current_axis = {w:0,i:.704,j:.71,k:0};

var keyboard;

var move_log = [];
var startTime = 0;

function main() {
    init_canvas();
    init_sphere(sphere_density);
    init_map();
    init_ui();
    init_sound();
    init_table_keys();
    update_camera();
    draw(sphere);
    init_move_log();
    
    show_info();
    
    //animate(sphere, animation_speed);
}

function show_info() {
    console.log('density: '+sphere_density);
    console.log('animation speed: '+animation_speed);
    console.log('step increment: '+step_increment);
    console.log();
    console.log('camera:');
    console.log(camera);
    console.log();
    console.log('light source:');
    console.log(light);
    console.log();
}

function animate(entity, frames) {
    if(is_playing) return;
    is_playing = true;

    var tickrate = 1000 / frames;
    var degree = step_increment;
    redraw = setInterval(function(){
        reset_canvas();
        draw(entity,degree);
    },tickrate);
}

function move(new_axis) {
    if(is_playing) return;
    is_playing = true;

    var tickrate = 1000 / frames;
    var degree = 1;
    var counter = sphere_density * 2;
    sphere.rotation_axis = new_axis;
    redraw = setInterval(function(){
        reset_canvas();
        // sigmoid activation function
        degree = 1 / (1+ Math.pow(Math.E, -0.01*(counter-(counter/2))));
        draw(sphere,degree*5);
        counter--;
        if(counter == 0) {
            clearInterval(redraw);
            is_playing = false;
        }
    },tickrate);
}

function pause() {
    clearInterval(redraw);
    is_playing = false;
}

function reset_canvas() {
    ctx.translate(-viewport.w/2,-viewport.h/2);
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,viewport.w,viewport.h);
    ctx.translate(viewport.w/2,viewport.h/2);
}

function reset_map() {
    sphere.hover_id = -1;
    sphere.selected_id = -1;

    ctx2.fillStyle = 'rgba('+colors.white+',1)';
    ctx2.fillRect(0,0,viewport.w,viewport.h);
}

function update_camera() {
    var f = Math.round(viewport.h / Math.tan(camera.fov/2));
    camera.center.z = -f;
    
    light.center.y = f;
    light.center.z = 0;
    //light.center.z = f - 30;
    //light.center.x = f + 20
}

function init_canvas() {
    content = document.getElementById("content");
    canvas = document.createElement("canvas");
    canvas.width = viewport.w;
    canvas.height = viewport.h;
    
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba('+colors.white+',1)';
    ctx.fillRect(0,0,viewport.w,viewport.h);
    ctx.translate(viewport.w/2,viewport.h/2);
    
    content.appendChild(canvas);
}

function init_map() {
    var map = document.createElement("canvas");
    map.setAttribute("id","map");
    map.width = viewport.w;
    map.height = viewport.h;
    
    ctx2 = map.getContext('2d');
    ctx2.fillStyle = 'rgba('+colors.white+',1)';
    ctx2.fillRect(0,0,viewport.w,viewport.h);
    
    content.appendChild(map);

    draw_map();
}

function init_table_keys() {
    var form = document.createElement("form");
    form.setAttribute("id","keys-form");

    for(var i = 0; i < sphere_density*2; i++) {
        var row = document.createElement("div");
        row.setAttribute("class", "row");

        for(var j = 0; j < sphere_density*4; j++) {
            var cell = document.createElement("div");
            cell.setAttribute("class", "cell");

            var key = keyboard.mappings[i*sphere_density*4+j];
            var input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("name", "key-" + i + "-" + j);
            input.setAttribute("value", key[0] + ',' + key[1]);

            cell.appendChild(input);
            row.appendChild(cell);
        }

        form.appendChild(row);
    }

    var submitButton = document.createElement("input");
    submitButton.setAttribute("type", "submit");
    submitButton.setAttribute("value", "Update Keys");

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        var form = document.getElementById("keys-form");
        var inputs = form.getElementsByTagName("input");
        var newMappings = [];
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var value = input.value;
            var key = value.split(",");
            newMappings.push([key[0],key[1]]);
        }
        keyboard.setMappings(newMappings);
        console.log("Updated keyboard mappings:", keyboard.mappings);
    });

    var testButton = document.createElement("input");
    testButton.setAttribute("type", "submit");
    testButton.setAttribute("value", "Test");
    testButton.addEventListener('click', function(event) {
        event.preventDefault();
        var form = document.getElementById("keys-form");
        var inputs = form.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.type !== "submit") {
                input.value = "C,C";
            }
        }
    });

    var resetButton = document.createElement("input");
    resetButton.setAttribute("type", "submit");
    resetButton.setAttribute("name", "reset");
    resetButton.setAttribute("value", "Reset Keys");
    resetButton.addEventListener('click', function(event) {
        event.preventDefault();
        keyboard.resetKeys();
        
        var inputs = document.getElementById("keys-form").getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.type !== "submit") {
                var key = keyboard.mappings[i];
                input.value = key[0] + ',' + key[1];
            }
        }
    });

    form.appendChild(submitButton);

    form.appendChild(testButton);
    form.appendChild(resetButton);

    document.getElementById("table").appendChild(form);

}

/*
var table = document.createElement("table");
    table.setAttribute("id","keys");
    table.setAttribute("border","1");
    table.setAttribute("cellpadding","5");
    table.setAttribute("cellspacing","0");

    for(var i = 0; i < sphere_density*2; i++) {
        var row = table.insertRow(i);
        for(var j = 0; j < sphere_density*4; j++) {
            var cell = row.insertCell(j);
            var key = keyboard.mappings[i*sphere_density*4+j];
            cell.innerHTML = key[0]+','+key[1];
        }
    }

    document.getElementById("table").appendChild(table);
*/

function init_ui() {
    var form = document.createElement("form");

    var yaw_left = document.createElement("input");
    yaw_left.setAttribute("type","button");
    yaw_left.setAttribute("name","yaw-left");
    yaw_left.setAttribute("value","yaw left");
    yaw_left.addEventListener('click',function(){
        move({w:0,i:0,j:1,k:0});
    });

    var yaw_right = document.createElement("input");
    yaw_right.setAttribute("type","button");
    yaw_right.setAttribute("name","yaw-right");
    yaw_right.setAttribute("value","yaw right");
    yaw_right.addEventListener('click',function(){
        move({w:0,i:0,j:-1,k:0});
    });

    var pitch_up = document.createElement("input");
    pitch_up.setAttribute("type","button");
    pitch_up.setAttribute("name","pitch_up");
    pitch_up.setAttribute("value","pitch up");
    pitch_up.addEventListener('click',function(){
        move({w:0,i:1,j:0,k:0});
    });

    var pitch_down = document.createElement("input");
    pitch_down.setAttribute("type","button");
    pitch_down.setAttribute("name","pitch_down");
    pitch_down.setAttribute("value","pitch down");
    pitch_down.addEventListener('click',function(){
        move({w:0,i:-1,j:0,k:0});
    });

    var step = document.createElement("input");
    step.setAttribute("type","button");
    step.setAttribute("name","step-forward");
    step.setAttribute("value","step forward");
    step.addEventListener('click',function(){
        draw(sphere,step_increment);
    });
    
    var spin = document.createElement("input");
    spin.setAttribute("type","button");
    spin.setAttribute("name","spin");
    spin.setAttribute("value","spin");
    spin.addEventListener('click',function(){
        current_axis = original_axis;
        sphere.rotation_axis = original_axis;
        animate(sphere, animation_speed);
    });

    var play = document.createElement("input");
    play.setAttribute("type","button");
    play.setAttribute("name","play");
    play.setAttribute("value","play");
    play.addEventListener('click',function(){
        go_replay();
    });
    
    var stop = document.createElement("input");
    stop.setAttribute("type","button");
    stop.setAttribute("name","pause");
    stop.setAttribute("value","pause");
    stop.addEventListener('click',function(){
        pause();
    });

    var clear = document.createElement("input");
    clear.setAttribute("type","button");
    clear.setAttribute("name","clear");
    clear.setAttribute("value","clear");
    clear.addEventListener('click',function(){
        reset_map();
        init_move_log();
    });
    
    form.appendChild(yaw_left);
    form.appendChild(yaw_right);
    form.appendChild(pitch_up);
    form.appendChild(pitch_down);
    form.appendChild(step);
    form.appendChild(spin);
    form.appendChild(play)
    form.appendChild(stop);
    form.appendChild(clear);
    document.getElementById("controls").appendChild(form);

    cursor_info = document.getElementById("cursor");
    var mouse_move = function(event) {
        var rect = canvas.getBoundingClientRect();
        cursor.x = (event.clientX + 10) - Math.floor(rect.right/2);
        cursor.y = (event.clientY + 10) - Math.floor(rect.bottom/2);
        cursor_info.innerHTML = 
            'density: '+sphere_density+', id: '+sphere.hover_id+
            '<br>x: '+cursor.x+', y: '+cursor.y+
            '<br>pitch: '+(cursor3d.pitch)+
            ', yaw: '+(cursor3d.yaw);
        
        draw(sphere,0);
        draw_map();
    };
    canvas.addEventListener('mousemove', mouse_move);

    canvas.addEventListener('mousedown', function(event) {
        is_clicking = true;
        draw(sphere,0);
        draw_map();
    });
    canvas.addEventListener('mouseup', function(event) {
        is_clicking = false;
        //sphere.selected_id = -1;
        draw(sphere,0);
        draw_map();
    });

    document.addEventListener('keydown', function(event) {
        // Handle key press event here
        switch(event.key) {
            case 'w':
                move({w:0,i:1,j:0,k:0});
                break;
            case 's':
                move({w:0,i:-1,j:0,k:0});
                break;
            case 'a':
                move({w:0,i:0,j:-1,k:0});
                break;
            case 'd':
                move({w:0,i:0,j:1,k:0});
                break;
            case 'q':
                move({w:0,i:0,j:0,k:-1});
                break;
            case 'e':
                move({w:0,i:0,j:0,k:1});
                break;
            case 'p':
                pause();
                break;
            case 'r':
                animate(sphere, animation_speed);
                break;
            case 'ArrowUp':
                draw(sphere,step_increment);
                break;
            case 'ArrowDown':
                draw(sphere,-step_increment);
                break;
        }
    });
}

function init_sphere(d) {
    var center = origin;
    var radius = 150;
    var density = 4 * d; // quadrants * (points / quadrant)
    var rotation_axis = original_axis;
    
    var x;
    var z;
    
    var creation_axis = {
        w: 0,
        i: 0,
        j: 1,
        k: 0
    }
    
    // create vertecies
    var points = [];
    for(var col=0;col<2*density;col++) {
        z = MathExt.prototype.to_radians((360/2/density) * (col));
        points[col] = [];
        
        for(var row=0;row<density;row++) {
            x = MathExt.prototype.to_radians((360/density) * (row));
            
            var r = {
                w: Math.cos(z),
                x: Math.sin(z)*creation_axis.i,
                y: Math.sin(z)*creation_axis.j,
                z: Math.sin(z)*creation_axis.k
            };

            var r1 = {
                w: r.w,
                x: -r.x,
                y: -r.y,
                z: -r.z
            };
            
            var p = {
                w: 0,
                x: radius * Math.sin(x),
                y: radius * Math.cos(x),
                z: 0
            };
            
            points[col][row] = Vector.prototype.hamilton(Vector.prototype.hamilton(r,p),r1);
            points[col][row] = Vector.prototype.add(points[col][row], origin);
        }
    }
    console.log("points: "+points.length*points[0].length);
    
    // create polygons
    var polygons = [];
    var id = 0;
    for(var col=0;col<points.length/2;col++) {
        var nxc = (col+1==points.length)? 0:col+1;
        
        for(var row=0;row<points[col].length/2;row++) {
            var nxr = (row+1==points[col].length)? 0:row+1;
            
            // Leave here for texture mapping
            var rand = MathExt.prototype.get_random(0,Object.keys(colors).length-1);

            var iter = 0;
            var color = colors['teal'];
            for (const [key, value] of Object.entries(colors)) {
                if (iter == rand && key != 'white' && 
                    key != 'black' && key != 'red') {
                    color = colors[key];
                }
                iter++;
            }

            polygons.push({
                index: id++,
                color: color,
                vertex: [
                    points[col][row],
                    points[col][nxr],
                    points[nxc][nxr],
                    points[nxc][row]
                ]
            });
        }
    }

    console.log("polys: "+polygons.length);
    
    sphere = {
        rotation_axis: rotation_axis,
        center: center,
        radius: radius,
        density: density,
        type: 'sphere',
        color: colors.cyan,
        polygon: polygons,
        hover_id: -1,
        selected_id: -1
    };
}

function init_move_log() 
{
    move_log = [];
    startTime = (new Date()).getTime();
    console.log("start time: "+startTime);

    /*var limit = 10;
    var outputLog = setInterval(function(){
        if(limit == 0) {
            clearInterval(outputLog);
            return;
        }
        console.log(move_log);
        limit--;
    },2000);*/
}

function init_sound() {
    keyboard = new Sound();
}

function go_replay() {
    console.log('starting replay process...');
    console.log(move_log);
    reset_map();

    var frame = 0;
    var timer = move_log[0].time;
    var buffer = 5;

    var replay = setInterval(function()
    {
        for(var i = 0; i < buffer; i++) {
            if(frame == move_log.length) {
                clearInterval(replay);
                timer = 0;
                frame = 0;
                //init_move_log();
    
                console.log('replay process ended.');
                return;
            }
            if(move_log[frame].time == timer) {
                //console.log(frame);
                draw_map(frame);
                frame++;
            }
            timer++;
        }
    },buffer);
}

function draw(entity,angle) {
    var f = camera.center.z;
    var c = camera.center;
    angle = (angle==null)?45:angle;
    
    var flatpt;
    
    for(var poly=0;poly<entity.polygon.length;poly++) {
        var polygon = entity.polygon[poly];
        
        flatpt = [];
        ctx.beginPath();
            for(var v=0;v<polygon.vertex.length;v++) {
                var p = {};
                var t = Vector.prototype.rotate({
                    vector: polygon.vertex[v],
                    origin: entity.center,
                    angle: MathExt.prototype.to_radians(angle),
                    axis: entity.rotation_axis
                });
                
                entity.polygon[poly].vertex[v] = t;

                p.x = (f - c.x) * ((t.x - c.x) / (t.z + f)) + c.x;
                p.y = (f - c.y) * ((t.y - c.y) / (t.z + f)) + c.y;

                flatpt[v] = {
                    x: p.x,
                    y: p.y,
                    z: 0
                };
                
                ctx.lineTo(p.x, p.y);
            }
        ctx.closePath();
        
        var camera_vis = is_visible(camera.center, entity.center, polygon.vertex);
        var center_plane = Math.sqrt(Math.pow(camera_vis.a,2) + Math.pow(camera_vis.b,2));
        var backface = Math.abs(camera_vis.c) < center_plane;

        if(!backface) {
            var lighting = light_poly(entity.center, polygon.vertex, polygon.color);
            
            var checkpoint = {x:cursor.x-15,y:cursor.y-15};

            if (isWithinRhombus(checkpoint, flatpt, polygon.index) && !is_playing) 
            {
                sphere.hover_id = polygon.index;
                if(is_clicking) {
                    sphere.selected_id = polygon.index;
                    move_log[move_log.length-1].is_clicked = true;
                    //console.log(move_log[move_log.length-1]);

                    var cur_key = keyboard.keys[polygon.index];
                    cur_key.player1.play(cur_key.note1, 0.1, "sine").stop(1);
                    cur_key.player2.play(cur_key.note2, 0.1, "sine").stop(1);
                    console.log(polygon.index,cur_key.name1, cur_key.name2);

                    ctx.fillStyle = 'rgba(' + colors.cyan + ', 1)';
                } else {
                    ctx.fillStyle = 'rgba(' + colors.red + ', 1)';
                }

                setCursor3D(checkpoint, flatpt, polygon.index);
            } 
            else 
            {
                ctx.fillStyle = lighting.fill_style;
            }

            ctx.strokeStyle = lighting.stroke_style;
            
            ctx.fill();
            ctx.stroke();
        }
    }
}

function isWithinRhombus (checkpoint, flatpt, id) 
{
    // Woah watch out! ... this is some real monkeybrain shit here...

    checkpoint.z = 0;

    // It's a triangle!
    if (
        id % (sphere_density * 2) == 0 ||
        id % (sphere_density * 2) == (sphere_density * 2) -1
    ) {
        if(id % (sphere_density * 2) == (sphere_density * 2) -1) {
            flatpt[2] = flatpt[3];
        }

        let vec = [];
        vec[0] = new Vector(flatpt[1], flatpt[0]);
        vec[1] = new Vector(flatpt[2], flatpt[0]);
    
        vec[2] = new Vector(flatpt[2], flatpt[1]);
        vec[3] = new Vector(flatpt[0], flatpt[1]);

        vec[4] = new Vector(flatpt[0], flatpt[2]);
        vec[5] = new Vector(flatpt[1], flatpt[2]);

        // Angles of each vertex
        let angles = [];
        angles[0] = Vector.prototype.angle(vec[0], vec[1]);
        angles[1] = Vector.prototype.angle(vec[2], vec[3]);
        angles[2] = Vector.prototype.angle(vec[4], vec[5]);

        // Vector from vertex to checkpoint
        let v0 = [];
        v0[0] = new Vector(checkpoint, flatpt[0]);
        v0[1] = new Vector(checkpoint, flatpt[1]);
        v0[2] = new Vector(checkpoint, flatpt[2]);

        // Angle between left edge and checkpoint
        let angle0 = [];
        angle0[0] = Vector.prototype.angle(vec[0], v0[0]);
        angle0[1] = Vector.prototype.angle(vec[2], v0[1]);
        angle0[2] = Vector.prototype.angle(vec[4], v0[2]);

        if (
            angle0[0] <= angles[0] && 
            angle0[1] <= angles[1] && 
            angle0[2] <= angles[2]
        ) {
            return true;
        }

        return false;
    }

    // Edges for each vertex, right to left
    let vec = [], dist = [];
    vec[0] = new Vector(flatpt[1], flatpt[0]);
    vec[1] = new Vector(flatpt[3], flatpt[0]);
    
    vec[2] = new Vector(flatpt[2], flatpt[1]);
    vec[3] = new Vector(flatpt[0], flatpt[1]);

    vec[4] = new Vector(flatpt[3], flatpt[2]);
    vec[5] = new Vector(flatpt[1], flatpt[2]);

    vec[6] = new Vector(flatpt[0], flatpt[3]);
    vec[7] = new Vector(flatpt[2], flatpt[3]);

    // Angles of each vertex
    let angles = [];
    angles[0] = Vector.prototype.angle(vec[0], vec[1]);
    angles[1] = Vector.prototype.angle(vec[2], vec[3]);
    angles[2] = Vector.prototype.angle(vec[4], vec[5]);
    angles[3] = Vector.prototype.angle(vec[6], vec[7]);

    // Vector from vertex to checkpoint
    let v0 = [];
    v0[0] = new Vector(checkpoint, flatpt[0]);
    v0[1] = new Vector(checkpoint, flatpt[1]);
    v0[2] = new Vector(checkpoint, flatpt[2]);
    v0[3] = new Vector(checkpoint, flatpt[3]);

    // Angle between left edge and checkpoint
    let angle0 = [];
    angle0[0] = Vector.prototype.angle(vec[0], v0[0]);
    angle0[1] = Vector.prototype.angle(vec[2], v0[1]);
    angle0[2] = Vector.prototype.angle(vec[4], v0[2]);
    angle0[3] = Vector.prototype.angle(vec[6], v0[3]);

    if (
        angle0[0] <= angles[0] && 
        angle0[1] <= angles[1] && 
        angle0[2] <= angles[2] && 
        angle0[3] <= angles[3]
    ) {
        return true;
    }

    return false;
}

function is_visible(eye, center, polygon) {
    var v = {
        a: new Vector(center,polygon[0]),
        b: new Vector(center,polygon[3]),
        c: new Vector(center,polygon[1]),
        d: new Vector(center,polygon[2])
    };
    
    v.north = Vector.prototype.add(v.a, v.b);
    v.south = Vector.prototype.add(v.c, v.d);
    v.normal = Vector.prototype.add(v.north, v.south);

    v.to_poly = new Vector(eye, v.normal);
    v.to_entity = new Vector(eye, center);
    var opposite = new Vector(center, v.normal);
    
    return {
        a: Vector.prototype.dot(v.to_entity, eye),
        b: Vector.prototype.dot(opposite, v.normal),
        c: Vector.prototype.dot(v.to_poly, eye)
    };
}

function light_poly(center, polygon, color) 
{
    var intensity = 1;
    var fill = color;
    var stroke = colors.black;
    return {
        intensity: intensity,
        fill: fill,
        stroke: stroke,
        fill_style: 'rgba('+fill+','+intensity+')',
        stroke_style: 'rgba('+stroke+', .1)'
    }
}

function light_poly_old(center, polygon, color) {
    var light_vis = is_visible(light.center, center, polygon);
    
    var a = Math.abs(light_vis.a);
    var b = Math.abs(light_vis.b);
    var c = Math.abs(light_vis.c);
    
    var max_c = Math.sqrt(Math.pow(a,2) - Math.pow(b,2));

    var intensity;
    //var fill = sphere.color;
    var fill = color;
    var stroke;
    if(c <= max_c) {
        var theta = Math.atan(c / b);
        var min_theta = Math.atan(max_c / b);
        
        intensity = light.intensity - (theta / (min_theta + .05)).toFixed(1) + .1;
        stroke = colors.white;
        
    } else {
        intensity = 1;
        stroke = fill;
    }

    return {
        intensity: intensity,
        fill: fill,
        stroke: stroke,
        fill_style: 'rgba('+fill+','+intensity+')',
        stroke_style: 'rgba('+stroke+', .1)'
    }
}

function setCursor3D(checkpoint, flatpt, id) {
    var lat = id % (sphere_density * 2);
    var long = Math.floor(id / (sphere_density * 2));

    checkpoint.z = 0;
    var vec = [];
    vec[0] = new Vector(checkpoint, flatpt[0]);
    vec[1] = new Vector(checkpoint, flatpt[1]);
    vec[2] = new Vector(checkpoint, flatpt[2]);
    vec[3] = new Vector(checkpoint, flatpt[3]);

    var lengths = [];
    lengths[0] = Math.sqrt(Vector.prototype.dot(vec[0], vec[0]));
    lengths[1] = Math.sqrt(Vector.prototype.dot(vec[1], vec[1]));
    lengths[2] = Math.sqrt(Vector.prototype.dot(vec[2], vec[2]));
    lengths[3] = Math.sqrt(Vector.prototype.dot(vec[3], vec[3]));

    var min = Math.min(...lengths);
    var index = lengths.indexOf(min);
    var pitch, yaw;

    //switch(index) {
    switch(-1) {
        case 3:
            pitch = (lat + 0.3) * (Math.PI / (sphere_density * 2));
            yaw = (long + 0.6) * (Math.PI / (sphere_density * 2));
            break;
        case 0:
            pitch = (lat + 0.3) * (Math.PI / (sphere_density * 2));
            yaw = (long + 0.3) * (Math.PI / (sphere_density * 2));
            break;
        case 1:
            pitch = (lat + 0.6) * (Math.PI / (sphere_density * 2));
            yaw = (long + 0.3) * (Math.PI / (sphere_density * 2));
            break;
        case 2:
            pitch = (lat + 0.6) * (Math.PI / (sphere_density * 2));
            yaw = (long + 0.6) * (Math.PI / (sphere_density * 2));
            break;
        default:
            pitch = (lat + 0.5) * (Math.PI / (sphere_density * 2));
            yaw = (long + 0.5) * (Math.PI / (sphere_density * 2));
            break;
    }

    cursor3d.pitch = pitch;
    cursor3d.yaw = yaw;

    var now = (new Date()).getTime();
    var deltaTime = now - startTime;
    var entry = {
        position: {
            lat: lat,
            long: long,
            c2: checkpoint,
            c3: {'pitch': pitch, 'yaw': yaw},
        },
        time: deltaTime,
        id: id,
        is_clicked: false
    }

    if(move_log.length == 0) move_log.push(entry);
    else if(move_log[move_log.length-1].id != id)
        move_log.push(entry);

}

function draw_map(goto) 
{
    // Plate Carree projection
    var x, y, r = sphere.radius;
    var lambda, lambda0, phi;

    var distx = (viewport.w) / (r * 2 * Math.PI);
    var disty = (viewport.h) / (r * Math.PI);

    var i = 0;
    var color;

    var curr, last;
    var limit = sphere_density * Math.exp(sphere_density/3);
    var selected_id = sphere.selected_id;
    var hover_id = sphere.hover_id;

    if(move_log.length >= 2) 
    {
        ctx2.beginPath();
        ctx2.strokeStyle = 'rgba(' + colors.black + ', 1)';

        var x0, y0, x1, y1;
        if(goto == null) {
            curr = move_log[move_log.length-1];
            last = move_log[move_log.length-2];
        } else {
            curr = move_log[goto];
            last = (goto < 2)? curr:move_log[goto-1];
            hover_id = curr.id;
            if(curr.is_clicked) { 
                selected_id = curr.id;
                console.log('something selected at ',curr.id);
            } else selected_id = -1;
        }

        x1 = r * distx * curr.position.c3.yaw;
        y1 = r * disty * curr.position.c3.pitch;
        x0 = r * distx * last.position.c3.yaw;
        y0 = r * disty * last.position.c3.pitch;

        if(Math.abs(curr.id - last.id) <= limit) {
            ctx2.lineTo(x0,y0);
            ctx2.lineTo(x1,y1);
        }

        ctx2.closePath();
    }

    for (var long = 0; long < sphere_density * 4; long++) {
        for (var lat = 0; lat < sphere_density * 2; lat++) {
            lambda = MathExt.prototype.to_radians((360 / (sphere_density * 4)) * long);
            lambda0 = MathExt.prototype.to_radians((360 / (sphere_density * 4)) * 0);
            phi = MathExt.prototype.to_radians((180 / (sphere_density * 2)) * lat);
            
            x = r * (lambda - lambda0);
            y = r * phi;

            if (selected_id == i) {
                color = 'rgba(' + colors.cyan + ', 1)';

            } else if (hover_id == i) {
                color = 'rgba(' + colors.red + ', 0.1)';

                if(move_log.length >= 2 && Math.abs(i - last.id) > limit) {
                    color = 'rgba(' + colors.blue + ', 1)';
                }

            } else {
                //color = 'rgba(' + sphere.polygon[i].color + ', 1)';
                color = 'rgba(' + colors.white + ', .03)';
            }

            ctx2.fillStyle = color;
            ctx2.fillRect(
                x * distx,
                y * disty,
                viewport.w / (sphere_density * 4),
                viewport.h / (sphere_density * 2)
            );
            i++;
        }
    }

    /*ctx2.fillStyle = 'rgba(' + colors.black + ', 1)';
    ctx2.fillRect(
        r * (cursor3d.yaw) * distx,
        r * (cursor3d.pitch) * disty,
        3,3
    );*/

    ctx2.stroke();
}

window.onload = function() {
    main();
    Sound.prototype.main();
}