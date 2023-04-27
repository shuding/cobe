// Created by Shu Ding 2021.
// g@shud.in

precision highp float;

uniform sampler2D uTexture;

uniform vec2 uResolution;
uniform vec2 offset;
uniform float phi;
uniform float theta;
uniform float dots;
uniform float scale;
uniform vec3 baseColor;
uniform vec3 markerColor;
uniform vec3 glowColor;

// x, y, texture_brightness, globe_brightness
uniform vec4 globes[10];
uniform float globesNum;

uniform float dotsBrightness;
uniform float diffuse;
uniform float dark;
uniform float opacity;
uniform float mapBaseBrightness;

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

vec4 draw_globe(float gx, float gy, float gtb, float ggb) {
  vec2 uv = ((gl_FragCoord.xy / uResolution) * 2. - 1.) / scale - (
    offset
  ) * vec2(1., -1.) / uResolution - vec2(gx, -gy);
  uv.x *= uResolution.x / uResolution.y;

  float l = dot(uv, uv);
  vec4 color = vec4(0.);
  float glowFactor = 0.;

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

      vec3 gP = rP;
      dis = 0.;

      float gPhi = asin(gP.y);
      float gTheta = acos(-gP.x / cos(gPhi));
      if (gP.z < 0.) gTheta = -gTheta;

      float mapColor = max(texture2D(uTexture, vec2(((gTheta * .5) / PI), -(gPhi / PI + .5))).x, mapBaseBrightness);
      float v = smoothstep(.008, .0, dis);
      
      float dotNL = dot(p, light);
      float lighting = pow(dotNL,diffuse)*dotsBrightness*gtb;
      float sample = mapColor * v * lighting + ggb;
      float colorFactor = mix((1. - sample) * pow(dotNL,.4), sample, dark) + .1;
      layer += vec4(baseColor * colorFactor, 1.);

      layer.xyz += pow(1. - dotNL, 4.) * glowColor;

      color += layer * (1. + (side > 0 ? -opacity : opacity)) / 2.;
    }

    glowFactor = pow(dot(normalize(vec3(-uv, sqrt(1.- l))), vec3(0.,0.,1.)), 4.) * smoothstep(0.,1.,.2/(l-r*r));
  } else {
    float outD = sqrt(.2/(l - r * r));
    glowFactor = smoothstep(0.5,1., outD / (outD + 1.));
  }

  return color + vec4(glowFactor * glowColor, glowFactor);
}

void main() {
  vec4 color = vec4(0.);
  for (int i = 0; i < 10; i++) {
    if (i > int(globesNum - 0.1)) break;
    color += draw_globe(globes[i].x, globes[i].y, globes[i].z, globes[i].w);
  }
  gl_FragColor = color;
}