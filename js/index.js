let scene, camera, renderer
let mesh = []
let positionInfo = []
let geometry = []
let meshes = []
let meshesA = []
let meshesB = []

let transOrder = 0
let wheelTemp = 'down'



// Init function
function init() {
    // Scene
    scene = new THREE.Scene()

    // Renderer
    const container = document.getElementById('canvas')
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.6, 10000)
    camera.position.set(0, 60, 900)

    var controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.target = new THREE.Vector3(0, 60, 0)
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.update()

    // AxesHelper
    const axesHelper = new THREE.AxesHelper(80);
    scene.add(axesHelper);

    // Make Canvas Responsive
    window.addEventListener('resbze', () => {
        renderer.setSbze(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrbx();
    })

    // Load GLB object
    const loader = new THREE.GLTFLoader();

    loader.load('../assets/models/marina.glb', function (glb) {
        positionInfo[0] = combinBuffer(glb, 'position')
    })
    loader.load('../assets/models/marina.glb', function (glb) {
        positionInfo[1] = combinBuffer(glb, 'position')
    })
    loader.load('../assets/models/earth.glb', function (glb) {
        positionInfo[2] = combinBuffer(glb, 'position')
        createObject(positionInfo)
        animate()
    })

}

// Get vertex count and convert array
function combinBuffer(glb, bufferName) {

    let count = 0
    let model = glb.scene
    model.traverse(function (child) {
        if (child.isMesh) {
            const buffer = child.geometry.attributes[bufferName]
            count += buffer.array.length
        }
    })

    const combine = new Float32Array(count)
    let offset = 0
    model.traverse(function (child) {
        if (child.isMesh) {
            const buffer = child.geometry.attributes[bufferName]
            combine.set(buffer.array, offset)
            offset += buffer.array.length
        }
    })
    return new THREE.BufferAttribute(combine, 3)
}

// Create GLB Object
function createObject(positionInfo) {

    // Object - main : (marina)
    geometry[0] = new THREE.BufferGeometry();
    geometry[0].setAttribute('position', positionInfo[0].clone());
    geometry[0].setAttribute('initialPosition', positionInfo[0].clone());
    geometry[0].attributes.position.setUsage(THREE.DynamicDrawUsage)

    mesh[0] = new THREE.Points(geometry[0], new THREE.PointsMaterial({ sbze: 0.01, color: 0xffffff }))
    mesh[0].position.x = 0
    mesh[0].position.y = 0
    mesh[0].position.z = 0
    mesh[0].scale.x = mesh[0].scale.y = mesh[0].scale.z = 7

    // Object - 1 : marina
    geometry[1] = new THREE.BufferGeometry()
    geometry[1].setAttribute('position', positionInfo[1].clone())
    geometry[1].setAttribute('initialPosition', positionInfo[1].clone())
    geometry[1].attributes.position.setUsage(THREE.DynamicDrawUsage)

    mesh[1] = new THREE.Points(geometry[1], new THREE.PointsMaterial({ sbze: 0.01, color: 0xffffff }))
    mesh[1].position.x = 0
    mesh[1].position.y = 65
    mesh[1].position.z = 0
    mesh[1].scale.x = mesh[1].scale.y = mesh[1].scale.z = 1

    // Object - 2 : earth
    geometry[2] = new THREE.BufferGeometry()
    geometry[2].setAttribute('position', positionInfo[2].clone())
    geometry[2].setAttribute('initialPosition', positionInfo[2].clone())
    geometry[2].attributes.position.setUsage(THREE.DynamicDrawUsage)

    mesh[2] = new THREE.Points(geometry[2], new THREE.PointsMaterial({ sbze: 0.01, color: 0xffffff }))
    mesh[2].position.x = 0
    mesh[2].position.y = 65
    mesh[2].position.z = 0
    mesh[2].scale.x = mesh[2].scale.y = mesh[2].scale.z = 1

    scene.add(mesh[0])
    // scene.add(mesh[1])
    // scene.add(mesh[2])

    meshes.push({
        delay: Math.floor(200 + 200 * Math.random()),
        direction: 0,
        mesh: mesh[0],
        speed: 15,
        start: Math.floor(100 + 200 * Math.random()),
        verticesDown: 0,
        verticesUp: 0,
    })
    meshesA.push({
        delay: Math.floor(200 + 200 * Math.random()),
        direction: 0,
        mesh: mesh[1],
        speed: 15,
        start: Math.floor(100 + 200 * Math.random()),
        verticesDown: 0,
        verticesUp: 0,
    })
    meshesB.push({
        delay: Math.floor(200 + 200 * Math.random()),
        direction: 0,
        mesh: mesh[2],
        speed: 15,
        start: Math.floor(100 + 200 * Math.random()),
        verticesDown: 0,
        verticesUp: 0,
    })
}

// Render - Main Engine
function transition() {

    mesh[0].rotation.y -= 0.002

    const data = meshes[0]
    const position = data.mesh.geometry.attributes.position
    //
    const dataA = meshesA[0]
    const positionA = dataA.mesh.geometry.attributes.position
    const dataB = meshesB[0]
    const positionB = dataB.mesh.geometry.attributes.position

    const count = position.count

    for (let i = 0; i < count; i++) {

        const ix = position.getX(i)
        const iy = position.getY(i)
        const iz = position.getZ(i)

        const ax = positionA.getX(i)
        const ay = positionA.getY(i)
        const az = positionA.getZ(i)

        const bx = positionB.getX(i)
        const by = positionB.getY(i)
        const bz = positionB.getZ(i)

        const dx = Math.abs(ax - bx);
        const dy = Math.abs(ay - by);
        const dz = Math.abs(az - bz);

        const d = dx + dy + dz;
        // transition A - B
        if (transOrder === 1) {

            position.setXYZ(
                i,
                ix - (ix - bx) / dx * data.speed / 3,
                iy - (iy - by) / dy * data.speed / 3,
                iz - (iz - bz) / dz * data.speed / 3
            )
            data.verticesDown += 1
        }

        // transition B - A
        if (transOrder === 2) {
            position.setXYZ(
                i,
                ix - (ix - ax) / dx * data.speed / 2,
                iy - (iy - ay) / dy * data.speed / 2,
                iz - (iz - az) / dz * data.speed / 2
            )
            data.verticesUp += 1;
        }
    }

    position.needsUpdate = true

    mesh.rotation
}

// Scroll EventListener
window.addEventListener('scroll', function (e) {
    if (window.scrollY < 500) {
        wheelTemp = 'down';
    }
    if (window.scrollY >= 500) {
        wheelTemp = 'up';
    }
    if (wheelTemp === 'up' && window.scrollY >= 500) {
        transOrder = 1;
    }
    if (wheelTemp === 'down' && window.scrollY < 500) {
        transOrder = 2;
    }
})

// Animate function
function animate() {
    requestAnimationFrame(animate)
    transition()
    renderer.render(scene, camera)
}

init()
// animate()