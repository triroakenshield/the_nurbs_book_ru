    // Or inline before the <a-scene>.
    AFRAME.registerComponent('test-curve1', {
        init: function () {
            var geometry;

            //console.log('Hello, World1!');
            this.rendererSystem = this.el.sceneEl.systems.renderer;
            var material = this.material = new THREE.LineBasicMaterial({
                color: "#000000",
                opacity: 1,
                transparent: false,
                visible: true
            });

            //        <path d="M50 150 C 150 100 350 400 450 350" stroke="black" fill="transparent" />

            var U = [0, 0, 0, 0, 1, 1, 1, 1];
            var P = [new THREE.Vector4(1, 0, 0.5, 1), new THREE.Vector4(0, -1, 0.5, 1), new THREE.Vector4(0, 1, 0.5, 1),
                new THREE.Vector4(-1, 0, 0.5, 1)
            ];

            var p = 3;

            function DrawPath(p, U, P) {
                var sstring = "M";
                var step = 100;
                var C;
                var res = new Float32Array(step * 3);
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

            var vertices = DrawPath(p, U, P);

            geometry = this.geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

            this.rendererSystem.applyColorCorrection(material.color);
            var mesh = new THREE.Line(geometry, material);
            var group = new THREE.Group();

            group.add(mesh);
           
            this.el.setObject3D(this.attrName, group);
            //console.log('Hello, World2!');
            
        }

    });