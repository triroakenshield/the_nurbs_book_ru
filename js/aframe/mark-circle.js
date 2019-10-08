AFRAME.registerComponent('mark-circle', {

    init: function () {
        this.textureLoader = new THREE.TextureLoader();
    },


    play: function () {
  
        var size = 8 * 8;
        var data = new Uint8Array(4 * size);

        var r = 0;
        var a = 0;

        var w = 0,
            h = 0,
            d = 0

        for (var i = 0; i < size; i++) {

            var stride = i * 4;

            if (w >= 8) {
                w = 0;
                h++;
            }

            d = (w-3.5) * (w-3.5) + (h-3.5) * (h-3.5)

            if (d >= 18) {
                r = 255;
                a = 0;
            }
            else {
                r = 0;
                a = 255;
            }

            data[stride] = r;
            data[stride + 1] = r;
            data[stride + 2] = r;
            data[stride + 3] = a;
            w++;
        }

        var texture = new THREE.DataTexture(data, 8, 8, THREE.RGBAFormat);
        texture.needsUpdate = true

        this.material = new THREE.SpriteMaterial({
            map: texture
        });

        this.sprite = new THREE.Sprite(this.material);

        this.el.setObject3D('mesh', this.sprite);
    },


    remove: function () {
        console.log('remove sprite');
        if (this.mesh) this.el.removeObject3D('mesh');
    }

});

