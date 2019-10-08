    // Or inline before the <a-scene>.
    AFRAME.registerComponent('axis-xyz', {
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
  
          var vertices = new Float32Array([
            0, 0, 0, 1.85, 0, 0,
            1.85, -0.03, 0, 2, 0, 0,
            1.85, .03, 0, 2, 0, 0,
            1.85, -.03, 0, 1.85, .03, 0
          ]);
  
          geometry = this.geometry = new THREE.BufferGeometry();
          geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
          this.rendererSystem.applyColorCorrection(material.color);
          var mesh = new THREE.Line(geometry, material);
          var group = new THREE.Group();
        
          group.add(mesh);
  
          var nmesh = mesh.clone();
          nmesh.rotation.z = 1.570796327;
          nmesh.rotation.y = 1.570796327;
          nmesh.scale = 15;
          group.add(nmesh);
          nmesh = mesh.clone();
          nmesh.rotation.x = 1.570796327;
          nmesh.rotation.z = 1.570796327;
          nmesh.scale = 15;
          group.add(nmesh);
  
          this.el.setObject3D(this.attrName, group);
          //console.log('Hello, World2!');
        }
  
      });