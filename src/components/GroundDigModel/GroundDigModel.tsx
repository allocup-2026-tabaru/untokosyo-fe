"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './GroundDigModel.css';
const modelBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

const CONFIG = {
    seed: 1208,

    scene: {
        backgroundColor: 0xbfd9ea,
        skyTopColor: 0x9fc8e7,
        skyBottomColor: 0xd7ead6,
        fogNear: 15,
        fogFar: 48
    },

    camera: {
        fov: 45,
        near: 0.1,
        far: 120,
        position: { x: 5.3, y: 3.3, z: 7.4 },
        target: { x: 4, y: 0.45, z: -0.2 }
    },

    renderer: {
        exposure: 1.05,
        maxPixelRatio: 2
    },

    lights: {
        hemisphere: {
            skyColor: 0xeaf7ff,
            groundColor: 0x547044,
            intensity: 1.45
        },
        sun: {
            color: 0xfff1d2,
            intensity: 3.1,
            position: { x: -8, y: 16, z: 10 }
        },
        fill: {
            color: 0xd7ecff,
            intensity: 0.65,
            position: { x: 12, y: 8, z: -10 }
        }
    },

    groundTexture: {
        size: 1024,
        cellSize: 14,
        repeat: 5,
        drawLines: true,
        lineColor: "rgba(255,255,255,0.025)",
        palette: [
            [76, 137, 70],
            [86, 151, 75],
            [96, 158, 86],
            [67, 124, 67],
            [111, 166, 88],
            [88, 132, 72]
        ],
        variance: 10
    },

    models: {
        ground: {
            path: `${modelBaseUrl}/jimen.glb`,
            position: { x: 0, y: 0, z: 0 },
            rotation: { y: 0 },
            scale: 1
        },
        dig: {
            path: `${modelBaseUrl}/jimen_dig.glb`,
            position: { x: 0, y: 0.01, z: 0 },
            rotation: { y: 0 },
            scale: 1
        },
        kabu: {
            path: `${modelBaseUrl}/kabu.glb`,
            position: { x: 0, y: 0.3, z: 0 },
            rotation: { y: 0 },
            scale: 1
        },
        rope: {
            path: `${modelBaseUrl}/rope.glb`,
            position: { x: 0, y: 0.3, z: 0 },
            rotation: { y: 0 },
            scale: 1
        },
        rope2: {
            path: `${modelBaseUrl}/rope2.glb`,
            position: { x: 3, y: 0.1, z: 0 },
            rotation: { y: 0 },
            scale: 1
        }
    },

    dog: {
        path: `${modelBaseUrl}/dog.glb`,
        position: { x: 5, y: 0.3, z: 0 },
        rotation: { y: -Math.PI / 2 },
        scale: 0.5,

        materialColors: {
            base_color: "#ffffff",
            accent_color: "#ff9900",
            nose_color: "#222222",
            tail_color: "#aa7744"
        },

        animation: {
            pullName: "pull",
            pullOutName: "pull_out",
            pullSpeed: 1.0,
            pullOutSpeed: 1.0,
            pauseAfterPull: 0.4,
            pauseAfterPullOut: 0.6,
            fadeDuration: 0.15
        }
    },

    forest: {
        paths: [
            `${modelBaseUrl}/tree.glb`,
            `${modelBaseUrl}/tree2.glb`
        ],
        count: 100,
        area: {
            xMin: -50,
            xMax: 50,
            zMin: -45,
            zMax: -12,
            y: 0.03
        },
        scale: {
            min: 0.7,
            max: 0.9
        }
    },

    fence: {
        path: `${modelBaseUrl}/saku.glb`,
        count: 50,
        startX: -18,
        z: -8,
        y: 0.1,
        spacingMin: 1.5,
        spacingMax: 1.8,
        rotationY: Math.PI / 2,
        randomFlip: true,
        scale: 0.3
    }
};

const createRandom = (seed: number) => {
    let value = seed >>> 0;

    return function random() {
        value += 0x6D2B79F5;

        let t = value;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const randomRange = (rng: () => number, min: number, max: number) => {
    return min + rng() * (max - min);
};

const pick = <T,>(rng: () => number, items: T[]): T => {
    return items[Math.floor(rng() * items.length)];
};

export default function RefactorScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const rng = createRandom(CONFIG.seed);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
        scene.fog = new THREE.Fog(
            CONFIG.scene.backgroundColor,
            CONFIG.scene.fogNear,
            CONFIG.scene.fogFar
        );

        const camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );

        camera.position.set(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = CONFIG.renderer.exposure;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(
            CONFIG.camera.target.x,
            CONFIG.camera.target.y,
            CONFIG.camera.target.z
        );
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.enablePan = false;
        controls.minDistance = 4.5;
        controls.maxDistance = 15;
        controls.minPolarAngle = Math.PI * 0.20;
        controls.maxPolarAngle = Math.PI * 0.48;
        controls.update();

        const loadingManager = new THREE.LoadingManager();

        loadingManager.onLoad = () => {
            setIsLoaded(true);
        };

        loadingManager.onError = (url: string) => {
            console.error(`Asset load error: ${url}`);
        };

        const loader = new GLTFLoader(loadingManager);
        const clock = new THREE.Clock();
        const mixers: THREE.AnimationMixer[] = [];

        let animationFrameId: number;

        const initScene = () => {
            scene.add(createSkyDome());

            const hemiLight = new THREE.HemisphereLight(
                CONFIG.lights.hemisphere.skyColor,
                CONFIG.lights.hemisphere.groundColor,
                CONFIG.lights.hemisphere.intensity
            );
            scene.add(hemiLight);

            const sun = new THREE.DirectionalLight(
                CONFIG.lights.sun.color,
                CONFIG.lights.sun.intensity
            );
            sun.position.set(
                CONFIG.lights.sun.position.x,
                CONFIG.lights.sun.position.y,
                CONFIG.lights.sun.position.z
            );
            sun.castShadow = true;
            sun.shadow.mapSize.set(2048, 2048);
            sun.shadow.camera.near = 1;
            sun.shadow.camera.far = 60;
            sun.shadow.camera.left = -35;
            sun.shadow.camera.right = 35;
            sun.shadow.camera.top = 35;
            sun.shadow.camera.bottom = -35;
            sun.shadow.bias = -0.00025;
            scene.add(sun);

            const fill = new THREE.DirectionalLight(
                CONFIG.lights.fill.color,
                CONFIG.lights.fill.intensity
            );
            fill.position.set(
                CONFIG.lights.fill.position.x,
                CONFIG.lights.fill.position.y,
                CONFIG.lights.fill.position.z
            );
            scene.add(fill);
        };

        const createSkyDome = () => {
            const geometry = new THREE.SphereGeometry(500, 32, 16);

            const material = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                depthWrite: false,
                uniforms: {
                    topColor: {
                        value: new THREE.Color(CONFIG.scene.skyTopColor)
                    },
                    bottomColor: {
                        value: new THREE.Color(CONFIG.scene.skyBottomColor)
                    },
                    offset: {
                        value: 30
                    },
                    exponent: {
                        value: 0.75
                    }
                },
                vertexShader: `
                    varying vec3 vWorldPosition;

                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 topColor;
                    uniform vec3 bottomColor;
                    uniform float offset;
                    uniform float exponent;

                    varying vec3 vWorldPosition;

                    void main() {
                        vec3 shiftedPosition = vWorldPosition + vec3(0.0, offset, 0.0);
                        float h = normalize(shiftedPosition).y;
                        float gradient = pow(max(h, 0.0), exponent);

                        gl_FragColor = vec4(mix(bottomColor, topColor, gradient), 1.0);
                    }
                `
            });

            const sky = new THREE.Mesh(geometry, material);
            sky.name = "SkyDome";
            sky.renderOrder = -1;

            return sky;
        };

        const createGroundMaterial = () => {
            const texture = createLowPolyTexture();

            return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.94,
                metalness: 0,
                side: THREE.DoubleSide
            });
        };

        const createLowPolyTexture = () => {
            const { size, cellSize, repeat } = CONFIG.groundTexture;

            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) return new THREE.Texture();

            ctx.fillStyle = "#5f934b";
            ctx.fillRect(0, 0, size, size);

            for (let y = 0; y < size; y += cellSize) {
                for (let x = 0; x < size; x += cellSize) {
                    const p1: [number, number] = [x, y];
                    const p2: [number, number] = [x + cellSize, y];
                    const p3: [number, number] = [x, y + cellSize];
                    const p4: [number, number] = [x + cellSize, y + cellSize];

                    drawTriangle(ctx, p1, p2, p3, randomGroundColor());
                    drawTriangle(ctx, p2, p4, p3, randomGroundColor());
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;

            return texture;
        };

        const drawTriangle = (ctx: CanvasRenderingContext2D, p1: [number, number], p2: [number, number], p3: [number, number], color: number[]) => {
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.lineTo(p3[0], p3[1]);
            ctx.closePath();

            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fill();

            if (CONFIG.groundTexture.drawLines) {
                ctx.strokeStyle = CONFIG.groundTexture.lineColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        function randomGroundColor() {
            const base = pick(rng, CONFIG.groundTexture.palette);
            const variance = CONFIG.groundTexture.variance;

            return base.map((value) => {
                const shifted = value + (rng() - 0.5) * variance;
                return Math.round(THREE.MathUtils.clamp(shifted, 0, 255));
            });
        };

        const applyTransform = (object: THREE.Object3D, config: any) => {
            const position = config.position ?? { x: 0, y: 0, z: 0 };
            const rotation = config.rotation ?? { y: 0 };
            const scale = config.scale ?? 1;

            object.position.set(position.x, position.y, position.z);
            object.rotation.y = rotation.y ?? 0;
            object.scale.setScalar(scale);
        };

        const setupMeshes = (root: THREE.Object3D, options: any = {}) => {
            root.traverse((obj) => {
                if (!(obj instanceof THREE.Mesh)) return;

                obj.castShadow = options.castShadow ?? true;
                obj.receiveShadow = options.receiveShadow ?? true;

                if (options.material) {
                    obj.material = options.material;
                }

                const materials = Array.isArray(obj.material)
                    ? obj.material
                    : [obj.material];

                materials.forEach((material: any) => {
                    if (!material) return;

                    if ("metalness" in material) {
                        material.metalness = Math.min(material.metalness, 0.05);
                    }

                    if ("roughness" in material) {
                        material.roughness = Math.max(material.roughness, 0.65);
                    }

                    material.needsUpdate = true;
                });
            });
        };

        const recolorNamedMaterials = (root: THREE.Object3D, colorMap: Record<string, string>) => {
            root.traverse((obj) => {
                if (!(obj instanceof THREE.Mesh) || !obj.material) return;

                const materials = Array.isArray(obj.material)
                    ? obj.material
                    : [obj.material];

                const recoloredMaterials = materials.map((material: any) => {
                    const color = colorMap[material.name];

                    if (!color) {
                        return material;
                    }

                    const cloned = material.clone();
                    cloned.color.set(color);
                    cloned.metalness = 0;
                    cloned.roughness = Math.max(cloned.roughness ?? 0.75, 0.72);
                    cloned.needsUpdate = true;

                    return cloned;
                });

                obj.material = Array.isArray(obj.material)
                    ? recoloredMaterials
                    : recoloredMaterials[0];
            });
        };

        const prepareOneShotAction = (action: THREE.AnimationAction, speed: number) => {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.timeScale = speed;
        };

        const setupDogAnimation = (dog: THREE.Object3D, animations: THREE.AnimationClip[]) => {
            const settings = CONFIG.dog.animation;

            const pullClip = THREE.AnimationClip.findByName(animations, settings.pullName);
            const pullOutClip = THREE.AnimationClip.findByName(animations, settings.pullOutName);

            if (!pullClip || !pullOutClip) {
                console.error("Dog animation not found:", animations.map((clip) => clip.name));
                return;
            }

            const mixer = new THREE.AnimationMixer(dog);
            mixers.push(mixer);

            const pullAction = mixer.clipAction(pullClip);
            const pullOutAction = mixer.clipAction(pullOutClip);

            prepareOneShotAction(pullAction, settings.pullSpeed);
            prepareOneShotAction(pullOutAction, settings.pullOutSpeed);

            let currentAction: THREE.AnimationAction | null = null;
            let shouldPlayPull = true;

            const playAction = (action: THREE.AnimationAction) => {
                if (currentAction) {
                    currentAction.fadeOut(settings.fadeDuration);
                }

                action.reset();
                action.fadeIn(settings.fadeDuration);
                action.play();

                currentAction = action;
            };

            const playNext = () => {
                playAction(shouldPlayPull ? pullAction : pullOutAction);
            };

            mixer.addEventListener("finished", () => {
                const pause = shouldPlayPull
                    ? settings.pauseAfterPull
                    : settings.pauseAfterPullOut;

                shouldPlayPull = !shouldPlayPull;

                window.setTimeout(playNext, pause * 1000);
            });

            playNext();
        };

        const loadGLTF = (path: string) => {
            return loader.loadAsync(path);
        };

        const addGround = async (material: THREE.Material) => {
            const gltf = await loadGLTF(CONFIG.models.ground.path);
            const model = gltf.scene;

            applyTransform(model, CONFIG.models.ground);
            setupMeshes(model, {
                material,
                castShadow: false,
                receiveShadow: true
            });

            scene.add(model);
        };

        const addStaticModel = async (modelConfig: any, meshOptions: any = {}) => {
            const gltf = await loadGLTF(modelConfig.path);
            const model = gltf.scene;

            applyTransform(model, modelConfig);
            setupMeshes(model, {
                castShadow: meshOptions.castShadow ?? true,
                receiveShadow: meshOptions.receiveShadow ?? true
            });

            scene.add(model);
        };

        const addDog = async () => {
            const gltf = await loadGLTF(CONFIG.dog.path);
            const dog = gltf.scene;

            applyTransform(dog, CONFIG.dog);
            recolorNamedMaterials(dog, CONFIG.dog.materialColors);

            setupMeshes(dog, {
                castShadow: true,
                receiveShadow: true
            });

            setupDogAnimation(dog, gltf.animations);

            scene.add(dog);
        };

        const addFence = async () => {
            const gltf = await loadGLTF(CONFIG.fence.path);
            const group = new THREE.Group();
            group.name = "FenceGroup";

            setupMeshes(gltf.scene, {
                castShadow: true,
                receiveShadow: true
            });

            let currentX = CONFIG.fence.startX;

            for (let i = 0; i < CONFIG.fence.count; i++) {
                const fence = gltf.scene.clone(true);

                fence.position.set(
                    currentX,
                    CONFIG.fence.y,
                    CONFIG.fence.z
                );

                fence.rotation.y = CONFIG.fence.rotationY;

                if (CONFIG.fence.randomFlip && rng() < 0.5) {
                    fence.rotation.y += Math.PI;
                }

                fence.scale.setScalar(CONFIG.fence.scale);
                group.add(fence);

                currentX += randomRange(rng, CONFIG.fence.spacingMin, CONFIG.fence.spacingMax);
            }

            scene.add(group);
        };

        const addForest = async () => {
            const gltfs = await Promise.all(
                CONFIG.forest.paths.map((path) => loadGLTF(path))
            );

            const treeBases = gltfs.map((gltf) => {
                setupMeshes(gltf.scene, {
                    castShadow: true,
                    receiveShadow: true
                });
                return gltf.scene;
            });

            const group = new THREE.Group();
            group.name = "ForestGroup";

            for (let i = 0; i < CONFIG.forest.count; i++) {
                const baseTree = pick(rng, treeBases);
                const tree = baseTree.clone(true);

                const z = randomRange(rng, CONFIG.forest.area.zMin, CONFIG.forest.area.zMax);
                const depth01 = THREE.MathUtils.clamp(
                    (z - CONFIG.forest.area.zMin) /
                    (CONFIG.forest.area.zMax - CONFIG.forest.area.zMin),
                    0,
                    1
                );

                const scale = randomRange(rng, CONFIG.forest.scale.min, CONFIG.forest.scale.max)
                    * THREE.MathUtils.lerp(0.85, 1.15, depth01);

                tree.position.set(
                    randomRange(rng, CONFIG.forest.area.xMin, CONFIG.forest.area.xMax),
                    CONFIG.forest.area.y,
                    z
                );

                tree.rotation.y = rng() * Math.PI * 2;
                tree.scale.setScalar(scale);

                group.add(tree);
            }

            scene.add(group);
        };

        const main = async () => {
            const groundMaterial = createGroundMaterial();

            await Promise.all([
                addGround(groundMaterial),
                addStaticModel(CONFIG.models.dig, { castShadow: false, receiveShadow: true }),
                addStaticModel(CONFIG.models.kabu, { castShadow: true, receiveShadow: true }),
                addStaticModel(CONFIG.models.rope, { castShadow: true, receiveShadow: true }),
                addStaticModel(CONFIG.models.rope2, { castShadow: true, receiveShadow: true }),
                addDog(),
                addFence(),
                addForest()
            ]);

            animate();
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const delta = clock.getDelta();

            for (const mixer of mixers) {
                mixer.update(delta);
            }

            controls.update();
            renderer.render(scene, camera);
        };

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio));
        };

        initScene();
        main().catch((error) => {
            console.error(error);
        });

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(animationFrameId);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div className={isLoaded ? "is-loaded" : ""} style={{ width: "100%", height: "100%" }}>
            <div id="loading">読み込み中</div>
            <div ref={containerRef} />
        </div>
    );
}
