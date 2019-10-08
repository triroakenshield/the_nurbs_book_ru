AFRAME.registerComponent('surfnet', {
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

    subfunc: function (xend, yend, inv, P, material, gr) {
        var i, x1, y1;
        for (var y = 0; y < yend; y++) {
            var vertices = new Float32Array(xend * 3);
            i = 0;

            for (var x = 0; x < xend; x++) {
                if (inv) {
                    x1 = y; y1 = x;
                }
                else { x1 = x; y1 = y; }

                vertices[i * 3] = P[x1][y1].x;
                vertices[i * 3 + 1] = P[x1][y1].y;
                vertices[i * 3 + 2] = P[x1][y1].z;
                i++;
            }

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            var mesh = new THREE.Line(geometry, material);
            mesh.computeLineDistances();
            gr.add(mesh);
        }
    },

    deCasteljianDr: function (u, Pz, material, gr) {
        var Pz2 = [];
        for (var i = 0; i < Pz.length - 1; i++) {
            var p1 = new THREE.Vector3(0, 0, 0)

            p1.x = Pz[i].x + (Pz[i + 1].x - Pz[i].x) * u;
            p1.y = Pz[i].y + (Pz[i + 1].y - Pz[i].y) * u;
            p1.z = Pz[i].z + (Pz[i + 1].z - Pz[i].z) * u;
            Pz2.push(p1);
        }

        if (Pz2.length > 1) {
            var vertices = new Float32Array(Pz2.length * 3);

            for (var i = 0; i < Pz2.length; i++) {
                vertices[i * 3] = Pz2[i].x;
                vertices[i * 3 + 1] = Pz2[i].y;
                vertices[i * 3 + 2] = Pz2[i].z;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            gr.add(mesh);
        }

        return Pz2;
    },

    init: function () {
        var mesh, geometry, vertices, group = new THREE.Group();
        var dlmaterial = new THREE.LineDashedMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true,
            dashSize: 0.05,
            gapSize: 0.05
        });

        var psMaterial = new THREE.PointsMaterial({ color: 0x000000, size: 0.03 });
        var psGeometry = new THREE.Geometry();
        var P = [], k = 0;

        this.rendererSystem = this.el.sceneEl.systems.renderer;

        for (var x = 0; x < this.data.nx; x++) {
            P.push([]);
            for (var y = 0; y < this.data.ny; y++) {
                P[x].push(new THREE.Vector4(
                    parseFloat(this.data.controlPoints[k]),
                    parseFloat(this.data.controlPoints[k + 1]),
                    parseFloat(this.data.controlPoints[k + 2]),
                    parseFloat(this.data.controlPoints[k + 3])));
                k += 4;
            }
        }

        for (var x = 0; x < this.data.nx; x++) {
            for (var y = 0; y < this.data.ny; y++) {
                psGeometry.vertices.push(new THREE.Vector3(P[x][y].x, P[x][y].y, P[x][y].z));
            }
        }


        this.subfunc(this.data.ny, this.data.nx, true, P, dlmaterial, group);
        this.subfunc(this.data.nx, this.data.ny, false, P, dlmaterial, group);

        //

        var material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        var u = 0.7, p1 = new THREE.Vector3(0, 0, 0), p2 = new THREE.Vector3(0, 0, 0), p3, Pz = [], Pz2;

        for (var k = 0; k < P.length; k++) {
            p1.x = P[k][0].x + (P[k][1].x - P[k][0].x) * u;
            p1.y = P[k][0].y + (P[k][1].y - P[k][0].y) * u;
            p1.z = P[k][0].z + (P[k][1].z - P[k][0].z) * u;

            p2.x = P[k][1].x + (P[k][2].x - P[k][1].x) * u;
            p2.y = P[k][1].y + (P[k][2].y - P[k][1].y) * u;
            p2.z = P[k][1].z + (P[k][2].z - P[k][1].z) * u;

            vertices = new Float32Array(6);

            vertices[0] = p1.x;
            vertices[1] = p1.y;
            vertices[2] = p1.z;
            vertices[3] = p2.x;
            vertices[4] = p2.y;
            vertices[5] = p2.z;

            p3 = new THREE.Vector3(0, 0, 0)

            p3.x = p1.x + (p2.x - p1.x) * u;
            p3.y = p1.y + (p2.y - p1.y) * u;
            p3.z = p1.z + (p2.z - p1.z) * u;

            Pz.push(p3);

            psGeometry.vertices.push(p3);

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);
        }

        vertices = new Float32Array(Pz.length * 3);

        for (var i = 0; i < Pz.length; i++) {
            vertices[i * 3] = Pz[i].x;
            vertices[i * 3 + 1] = Pz[i].y;
            vertices[i * 3 + 2] = Pz[i].z;
        }

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        mesh = new THREE.Line(geometry, material);
        group.add(mesh);

        Pz2 = this.deCasteljianDr(u, Pz, material, group);
        Pz = this.deCasteljianDr(u, Pz2, material, group);
        Pz2 = this.deCasteljianDr(u, Pz, material, group);
        psGeometry.vertices.push(Pz2[0]);

        var starField = new THREE.Points(psGeometry, psMaterial);
        group.add(starField);

        this.el.setObject3D(this.attrName, group);

    }

});