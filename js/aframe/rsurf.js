AFRAME.registerComponent('rsurf', {
    schema: {
        controlPoints: {
            type: 'array',
            default: [0, 0, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 4, 0, 0, 1]
        },
        U: {
            type: 'array',
            default: [0, 0, 0, 0, 0.25, 0.5, 0.75, 1, 1, 1, 1]
        },
        V: {
            type: 'array',
            default: [0, 0, 0, 0.2, 0.4, 0.6, 0.6, 0.8, 1, 1, 1]
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

    make_legend: function (U) {
        var res = [], val = 0, ccount = 0;

        for (var i = 0; i < U.length; i++) {
            if (U[i] == val) ccount++;
            else {
                res.push({
                    u: val,
                    count: ccount
                });
                val = U[i];
                ccount = 1;
            }
        }
        res.push({
            u: val,
            count: ccount
        });
        return res;
    },

    DrawPath: function (span, p, U, k, su, eu) {
        var res = [], u, x, step = 100;
        for (var i = su * step; i <= eu * step; i++) {
            u = i / step;
            x = NURBSUtils.calcBasisFunctions(span, u, p, U);
            res.push(new THREE.Vector2(u, x[k]));
        }
        return res;
    },

    calcRFunctions: function (uspan, vspan, p, q, U, V, P, u, v, x, y, k1, k2) {
        var Nu = NURBSUtils.calcBasisFunctions(uspan, u, p, U);
        var Nv = NURBSUtils.calcBasisFunctions(vspan, v, q, V);
        var temp = [], point, w;

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

    DrawSurf: function (uspan, vspan, p, q, U, V, P, x, y, k1, k2, su1, eu1, su2, eu2) {
        var res = [], u, ustep = 50, v, vstep = 50, k = 0, val;
        for (var i = su1 * ustep; i <= eu1 * ustep; i++) {
            u = i / ustep;
            res.push([]);
            for (var j = su2 * vstep; j <= eu2 * vstep; j++) {
                v = j / vstep;
                val = this.calcRFunctions(uspan, vspan, p, q, U, V, P, u, v, x, y, k1, k2)
                if (isNaN(val)) { res[k].push(0); } else { res[k].push(val); }
            }
            k++;
        }
        return res;
    },

    DrawSurf2: function (p, q, U, V, P, x, y) {
        var res = [], u, nu, ustep = 50, v, nv, vstep = 50, k = 0, val, pnu = P.length, pnv = P[0].length;

        for (var i = p; i < pnu; i++) {
            for (var nu = this.data.U[i] * ustep + 1; nu <= this.data.U[i + 1] * ustep; nu++) {
                u = nu / ustep;
                res.push([]);
                for (var j = q; j < pnv; j++) {
                    for (var nv = this.data.V[j] * vstep + 1; nv <= this.data.V[j + 1] * vstep; nv++) {
                        v = nv / vstep;
                        if ((i >= x - 1) & (j >= y - 1)) {
                            val = this.calcRFunctions(i, j, p, q, U, V, P, u, v, x, y, p - (i - x), q - (j - y));
                            if (isNaN(val)) { res[k].push(0); } else { res[k].push(val); }
                        }
                        else {
                            res[k].push(0);
                        }
                    }
                }
                k++;
            }
        }
        return res;
    },

    DrawAllSurf: function (hscale1, hscale2, p, q, U, V, P, x, y, group) {
        var rp = this.DrawSurf2(p, q, U, V, P, x, y);
        var ustep = rp.length, vstep = rp[0].length, uvertices, vvertices;

        for (var x = 0; x < vstep; x++) {

            vvertices = new Float32Array(ustep * 3);

            for (var y = 0; y < ustep; y++) {
                vvertices[y * 3 + 2] = 2 - hscale1 * x / ustep;
                vvertices[y * 3 + 1] = rp[y][x];
                vvertices[y * 3] = hscale2 * y / vstep;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vvertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);

        }

        for (var y = 0; y < ustep; y++) {

            uvertices = new Float32Array(vstep * 3);

            for (var x = 0; x < vstep; x++) {
                uvertices[x * 3 + 2] = 2 - hscale1 * x / ustep;
                uvertices[x * 3 + 1] = rp[y][x];
                uvertices[x * 3] = hscale2 * y / vstep;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(uvertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);

        }
    },

    DrawArr: function (group) {
        var arr_vertices = new Float32Array([
            0, 0, 0, 2.15, 0, 0,
            2.15, -0.03, 0, 2.3, 0, 0,
            2.15, .03, 0, 2.3, 0, 0,
            2.15, -.03, 0, 2.15, .03, 0
        ]);

        var varr_vertices = new Float32Array([
            0, 0, 0, 0, 1.15, 0,
            0, 1.15, -0.03, 0, 1.3, 0,
            0, 1.15, .03, 0, 1.3, 0,
            0, 1.15, -.03, 0, 1.15, .03
        ]);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(varr_vertices, 3));
        varr_mesh = new THREE.Line(geometry, material);
        group.add(varr_mesh);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(arr_vertices, 3));
        arr_mesh = new THREE.Line(geometry, material);
        group.add(arr_mesh);

    },

    DrawLeg: function (group, Uleg, hscale1) {
        var lstep, sstep;

        if (Uleg[Uleg.length - 1] > 1) hscale1 = hscale1 / (Uleg[Uleg.length - 1].u);

        for (var i = 0; i < Uleg.length; i++) {

            if (Uleg[i].count > 1) {
                lstep = Uleg[i].count * 0.015;
                sstep = lstep * Uleg[i].count / 2 + lstep / 2;
            } else {
                lstep = 0;
                sstep = 0;
            }

            for (var j = 0; j < Uleg[i].count; j++) {
                vertices = new Float32Array(6);

                vertices[2] = -0.05;
                vertices[1] = 0;
                vertices[0] = Uleg[i].u * hscale1 - lstep * (Uleg[i].count - j) + sstep;
                vertices[5] = 0.05;
                vertices[4] = 0;
                vertices[3] = Uleg[i].u * hscale1 - lstep * (Uleg[i].count - j) + sstep;

                geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
                mesh = new THREE.Line(geometry, material);
                group.add(mesh);
            }
        }

    },

    init: function () {
        var vertices, geometry, mesh, group = new THREE.Group();
        var P = [], k = 0;

        this.rendererSystem = this.el.sceneEl.systems.renderer;

        material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        this.rendererSystem.applyColorCorrection(material.color);

        for (var x = 0; x < this.data.nx; x++) {
            P.push([]);
            for (var y = 0; y < this.data.ny; y++) {
                P[x].push(new THREE.Vector4(this.data.controlPoints[k], this.data.controlPoints[k + 1], this.data.controlPoints[k + 2], this.data.controlPoints[k + 3]));
                k += 4;
            }
        }

        var sgroup = new THREE.Group();
        this.DrawArr(sgroup);
        var ngroup = sgroup.clone();
        var hscale1 = 2,
            hscale2 = 2;
        this.DrawLeg(sgroup, this.make_legend(this.data.U), hscale1);
        sgroup.position.set(0, 0, -0.2);
        this.DrawLeg(ngroup, this.make_legend(this.data.V), hscale2);
        ngroup.rotation.y = 1.570796327;
        ngroup.position.set(-0.2, 0, 2);
        group.add(sgroup);
        group.add(ngroup);

        var p = 3, q = 2;

        var sp = new THREE.Vector3(-0.2, 0, 2);
        for (var j = 0; j < 3; j++) {

            var larr = this.DrawPath(2 + j, q, this.data.V, 2 - j, this.data.V[2 + j], this.data.V[3 + j])
            vertices = new Float32Array(larr.length * 3);
            k = 0;
            for (var i = 0; i < larr.length; i++) {
                vertices[k * 3] = sp.x;
                vertices[k * 3 + 1] = sp.y + larr[i].y;
                vertices[k * 3 + 2] = sp.z - larr[i].x * hscale2;
                k++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);
        }

        sp = new THREE.Vector3(0, 0, -0.2);
        for (var j = 0; j < 3; j++) {

            var larr = this.DrawPath(4 + j, p, this.data.U, 3 - j, this.data.U[4 + j], this.data.U[5 + j])
            vertices = new Float32Array(larr.length * 3);
            k = 0;
            for (var i = 0; i < larr.length; i++) {
                vertices[k * 3] = sp.x + larr[i].x * hscale1;
                vertices[k * 3 + 1] = sp.y + larr[i].y;
                vertices[k * 3 + 2] = sp.z;
                k++;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);
        }

        this.DrawAllSurf(hscale1, hscale2, p, q, this.data.U, this.data.V, P, 4, 2, group)

        this.el.setObject3D(this.attrName, group);

    }

});