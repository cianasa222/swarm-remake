import * as THREE from 'three';

/**
 * 程序化晴日海岸环境贴图（IBL）：
 * 无需外部 HDR 文件，通过 PMREMGenerator 生成包含天光、海平线亮带、地面反光与太阳高光的环境贴图，
 * 赋予 PBR 材质（金属机械臂、护目镜、武器、防浪外套）真实的高光反射层次。
 */
export function buildSunnyEnv(gl: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();

  const skyGeo = new THREE.SphereGeometry(20, 32, 20);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 zenith = vec3(0.345, 0.698, 0.922);   // #58b2eb
        vec3 horizon = vec3(0.851, 0.953, 1.000);  // #d9f3ff
        vec3 ground = vec3(0.722, 0.710, 0.671);   // #b8b5ab
        vec3 col = d.y >= 0.0
          ? mix(horizon, zenith, pow(d.y, 0.58))
          : mix(horizon * 0.92, ground, pow(-d.y, 0.45));
        vec3 sunDir = normalize(vec3(0.45, 0.82, 0.35));
        float sunDot = max(dot(d, sunDir), 0.0);
        col += vec3(1.0, 0.96, 0.86) * (pow(sunDot, 28.0) * 1.35 + pow(sunDot, 4.0) * 0.22);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(sky);

  // 两块柔光面板增强金属与护目镜的反射带
  const panelGeo = new THREE.PlaneGeometry(10, 4);
  const warmPanelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.05, 1.8), side: THREE.DoubleSide });
  const warmPanel = new THREE.Mesh(panelGeo, warmPanelMat);
  warmPanel.position.set(7, 8, 6);
  warmPanel.lookAt(0, 0, 0);

  const coolPanelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.9, 2.2), side: THREE.DoubleSide });
  const coolPanel = new THREE.Mesh(panelGeo, coolPanelMat);
  coolPanel.position.set(-8, 6, -5);
  coolPanel.lookAt(0, 0, 0);

  envScene.add(warmPanel, coolPanel);

  const rt = pmrem.fromScene(envScene, 0.03);

  skyGeo.dispose();
  skyMat.dispose();
  panelGeo.dispose();
  warmPanelMat.dispose();
  coolPanelMat.dispose();
  pmrem.dispose();

  return rt.texture;
}
