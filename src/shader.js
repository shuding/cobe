export const GLSLX_SOURCE_MAIN =
  "precision mediump float;uniform vec2 s;uniform vec3 w,H,x;uniform vec4 y[64];uniform float z,A,o,B,C,D;uniform sampler2D E;float n=1./o;mat3 F(float a,float b){float c=cos(a),d=cos(b),e=sin(a),f=sin(b);return mat3(d,f*e,-f*c,0.,c,e,f,d*-e,d*c);}vec3 t(vec2 a){float b=sqrt(1.-a.y*a.y);return vec3(cos(a.x)*b,sin(a.x)*b,a.y);}vec3 u(vec3 a,out float v){a=a.xzy,a.z=-a.z;vec2 d=vec2(atan(a.y,a.x),a.z);float l=max(2.,floor(log2(2.236068*o*3.141593*(1.-d.y*d.y))/1.388484));vec2 e=floor(pow(1.618034,l)/2.236068*vec2(1.,1.618034)+.5),b=fract((e+1.)*.618034)*6.283185-3.883222,c=-2.*n*e;mat2 m=mat2(c.y,-c.x,-b.y,b.x)/(b.x*c.y-c.x*b.y);float i=3.141593;vec2 p=floor(m*(d-vec2(0.,1.-n))),j;for(float f=0.;f<4.;f+=1.){vec2 q=vec2(mod(f,2.),floor(f/2.));float g=dot(e,p+q);if(g>o)continue;vec2 k=vec2(6.283185*fract(g*.618034),1.-(2.*g+1.)*n);float r=length(a-t(k));if(r<i)i=r,j=k;}v=i;vec3 h=t(j);h=h.xzy,h.y=-h.y;return h;}void main(){vec2 b=gl_FragCoord.xy/s*2.-1.;b.x*=s.x/s.y;vec3 f=normalize(vec3(0.,-.1,1.));float c=dot(b,b),a;vec3 d=normalize(vec3(b,sqrt(.64-c)));if(c<=.64){vec3 g=d*F(A,z),h=u(g,a);float k=asin(h.y),i=acos(-h.x/cos(k));i=h.z<0.?-i:i;float I=texture2D(E,vec2(i*.5/3.141593,-(k/3.141593+.5))).x,J=smoothstep(0.,a,.0016),p=pow(dot(d,f),D)*C,q=dot(d,vec3(0.,0.,1.));gl_FragColor=vec4(vec3(pow(I*J*q,1.5)*p+.2)*w,1.);int K=int(B);float r=0.;for(int j=0;j<64;j++){if(j>=K)break;vec4 l=y[j];vec3 m=l.xyz,v=m-g;float e=l.w;if(dot(v,v)>e*e*4.)continue;vec3 L=u(m,a);a=length(L-g);if(a<e){if(a+a<e)gl_FragColor.xyz=.2*w;r+=smoothstep(e*.5,0.,a)+(1.-exp(-2.*(e-a)));}}gl_FragColor.xyz+=min(1.,r*q*p)*H+pow(1.-dot(d,f),4.)*x;}float G=pow(dot(normalize(vec3(-b,sqrt(1.-c))),f)*1.3,4.)*smoothstep(.1,1.,.2/(c-.64));gl_FragColor+=vec4(G*x,G);}";

export const GLSLX_NAME_DOTS = "o";
export const GLSLX_NAME_U_RESOLUTION = "s";
export const GLSLX_NAME_BASE_COLOR = "w";
export const GLSLX_NAME_GLOW_COLOR = "x";
export const GLSLX_NAME_MARKERS = "y";
export const GLSLX_NAME_PHI = "z";
export const GLSLX_NAME_THETA = "A";
export const GLSLX_NAME_MARKERS_NUM = "B";
export const GLSLX_NAME_DOTS_BRIGHTNESS = "C";
export const GLSLX_NAME_DIFFUSE = "D";
export const GLSLX_NAME_U_TEXTURE = "E";
export const GLSLX_NAME_MARKER_COLOR = "H";
