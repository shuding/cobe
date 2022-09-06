// Created by Shu Ding 2021.
// g@shud.in

precision highp float;
uniform vec2 uResolution;
uniform vec2 offset;
uniform float phi;
uniform float theta;
uniform float dots;
uniform float scale;
uniform vec3 baseColor;
uniform vec3 markerColor;
uniform vec3 glowColor;
uniform vec4 markers[64];
uniform float markersNum;
uniform float dotsBrightness;
uniform float diffuse;
uniform float dark;
uniform float opacity;
uniform float mapBaseBrightness;

uniform sampler2D uTexture;

// const float sqrt5 = sqrt(5.);
// const float PI = acos(-1.);
// const float HALF_PI = PI * .5;
// const float kTau = PI*2.;
// const float kPhi = (1.+sqrt5)/2.;
// const float byLogPhiPlusOne = log2(kPhi + 1.);
// const float twoPiOnPhi = kTau/kPhi;
// const float phiMinusOne = kPhi-1.;
// const float r = .8;
// const float by2P32 = 1./4294967296.;

const float sqrt5 = 2.23606797749979;
const float PI = 3.141592653589793;
const float HALF_PI = 1.5707963267948966;
const float kTau = 6.283185307179586;
const float kPhi = 1.618033988749895;
const float byLogPhiPlusOne = 0.7202100452062783;
const float twoPiOnPhi = 3.8832220774509327;
const float phiMinusOne = .618033988749895;
const float r = .8;
const float by2P32 = 2.3283064365386963e-10;
const vec3 CAM = vec3(0.,0.,1.);

float byDots = 1./dots;

mat3 rotate(float theta, float phi) {
  float cx = cos(theta);
  float cy = cos(phi);
  float sx = sin(theta);
  float sy = sin(phi);

  return mat3(
    cy, sy * sx, -sy * cx,
    0., cx, sx,
    sy, cy * -sx, cy * cx
  );
}

vec3 nearestFibonacciLattice(vec3 p, out float m) {
  p = p.xzy;

  float k = max(2., floor(log2(sqrt5 * dots * PI * (1. - p.z * p.z)) * byLogPhiPlusOne));

  vec2 f = floor(pow(kPhi,k)/sqrt5*vec2(1.,kPhi)+.5);
  vec2 br1 = fract((f+1.) * phiMinusOne)*kTau - twoPiOnPhi;
  vec2 br2 = -2.*f;
  vec2 sp = vec2(atan(p.y, p.x), p.z-1.);
  // mat2 invb = mat2(br2.y,-br2.x,-br1.y,br1.x);
  // vec2 c = floor(invb * sp / (br1.x*br2.y-br2.x*br1.y));
  vec2 c = floor(vec2(br2.y * sp.x - br1.y * (sp.y * dots + 1.), -br2.x * sp.x + br1.x * (sp.y * dots + 1.)) / (br1.x*br2.y-br2.x*br1.y));
  
  float mindist = PI;
  vec3 minip;
  for (float s = 0.; s < 4.; s+=1.) {
    vec2 o = vec2(mod(s, 2.), floor(s*.5));
    float idx = dot(f, c + o);
    if (idx > dots) continue;

    // float v = idx / kPhi;
    // float theta = fract(v) * kTau;

    // int iFracV = int(idx) * 2654435769; // signed be like nearest-to-zero fmod; 2^32/phi
    // float fracV = float(iFracV) * by2P32;
    // float theta = fracV * kTau;

    // https://github.com/shuding/cobe/issues/16
    
    float tidx = idx;
    float fracV = 0.;

    // see codegen

    if(tidx >= 524288.) { tidx-=524288.; fracV += 0.8038937048986554; }
    if(tidx >= 262144.) { tidx-=262144.; fracV += 0.9019468524493277; }
    if(tidx >= 131072.) { tidx-=131072.; fracV += 0.9509734262246639; }
    if(tidx >= 65536.) { tidx-=65536.; fracV += 0.4754867131123319; }
    if(tidx >= 32768.) { tidx-=32768.; fracV += 0.737743356556166; }
    if(tidx >= 16384.) { tidx-=16384.; fracV += 0.868871678278083; }
    if(tidx >= 8192.) { tidx-=8192.; fracV += 0.9344358391390415; }
    if(tidx >= 4096.) { tidx-=4096.; fracV += 0.46721791956952075; }
    if(tidx >= 2048.) { tidx-=2048.; fracV += 0.7336089597847604; }
    if(tidx >= 1024.) { tidx-=1024.; fracV += 0.8668044798923802; }
    if(tidx >= 512.) { tidx-=512.; fracV += 0.4334022399461901; }
    if(tidx >= 256.) { tidx-=256.; fracV += 0.21670111997309505; }
    if(tidx >= 128.) { tidx-=128.; fracV += 0.10835055998654752; }
    if(tidx >= 64.) { tidx-=64.; fracV += 0.5541752799932738; }
    if(tidx >= 32.) { tidx-=32.; fracV += 0.7770876399966369; }
    if(tidx >= 16.) { tidx-=16.; fracV += 0.8885438199983184; }
    if(tidx >= 8.) { tidx-=8.; fracV += 0.9442719099991592; }
    if(tidx >= 4.) { tidx-=4.; fracV += 0.4721359549995796; }
    if(tidx >= 2.) { tidx-=2.; fracV += 0.2360679774997898; }
    if(tidx >= 1.) { tidx-=1.; fracV += 0.6180339887498949; }

    float theta = fract(fracV) * kTau;

    float cosphi = 1. - 2. * idx * byDots;
    float sinphi = sqrt(1. - cosphi * cosphi);
    vec3 sample = vec3(cos(theta) * sinphi, sin(theta) * sinphi, cosphi);

    float dist = length(p - sample);

    if (dist < mindist) {
      mindist = dist;
      minip = sample;
    }
  }

  m = mindist;

  return minip.xzy;
}

void main() {
  vec2 uv = ((gl_FragCoord.xy / uResolution) * 2. - 1.) / scale - offset * vec2(1., -1.) / uResolution;
  uv.x *= uResolution.x / uResolution.y;

  float l = dot(uv, uv);
  vec4 color = vec4(0.);

  if (l <= r * r) {
    for (int side = 0; side <= 1; side++) {
      vec4 layer = vec4(0.);
      float dis;

      vec3 light = vec3(0.,0.,1.);
      vec3 p = normalize(vec3(uv, sqrt(r*r - l)));

      p.z *= side > 0 ? -1. : 1.;
      light.z *= side > 0 ? -1. : 1.;

      vec3 rP = p * rotate(theta, phi);

      float diff = -kTau * dots / kPhi;

      vec3 gP = nearestFibonacciLattice(rP, dis);

      float gPhi = asin(gP.y);
      float gTheta = acos(-gP.x / cos(gPhi));
      if (gP.z < 0.) gTheta = -gTheta;

      float mapColor = max(texture2D(uTexture, vec2(((gTheta * .5) / PI), -(gPhi / PI + .5))).x, mapBaseBrightness);
      float v = smoothstep(.008, .0, dis);
      
      float dotNL = dot(p, light);
      float lighting = pow(dotNL,diffuse)*dotsBrightness;
      float sample = mapColor*v * lighting;
      float colorFactor = mix((1. - sample) * pow(dotNL,.4), sample, dark) + .1;
      layer += vec4(baseColor * colorFactor, 1.);

      int num = int(markersNum);
      float markerLight = 0.;
      for (int m = 0; m < 64; m++) {
        if (m >= num) break;
        vec4 marker = markers[m];
        vec3 c = marker.xyz;
        vec3 l = c - rP;
        float size = marker.w;
        if (dot(l,l) > size * size * 4.) continue;
        vec3 mP = nearestFibonacciLattice(c, dis);
        dis = length(mP - rP);
        if (dis < size) { markerLight += smoothstep(size*.5,0.,dis); }
      }
      markerLight = min(1., markerLight * lighting);
      layer.xyz = mix(layer.xyz, markerColor, markerLight);
      layer.xyz += pow(1. - dotNL, 4.) * glowColor;

      color += layer * (1. + (side > 0 ? -opacity : opacity)) / 2.;
    }
  }

  float glowFactor = pow(dot(normalize(vec3(-uv, sqrt(1.- l))), CAM), 4.) * smoothstep(0.1,1.,.2/(l-r*r));
  gl_FragColor = color + vec4(glowFactor * glowColor, glowFactor);
}