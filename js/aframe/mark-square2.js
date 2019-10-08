AFRAME.registerComponent('mark-square2', {

    init: function () {

    },


    play: function () {
        var starsGeometry = new THREE.Geometry();

        var star = new THREE.Vector3(0, 0, 0);
        starsGeometry.vertices.push(star);

        var starsMaterial = new THREE.PointsMaterial({ color: 0x000000, size: 0.03 });

        var starField = new THREE.Points(starsGeometry, starsMaterial);

        this.el.setObject3D('mesh', starField);
    },

    remove: function () {
        console.log('remove square');
        if (this.mesh) this.el.removeObject3D('mesh');
    }

});

