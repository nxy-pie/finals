let scene, camera, renderer;
let butterflies = [];
const BUTTERFLY_COUNT = 18;

function createButterflyMesh() {
    const butterflyGroup = new THREE.Group();

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.8, 1.2, 2.2, 1.8, 2.8, 0.8);
    wingShape.bezierCurveTo(3.2, 0.0, 2.2, -1.0, 1.2, -1.2);
    wingShape.bezierCurveTo(1.8, -1.8, 1.2, -2.6, 0.2, -2.2);
    wingShape.bezierCurveTo(-0.1, -1.5, 0, 0, 0, 0);

    const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const leftWingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

    const colors = [0x8B5CF6, 0xEC4899, 0x06B6D4, 0xF43F5E, 0xA855F7];
    const primaryColor = colors[Math.floor(Math.random() * colors.length)];

    const wingMaterial = new THREE.MeshPhongMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        shininess: 90,
        transparent: true,
        opacity: 0.88,
    });

    const leftWingPivot = new THREE.Group();
    const leftWingMesh = new THREE.Mesh(leftWingGeo, wingMaterial);
    leftWingMesh.scale.set(0.6, 0.6, 0.6);
    leftWingPivot.add(leftWingMesh);
    butterflyGroup.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    const rightWingMesh = new THREE.Mesh(leftWingGeo, wingMaterial);
    rightWingMesh.scale.set(-0.6, 0.6, 0.6);
    rightWingPivot.add(rightWingMesh);
    butterflyGroup.add(rightWingPivot);

    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.04, 1.8, 8);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI / 2;
    butterflyGroup.add(bodyMesh);

    const antennaMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const antennaGeo1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(0.3, 1.3, 0.2)
    ]);
    const antennaGeo2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(-0.3, 1.3, 0.2)
    ]);
    butterflyGroup.add(new THREE.Line(antennaGeo1, antennaMat));
    butterflyGroup.add(new THREE.Line(antennaGeo2, antennaMat));

    return {
        group: butterflyGroup,
        leftWing: leftWingPivot,
        rightWing: rightWingPivot,
        wingSpeed: 0.15 + Math.random() * 0.15,
        wingAngle: Math.random() * Math.PI,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.04,
            (Math.random() - 0.5) * 0.05
        ),
        baseY: (Math.random() - 0.5) * 15
    };
}

function init3DScene() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.025);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
        const b = createButterflyMesh();
        b.group.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 15
        );
        const scale = 0.6 + Math.random() * 0.6;
        b.group.scale.set(scale, scale, scale);
        scene.add(b.group);
        butterflies.push(b);
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate3DScene() {
    requestAnimationFrame(animate3DScene);

    butterflies.forEach((b) => {
        b.wingAngle += b.wingSpeed;
        const flap = Math.sin(b.wingAngle) * 0.8;
        
        b.leftWing.rotation.y = flap;
        b.rightWing.rotation.y = -flap;

        b.group.position.add(b.velocity);
        b.group.position.y += Math.sin(b.wingAngle * 0.5) * 0.02;

        b.group.rotation.z = Math.sin(b.wingAngle * 0.2) * 0.1;

        if (Math.abs(b.group.position.x) > 16) b.velocity.x *= -1;
        if (Math.abs(b.group.position.y) > 12) b.velocity.y *= -1;
        if (Math.abs(b.group.position.z) > 12) b.velocity.z *= -1;
    });

    renderer.render(scene, camera);
}

function resetCameraView() {
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);
}

function handleLogin(event) {
    event.preventDefault();

    const loginSection = document.getElementById('login-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const footer = document.getElementById('main-footer');

    loginSection.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        loginSection.classList.add('hidden');
        portfolioSection.classList.remove('hidden');
        portfolioSection.classList.add('flex');
        footer.classList.remove('hidden');

        setTimeout(() => {
            portfolioSection.classList.remove('opacity-0', 'scale-95');
            portfolioSection.classList.add('opacity-100', 'scale-100');
        }, 50);
    }, 500);
}

function handleLogout() {
    const loginSection = document.getElementById('login-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const footer = document.getElementById('main-footer');

    portfolioSection.classList.remove('opacity-100', 'scale-100');
    portfolioSection.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        portfolioSection.classList.add('hidden');
        portfolioSection.classList.remove('flex');
        footer.classList.add('hidden');

        loginSection.classList.remove('hidden');
        setTimeout(() => {
            loginSection.classList.remove('opacity-0', 'scale-95');
            loginSection.classList.add('opacity-100', 'scale-100');
        }, 50);
    }, 500);
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    const navButtons = document.querySelectorAll('.nav-tab');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white', 'shadow');
        btn.classList.add('text-slate-400');
    });

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.remove('hidden');

    const activeNavBtn = document.getElementById(`nav-btn-${tabId}`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('bg-purple-600', 'text-white', 'shadow');
        activeNavBtn.classList.remove('text-slate-400');
    }
}

function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function enableProfileEditModal() {
    document.getElementById('edit-fullname').value = document.getElementById('user-fullname').innerText;
    document.getElementById('edit-tagline').value = document.getElementById('user-tagline').innerText.replace(/"/g, '');
    document.getElementById('edit-intro').value = document.getElementById('user-intro').innerText;
    document.getElementById('edit-course').value = document.getElementById('academic-course').innerText;
    document.getElementById('edit-school').value = document.getElementById('academic-school').innerText;
    document.getElementById('edit-email').value = document.getElementById('contact-email').innerText;

    const modal = document.getElementById('edit-profile-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeProfileEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveProfileChanges(event) {
    event.preventDefault();
    const fullname = document.getElementById('edit-fullname').value;
    const tagline = document.getElementById('edit-tagline').value;
    const intro = document.getElementById('edit-intro').value;
    const course = document.getElementById('edit-course').value;
    const school = document.getElementById('edit-school').value;
    const email = document.getElementById('edit-email').value;

    document.getElementById('user-fullname').innerText = fullname;
    document.getElementById('nav-brand-name').innerText = fullname;
    document.getElementById('user-tagline').innerText = `"${tagline}"`;
    document.getElementById('user-intro').innerText = intro;
    document.getElementById('academic-course').innerText = course;
    document.getElementById('academic-school').innerText = school;
    document.getElementById('contact-email').innerText = email;
    document.getElementById('contact-email').href = `mailto:${email}`;

    closeProfileEditModal();
}

function openProjectModal(title, description, techs) {
    document.getElementById('modal-project-title').innerText = title;
    document.getElementById('modal-project-desc').innerText = description;

    const techContainer = document.getElementById('modal-project-techs');
    techContainer.innerHTML = '';
    techs.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30';
        badge.innerText = t;
        techContainer.appendChild(badge);
    });

    const modal = document.getElementById('project-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleContactSubmit(event) {
    event.preventDefault();
    alert('Thank you for reaching out!');
    event.target.reset();
}

window.onload = function() {
    init3DScene();
    animate3DScene();
};