AFRAME.registerComponent('surf', {
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
        var geometry;
        var dlmaterial = new THREE.LineDashedMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true,
            dashSize: 0.05,
            gapSize: 0.05
        });
        var group = new THREE.Group();

        this.rendererSystem = this.el.sceneEl.systems.renderer;

        var P = [];
        var k = 0;

        for (var x = 0; x < this.data.nx; x++) {
            P.push([]);
            for (var y = 0; y < this.data.ny; y++) {
                P[x].push(new THREE.Vector4(this.data.controlPoints[k], this.data.controlPoints[k + 1], this.data.controlPoints[k + 2], this.data.controlPoints[k + 3]));
                k += 4;
            }
        }

        var ndata = new Uint8Array(3);

        ndata[0] = 0;
        ndata[1] = 0;
        ndata[2] = 0;

        //vertices = new Float32Array(this.data.nx*this.data.ny * 3);

        var texture = new THREE.DataTexture(ndata, 1, 1, THREE.RGBFormat);
        texture.needsUpdate = true

        var smaterial = new THREE.SpriteMaterial({
            map: texture
        });

        var vertices;

        //var i = 0;

        for (var x = 0; x < this.data.nx; x++) {

            vertices = new Float32Array(this.data.ny * 3);
            var i = 0;

            for (var y = 0; y < this.data.ny; y++) {
                var sprite = new THREE.Sprite(smaterial);
                sprite.position.set(P[x][y].x, P[x][y].y, P[x][y].z);
                sprite.scale.set(0.02, 0.02, 0.02);
                group.add(sprite);
                //
                vertices[i * 3] = P[x][y].x;
                vertices[i * 3 + 1] = P[x][y].y;
                vertices[i * 3 + 2] = P[x][y].z;
                i++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, dlmaterial);
            mesh.computeLineDistances();
            group.add(mesh);

        }

        for (var y = 0; y < this.data.ny; y++) {
            vertices = new Float32Array(this.data.nx * 3);
            var i = 0;

            for (var x = 0; x < this.data.nx; x++) {

                vertices[i * 3] = P[x][y].x;
                vertices[i * 3 + 1] = P[x][y].y;
                vertices[i * 3 + 2] = P[x][y].z;
                i++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, dlmaterial);
            mesh.computeLineDistances();
            group.add(mesh);
        }

        material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        var ustep = 10, vstep = 100, u, v;
        var p = this.data.p, q = p = this.data.q;
        var U = this.data.U, V = this.data.V;
        var target = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i <= ustep; i++) {
            u = i / ustep;
            vertices = new Float32Array((vstep + 1) * 3);
            k = 0;
            for (var j = 0; j <= vstep; j++) {
                v = j / vstep;
                calcSurfacePoint(p, q, U, V, P, u, v, target);
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
                calcSurfacePoint(p, q, U, V, P, u, v, target);
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

        this.el.setObject3D(this.attrName, group);

    }

});