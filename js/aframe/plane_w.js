    // Or inline before the <a-scene>.
    AFRAME.registerComponent('plane-w', {
        init: function () {
            var geometry, material;
  
            this.rendererSystem = this.el.sceneEl.systems.renderer;
            material = this.material = new THREE.LineBasicMaterial({
                color: "#000000",
                opacity: 1,
                transparent: false,
                visible: true
            });

            var vertices = new Float32Array([
                0, 0, 0, 1.35, 0, 0,
                1.35, -0.03, 0, 1.5, 0, 0,
                1.35, .03, 0, 1.5, 0, 0,
                1.35, -.03, 0, 1.35, .03, 0
            ]);

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

            this.rendererSystem.applyColorCorrection(material.color);
            var mesh = new THREE.Line(geometry, material);
            var group = new THREE.Group();

            group.add(mesh);

            var nmesh = mesh.clone();
            nmesh.rotation.x = 1.570796327;
            nmesh.rotation.z = 1.570796327;
            nmesh.scale = 15;
            group.add(nmesh);

            vertices = new Float32Array([
                -0.3, 0, -0.3, 1.7, 0,-0.3,
                1.7, 0, 1.7, -0.3, 0, 1.7, -0.3, 0, -0.3
            ]);

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            mesh = new THREE.Line(geometry, material);
            group.add(mesh);

            this.el.setObject3D(this.attrName, group);
        }

    });