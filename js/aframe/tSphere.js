    // Or inline before the <a-scene>.
    AFRAME.registerComponent('tsphere', {
      init: function () {
        var geometry;
        var material;

        //console.log('Hello, World1!');
        this.rendererSystem = this.el.sceneEl.systems.renderer;
        material = this.material = new THREE.LineBasicMaterial({
          color: "#000000",
          opacity: 1,
          transparent: false,
          visible: true
        });

        var step = 65;
        var twoPi = (Math.PI * 2) / (step - 1);
        var vertices;
        var group = new THREE.Group();
        var mesh;
        var polPi = (Math.PI) / 22;

        for (let j = 0; j < 22; j++) {
          vertices = new Float32Array(step * 3);
          for (let i = 0; i <= step; i++) { // выведет 0, затем 1, затем 2
            vertices[i * 3] = Math.sin(twoPi * i) * Math.cos(polPi * j);
            vertices[i * 3 + 1] = Math.sin(twoPi * i) * Math.sin(polPi * j);
            vertices[i * 3 + 2] = Math.cos(twoPi * i);
          }

          geometry = new THREE.BufferGeometry();
          geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
          this.rendererSystem.applyColorCorrection(material.color);
          mesh = new THREE.Line(geometry, material);
          group.add(mesh);
        }

        for (let j = 1; j < 22; j++) {
          vertices = new Float32Array(step * 3);
          for (let i = 0; i <= step; i++) { // выведет 0, затем 1, затем 2
            vertices[i * 3] = Math.sin(polPi * j) * Math.cos(twoPi * i);
            vertices[i * 3 + 1] = Math.sin(polPi * j) * Math.sin(twoPi * i);
            vertices[i * 3 + 2] = Math.cos(polPi * j);
          }

          geometry = new THREE.BufferGeometry();
          geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
          mesh = new THREE.Line(geometry, material);
          group.add(mesh);

        }

        this.el.setObject3D(this.attrName, group);
        //console.log('Hello, World2!');
      }

    });