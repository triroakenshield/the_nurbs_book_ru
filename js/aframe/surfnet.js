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

    init: function () {
        var geometry, vertices, group = new THREE.Group();
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
                    this.data.controlPoints[k],
                    this.data.controlPoints[k + 1],
                    this.data.controlPoints[k + 2],
                    this.data.controlPoints[k + 3]));
                k += 4;
            }
        }

        for (var x = 0; x < this.data.nx; x++) {
            for (var y = 0; y < this.data.ny; y++) {
                psGeometry.vertices.push(new THREE.Vector3(P[x][y].x, P[x][y].y, P[x][y].z));
            }
        }
        var starField = new THREE.Points(psGeometry, psMaterial);
        group.add(starField);

        this.subfunc(this.data.ny, this.data.nx, true, P, dlmaterial, group);
        this.subfunc(this.data.nx, this.data.ny, false, P, dlmaterial, group);

        this.el.setObject3D(this.attrName, group);

    }

});