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
        },
        lu: {
            type: 'array',
            default: [0, 0.6, 1]
        },
        lv: {
            type: 'array',
            default: [0, 0.6, 1]
        },
        lum: {
            type: 'array',
            default: [0, 1, 0]
        },
        lvm: {
            type: 'array',
            default: [0, 0, 1]
        },
        drvuline: {
            type: 'array',
            default: [0.28, 0.28, 0.73, 1, 0.73, 0.28, 0.73, 1]
        },
        drvvline: {
            type: 'array',
            default: [0.28, 0.28, 0.73, 1, 0.73, 0.28, 0.73, 1]
        }
    },

    addLine: function (su, eu, P, npr, val, gr, material) {
        var p = this.data.p, q = this.data.q;
        var U = this.data.U, V = this.data.V;
        var target = new THREE.Vector3(0, 0, 0);
        var vstep = 100, u, v;
        if (npr) { u = val; }
        else { v = val; }
        vertices = new Float32Array(((eu - su) * vstep + 1) * 3);
        var k = 0;
        for (var j = su * vstep; j <= eu * vstep; j++) {
            if (npr) { v = j / vstep; }
            else { u = j / vstep; }
            NURBSUtils.calcSurfacePoint(p, q, U, V, P, u, v, target);
            vertices[k * 3] = target.x;
            vertices[k * 3 + 1] = target.y;
            vertices[k * 3 + 2] = target.z;
            k++;
        }
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var mesh = new THREE.Line(geometry, material);
        mesh.computeLineDistances();
        gr.add(mesh);
    },

    init: function () {
        var group = new THREE.Group();
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

        var mm, material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        var dmaterial = new THREE.LineDashedMaterial({
            color: "#000000",
            opacity: 1,
            dashSize: 0.05, gapSize: 0.05,
            transparent: false,
            visible: true
        });

        for (var i = 0; i < this.data.lu.length; i++) {
            if (this.data.lum[i] == "0") { mm = material } else { mm = dmaterial }
            this.addLine(0, 1, P, true, this.data.lu[i], group, mm)
        }

        for (var i = 0; i < this.data.lv.length; i++) {
            if (this.data.lvm[i] == "0") { mm = material } else { mm = dmaterial }
            this.addLine(0, 1, P, false, this.data.lv[i], group, mm)
        }

        for (var i = 0; i < this.data.drvuline.length / 4; i++) {
            var u = this.data.drvuline[i * 4],
                su = this.data.drvuline[i * 4 + 1],
                eu = this.data.drvuline[i * 4 + 2],
                mv = this.data.drvuline[i * 4 + 3];
            if (mv == "0") { mm = material } else { mm = dmaterial }
            this.addLine(su, eu, P, true, u, group, mm)
        }

        for (var i = 0; i < this.data.drvvline.length / 4; i++) {
            var u = this.data.drvvline[i * 4],
                su = this.data.drvvline[i * 4 + 1],
                eu = this.data.drvvline[i * 4 + 2],
                mv = this.data.drvvline[i * 4 + 3];
            if (mv == "0") { mm = material } else { mm = dmaterial }
            this.addLine(su, eu, P, false, u, group, mm)
        }

        /*         var p = this.data.p, q = this.data.q;
                var U = this.data.U, V = this.data.V;
                var target = new THREE.Vector3(0, 0, 0);
                NURBSUtils.calcSurfacePoint(p, q, U, V, P, 0.6, 0.6, target); */

        this.el.setObject3D(this.attrName, group);

    }

});