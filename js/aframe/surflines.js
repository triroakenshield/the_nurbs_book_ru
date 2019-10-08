AFRAME.registerComponent('surflines', {
    schema: {
        controlPoints: {
            type: 'array',
            default: [0, 0, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 4, 0, 0, 1]
        },
        U: {
            type: 'array',
            default: [0, 0, 0, 0, 1, 1, 1, 1]
        },
        V: {
            type: 'array',
            default: [0, 0, 0, 0, 1, 1, 1, 1]
        },
        p: {
            type: 'int',
            default: 3
        },
        q: {
            type: 'int',
            default: 3
        },
        nx: {
            type: 'int',
            default: 3
        },
        ny: {
            type: 'int',
            default: 3
        }
    },

    init: function () {
        var vertices, geometry, group = new THREE.Group();
        var P = [], k = 0;

        this.rendererSystem = this.el.sceneEl.systems.renderer;    

        for (var x = 0; x < this.data.nx; x++) {
            P.push([]);
            for (var y = 0; y < this.data.ny; y++) {
                P[x].push(new THREE.Vector4(
                    this.data.controlPoints[k], 
                    this.data.controlPoints[k + 1], 
                    this.data.controlPoints[k + 2], 
                    this.data.controlPoints[k + 3]));
                k += 4;
            }
        }

        material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        var ustep = 10, vstep = 100, u, v;
        var p = this.data.p, q = this.data.q;
        var U = this.data.U, V = this.data.V;
        var target = new THREE.Vector3(0, 0, 0);

        for (var i = 0; i <= ustep; i++) {
            u = i / ustep;
            vertices = new Float32Array((vstep + 1) * 3);
            k = 0;
            for (var j = 0; j <= vstep; j++) {
                v = j / vstep;
                NURBSUtils.calcSurfacePoint(p, q, U, V, P, u, v, target);
                vertices[k * 3] = target.x;
                vertices[k * 3 + 1] = target.y;
                vertices[k * 3 + 2] = target.z;
                k++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);

        }

        for (var i = 0; i <= ustep; i++) {
            v = i / ustep;
            vertices = new Float32Array((vstep + 1) * 3);
            k = 0;
            for (var j = 0; j <= vstep; j++) {
                u = j / vstep;
                NURBSUtils.calcSurfacePoint(p, q, U, V, P, u, v, target);
                vertices[k * 3] = target.x;
                vertices[k * 3 + 1] = target.y;
                vertices[k * 3 + 2] = target.z;
                k++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);

        }

        //NURBSUtils.calcSurfacePoint(p, q, U, V, P, 0.75, 0.4, target);
        //var test = NURBSUtils.SurfaceDerivsAlg1(p, U, q, V, P, 0.75, 0.4, 2);

        this.el.setObject3D(this.attrName, group);

    }

});