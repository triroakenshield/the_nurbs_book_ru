AFRAME.registerComponent('nurbscurve', {
    schema: {
        controlPoints: {
            type: 'array',
            default: [0, 0, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 4, 0, 0, 1]
        },
        knots: {
            type: 'array',
            default: [0, 0, 0, 0, 1, 1, 1, 1]
        },
        degree: {
            type: 'int',
            default: 3
        }
    },

    init: function () {
        var geometry, material;

        this.rendererSystem = this.el.sceneEl.systems.renderer;
        material = this.material = new THREE.LineBasicMaterial({
            color: "#000000",
            opacity: 1,
            transparent: false,
            visible: true
        });

        var P = [], k = 0;

        for (var i = 0; i < this.data.controlPoints.length / 4; i++) {
            P.push(new THREE.Vector4(this.data.controlPoints[k], this.data.controlPoints[k + 1], this.data.controlPoints[k + 2], this.data.controlPoints[k + 3]));
            k += 4;
        }

        function DrawPath(p, U, P) {
            var step = 100, C, res = new Float32Array(step * 3);
            for (var i = 0; i <= step; i++) {
                C = NURBSUtils.calcBSplinePoint(p, U, P, i / step);
                if (C.w != 1.0) {
                    // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
                    C.divideScalar(C.w);
                }
                res[i * 3] = C.x;
                res[i * 3 + 1] = C.y;
                res[i * 3 + 2] = C.z;
            }
            return res;
        }

        var vertices = DrawPath(this.data.degree, this.data.knots, P);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        this.rendererSystem.applyColorCorrection(material.color);
        var mesh = new THREE.Line(geometry, material);
        var group = new THREE.Group();

        group.add(mesh);

        var psMaterial = new THREE.PointsMaterial({ color: 0x000000, size: 0.03 });

        vertices = new Float32Array(P.length * 3);
        var psGeometry = new THREE.Geometry();

        for (var i = 0; i < P.length; i++) {
            vertices[i * 3] = P[i].x;
            vertices[i * 3 + 1] = P[i].y;
            vertices[i * 3 + 2] = P[i].z;
            psGeometry.vertices.push(new THREE.Vector3(P[i].x, P[i].y, P[i].z));
        }

        var starField = new THREE.Points(psGeometry, psMaterial);
        group.add(starField);

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        mesh = new THREE.Line(geometry, material);
        group.add(mesh);

        this.el.setObject3D(this.attrName, group);
    }

});