// Created by Shu Ding 2021.
// g@shud.in

precision highp float;
uniform vec2 uResolution;
uniform float phi;
uniform float theta;
uniform float dots;
uniform vec3 baseColor;
uniform vec3 markerColor;
uniform vec3 glowColor;
uniform vec4 markers[64];
uniform float markersNum;
uniform float dotsBrightness;
uniform float diffuse;
uniform float dark;

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

const float sqrt5 = 2.23606797749979;
const float PI = 3.141592653589793;
const float HALF_PI = 1.5707963267948966;
const float kTau = 6.283185307179586;
const float kPhi = 1.618033988749895;
const float byLogPhiPlusOne = 0.7202100452062783;
const float twoPiOnPhi = 3.8832220774509327;
const float phiMinusOne = .618033988749895;
const float r = .8;

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

    float v = idx / kPhi;
    float theta = (v - floor(v/3000.)*3000.)*kTau;
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
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2. - 1.;
  uv.x *= uResolution.x / uResolution.y;

  float l = dot(uv, uv);
  float dis;

  // vec3 light=normalize(vec3(0.,-.1,1.));
  vec3 light=(vec3(0.,0.,1.));
  vec3 p = normalize(vec3(uv, sqrt(r*r - l)));
  if (l <= r * r) {
    vec3 rP = p * rotate(theta, phi);

    float diff = -kTau * dots / kPhi;

    vec3 gP = nearestFibonacciLattice(rP, dis);

    float gPhi = asin(gP.y);
    float gTheta = acos(-gP.x / cos(gPhi));
    if (gP.z < 0.) gTheta = -gTheta;

    float mapColor = texture2D(uTexture, vec2(((gTheta * .5) / PI), -(gPhi / PI + .5))).x;
    float v = smoothstep(.008, .0, dis);
    float dotNL = dot(p,light);
    float lighting = pow(dotNL,diffuse)*dotsBrightness;
    float sample = mapColor*v * lighting;
    float colorFactor = mix((1. - sample) * pow(dotNL,.4), sample, dark) + .1;
    gl_FragColor = vec4(baseColor*colorFactor,1.);

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
    markerLight = min(1.,markerLight*lighting);
    gl_FragColor.xyz = mix(gl_FragColor.xyz,markerColor,markerLight);
    gl_FragColor.xyz += pow(1.-dot(p,light),4.)*glowColor;
  }
  float glowFactor = pow(dot(normalize(vec3(-uv, sqrt(1.- l))),light),4.)*smoothstep(0.1,1.,.2/(l-r*r));
  gl_FragColor += vec4(glowFactor*glowColor,glowFactor);
}