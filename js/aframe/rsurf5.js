AFRAME.registerComponent("rsurf", {
    schema: {
        controlPoints: {
            type: "array",
            default: [0, 0, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 4, 0, 0, 1]
        },
        U: {
            type: "array",
            default: [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1]
        },
        V: {
            type: "array",
            default: [0, 0, 0, 0.2, 0.4, 0.6, 0.6, 0.8, 1, 1, 1]
        },
        p: {
            type: "int",
            default: 3
        },
        q: {
            type: "int",
            default: 3
        },
        nx: {
            type: "int",
            default: 3
        },
        ny: {
            type: "int",
            default: 3
        }
    },

    DrawPath: function (span, p, U, k, su, eu) {
        var u, x, res = [], step = 100;
        for (var i = su * step; i <= eu * step; i++) {
            u = i / step;
            x = NURBSUtils.calcBasisFunctions(span, u, p, U);
            res.push(new THREE.Vector2(u, x[k]));
        }
        return res;
    },

    calcRFunctions3: function (p, q, U, V, P, u, v, x, y, k1, k2) {
        var uspan = NURBSUtils.findSpan(p, u, U);
        var vspan = NURBSUtils.findSpan(q, v, V);
        var Nu = NURBSUtils.calcBasisFunctions(uspan, u, p, U);
        var Nv = NURBSUtils.calcBasisFunctions(vspan, v, q, V);
        var w, point, temp = [];

        for (var l = 0; l <= q; ++l) {
            temp.push(0);
            for (var k = 0; k <= p; ++k) {
                point = P[uspan - p + k][vspan - q + l].clone();
                w = point.w;
                temp[l] += Nu[k] * w;
            }
        }

        var Sw = 0;
        for (var l = 0; l <= q; ++l) {
            Sw += temp[l] * Nv[l];
        }

        point = P[x][y].clone();
        w = point.w;

        return (Nu[k1] * Nv[k2] * w) / Sw; 
    },

    DrawSurf: function (p, q, U, V, P, x, y, ) {
        var u, v, val, res = [], ustep = 50, vstep = 50, k = 0;
        for (var i = 0; i <= ustep; i++) {
            u = i / ustep;
            res.push([]);
            for (var j = 0; j <= vstep; j++) {
                v = j / vstep;
                val = this.calcRFunctions3(p, q, U, V, P, u, v, x, y, 1, 0);
                if (isNaN(val)) {
                    res[k].push(0);
                } else { res[k].push(val); }
            }
            k++;
        }
        return res;
    },

    DrawAllSurf: function (hscale1, hscale2, p, q, U, V, P, x, y, group, material) {
        var rp = this.DrawSurf(p, q, U, V, P, x, y);
        var ustep = rp.length, vstep = rp[0].length, vertices;
        for (var x = 0; x < vstep; x++) {
            vertices = new Float32Array(ustep * 3);

            for (var y = 0; y < ustep; y++) {
                vertices[y * 3 + 2] = 2 - (hscale1 * y) / ustep;
                vertices[y * 3 + 1] = rp[y][x];
                vertices[y * 3] = (hscale2 * x) / vstep;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);
        }

        for (var y = 0; y < ustep; y++) {
            vertices = new Float32Array(vstep * 3);

            for (var x = 0; x < vstep; x++) {
                vertices[x * 3 + 2] = 2 - (hscale1 * y) / ustep;
                vertices[x * 3 + 1] = rp[y][x];
                vertices[x * 3] = (hscale2 * x) / vstep;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);
        }
    },

    DrawArr: function (group, material) {
        var arr_vertices = new Float32Array([
            0, 0, 0,
            2.15, 0, 0,
            2.15, -0.03, 0,
            2.3, 0, 0,
            2.15, 0.03, 0,
            2.3, 0, 0,
            2.15, -0.03, 0,
            2.15, 0.03, 0
        ]);

        var varr_vertices = new Float32Array([
            0, 0, 0,
            0, 1.15, 0,
            0, 1.15, -0.03,
            0, 1.3, 0,
            0, 1.15, 0.03,
            0, 1.3, 0,
            0, 1.15, -0.03,
            0, 1.15, 0.03
        ]);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(varr_vertices, 3));
        varr_mesh = new THREE.LineSegments(geometry, material);
        group.add(varr_mesh);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(arr_vertices, 3));
        arr_mesh = new THREE.LineSegments(geometry, material);
        group.add(arr_mesh);
    },

    init: function () {
        var geometry, mesh, vertices, group = new THREE.Group();

        this.rendererSystem = this.el.sceneEl.systems.renderer;

        var material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        this.rendererSystem.applyColorCorrection(material.color);

        var P = [], k = 0, p = this.data.p, q = this.data.q;

        for (var x = 0; x < this.data.nx; x++) {
            P.push([]);
            for (var y = 0; y < this.data.ny; y++) {
                P[x].push(
                    new THREE.Vector4(
                        this.data.controlPoints[k],
                        this.data.controlPoints[k + 1],
                        this.data.controlPoints[k + 2],
                        this.data.controlPoints[k + 3]
                    )
                );
                k += 4;
            }
        }

        var sgroup = new THREE.Group();
        this.DrawArr(sgroup, material);
        var ngroup = sgroup.clone();
        var hscale1 = 2, hscale2 = 2;
        sgroup.position.set(0, 0, -0.2);
        ngroup.rotation.y = 1.570796327;
        ngroup.position.set(-0.2, 0, 2);
        group.add(sgroup);
        group.add(ngroup);

        var sp = new THREE.Vector3(-0.2, 0, 0);
        var larr = this.DrawPath(3, p, this.data.U, 2, this.data.U[3], this.data.U[4]);
        vertices = new Float32Array(larr.length * 3);
        k = 0;
        for (var i = 0; i < larr.length; i++) {
            vertices[k * 3] = sp.x;
            vertices[k * 3 + 1] = sp.y + larr[i].y;
            vertices[k * 3 + 2] = sp.z + larr[i].x * hscale2;
            k++;
        }

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
        mesh = new THREE.Line(geometry, material);
        group.add(mesh);

        sp = new THREE.Vector3(2, 0, -0.2);
        larr = this.DrawPath(2, q, this.data.V, 2, this.data.V[2], this.data.V[3]);
        vertices = new Float32Array(larr.length * 3);
        k = 0;
        for (var i = 0; i < larr.length; i++) {
            vertices[k * 3] = sp.x - larr[i].x * hscale1;
            vertices[k * 3 + 1] = sp.y + larr[i].y;
            vertices[k * 3 + 2] = sp.z;
            k++;
        }

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
        mesh = new THREE.Line(geometry, material);
        group.add(mesh);

        this.DrawAllSurf(hscale1, hscale2, p, q, this.data.U, this.data.V, P, 1, 0, group, material);

        this.el.setObject3D(this.attrName, group);
    }
});
