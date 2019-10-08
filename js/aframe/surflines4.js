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
        ders: {
            type: 'array',
            default: []
        },
        norm: {
            type: 'array',
            default: []
        }
    },

    addLine: function (P, npr, val, gr, material) {
        var p = this.data.p, q = this.data.q;
        var U = this.data.U, V = this.data.V;
        var target = new THREE.Vector3(0, 0, 0);
        var vstep = 100, u, v;
        if (npr) { u = val; }
        else { v = val; }
        vertices = new Float32Array((vstep + 1) * 3);
        var k = 0;
        for (var j = 0; j <= vstep; j++) {
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

    addArrow: function (sp, ep, material) {
        var len = ep.length();
        var vertices = new Float32Array([
            0, 0, 0, len - 0.1, 0, 0,
            len - 0.1, -0.015, 0, len, 0, 0,
            len - 0.1, .015, 0, len, 0, 0,
            len - 0.1, -.015, 0, len - 0.1, .015, 0
        ]);

        var geometry = this.geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var quaternion = new THREE.Quaternion();
        ep.normalize();
        quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(ep.x, ep.y, ep.z))
        //quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), 0);

        var mesh = new THREE.Line(geometry, material);
        mesh.applyQuaternion(quaternion);
        mesh.position.x = sp.x;
        mesh.position.y = sp.y;
        mesh.position.z = sp.z;

        return mesh;
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
            this.addLine(P, true, this.data.lu[i], group, mm)
        }

        for (var i = 0; i < this.data.lv.length; i++) {
            if (this.data.lvm[i] == "0") { mm = material } else { mm = dmaterial }
            this.addLine(P, false, this.data.lv[i], group, mm)
        }

        if (this.data.ders.length > 0) {
            var p = this.data.p, q = this.data.q;
            var U = this.data.U, V = this.data.V;
            var du = this.data.ders[0], dv = this.data.ders[1], dd = this.data.ders[2], scale = [];
            for (var idx = 0; idx < dd; idx++) {
                scale.push(this.data.ders[3 + idx]);
            }

            var test = NURBSUtils.calcRationalSurfaceDerivatives1(p, U, q, V, P, du, dv, dd);

            var rmaterial = new THREE.LineBasicMaterial({
                color: "#ff0000",
                opacity: 1,
                transparent: false,
                visible: true
            });

            var target2, vs, geometry, varr_mesh, us = "", vs = "", res = [], sindx; //, scale = [0.5, 0.333]
            for (var i = 0; i < test.length; i++) { //test.length
                //vs = "";
                for (var j = 0; j < test[i].length; j++) {
                    if (i == 0 & j == 0) continue;
                    /*                     vvs = new Float32Array(6);
                                        vvs[0] = test[0][0].x;
                                        vvs[1] = test[0][0].y;
                                        vvs[2] = test[0][0].z;
                                        if (i == 2 || j == 2) { target2 = test[i][j].clone().multiplyScalar(scale[1]).add(test[0][0].clone()); }
                                        else { target2 = test[i][j].clone().multiplyScalar(scale[0]).add(test[0][0].clone()); }
                                        vvs[3] = target2.x;
                                        vvs[4] = target2.y;
                                        vvs[5] = target2.z;
                                        geometry = new THREE.BufferGeometry();
                                        geometry.addAttribute("position", new THREE.BufferAttribute(vvs, 3));
                                        varr_mesh = new THREE.LineSegments(geometry, rmaterial);
                                        group.add(varr_mesh); */
                    //res.push({ n: us + vs, v: target2.clone() })
                    sindx = Math.max(i, j) - 1;
                    group.add(this.addArrow(test[0][0], test[i][j].clone().multiplyScalar(scale[sindx]), dmaterial));
                    //vs += "v";
                }
                //us += "u";
            }
        }



        this.el.setObject3D(this.attrName, group);

    }

});