var v;
var from,to;
var length;

export class Vector {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.length = Vector.prototype.dot(this.from, this.to);
        
        this.v = Vector.prototype.__create(this.from, this.to);
        return this.v;
    }

    angle(a, b) {
        const dotProduct = Vector.prototype.dot(a, b);
        const magnitudeA = Math.sqrt(Vector.prototype.dot(a, a));
        const magnitudeB = Math.sqrt(Vector.prototype.dot(b, b));
        
        const cosTheta = dotProduct / (magnitudeA * magnitudeB);
        const theta = Math.acos(cosTheta);
        
        return theta;
    }
    
    hamilton(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return {
            w: (a.w * b.w) - (a.x * b.x) - (a.y * b.y) - (a.z * b.z),
            x: (a.w * b.x) + (a.x * b.w) + (a.y * b.z) - (a.z * b.y),
            y: (a.w * b.y) - (a.x * b.z) + (a.y * b.w) + (a.z * b.x),
            z: (a.w * b.z) + (a.x * b.y) - (a.y * b.x) + (a.z * b.w)
        };
    }

    cross(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return {
            x: (a.y * b.z) - (a.z * b.y),
            y: (a.z * b.x) - (a.x * b.z),
            z: (a.x * b.y) - (a.y * b.x)
        };
    }
    
    dot(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }

    add(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }

    // subtract b from a. (a - b)
    subtract(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        };
    }

    // scale a by b. (b * a->)
    scale(a, b) {
        a = (b==null)? v:a;
        b = (b==null)? a:b;
        
        return {
            x: a.x * b,
            y: a.y * b,
            z: a.z * b
        }
    }
    
    /*
        Recieves a (optional: vector,) origin, angle, axis_of_rotation.
        Returns rotated vector.
    */
    rotate(args) {
        var vector = (args.vector==null)? this.v:args.vector;
        var origin = args.origin;
        var angle = args.angle /2;
        var axis = args.axis;

        var p = {
            w: 0,
            x: vector.x - origin.x,
            y: vector.y - origin.y,
            z: vector.z - origin.z
        };

        var r = {
            w: Math.cos(angle),
            x: Math.sin(angle)*axis.i,
            y: Math.sin(angle)*axis.j,
            z: Math.sin(angle)*axis.k
        };

        var r1 = {
            w: r.w,
            x: -r.x,
            y: -r.y,
            z: -r.z
        };

        var p1 = this.hamilton(this.hamilton(r, p), r1);

        return {
            x: p1.x + origin.x,
            y: p1.y + origin.y,
            z: p1.z + origin.z
        };
    }
    
    /*
        Recieves {}, vector and origin. If no arguments provided
         will use initialized length.
        Returns length.
    */
    get_length(a) {
        return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
    }
    /*
    get_length(args) {
        if(args == null) return this.length;
        if(args.vector == null || args.origin == null) return false;
        
        return Vector.prototype.dot(args.vector, args.origin);
    }*/

    distance(b,a) {
        let dist = Math.sqrt((b.x-a.x)^2 + (b.y-a.y)^2 + (b.z-a.z)^2);
        return dist;
    }
}

Vector.prototype.__create = function(a, b) {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
        z: b.z - a.z
    };
}