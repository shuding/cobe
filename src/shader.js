export const GLSLX_SOURCE_MAIN =
  "precision highp float;uniform vec2 s;uniform vec3 w,H,x;uniform vec4 y[64];uniform float z,A,k,B,C,D;uniform sampler2D E;float o=1./k;mat3 F(float a,float b){float c=cos(a),d=cos(b),e=sin(a),f=sin(b);return mat3(d,f*e,-f*c,0.,c,e,f,d*-e,d*c);}vec3 t(vec2 a){float b=sqrt(1.-a.y*a.y);return vec3(cos(a.x)*b,sin(a.x)*b,a.y);}vec3 u(vec3 a,out float v){a=a.xzy,a.z=-a.z;vec2 l=vec2(atan(a.y,a.x),a.z+o-1.);float m=max(2.,floor(log2(2.236068*k*3.141593*(1.-a.z*a.z))*.72021));vec2 d=floor(pow(1.618034,m)/2.236068*vec2(1.,1.618034)+.5),b=fract((d+1.)*.618034)*6.283185-3.883222,c=-2.*d*o;mat2 n=mat2(c.y,-c.x,-b.y,b.x);float h=3.141593;vec2 p=floor(n*l/(b.x*c.y-c.x*b.y)),i;for(float e=0.;e<4.;e+=1.){vec2 q=vec2(mod(e,2.),floor(e*.5));float f=dot(d,p+q);if(f>k)continue;vec2 j=vec2(6.283185*fract(f*.618034),(k-2.*f+1.)*o);float r=length(a-t(j));if(r<h)h=r,i=j;}v=h;vec3 g=t(i);g=g.xzy,g.y=-g.y;return g;}void main(){vec2 b=gl_FragCoord.xy/s*2.-1.;b.x*=s.x/s.y;vec3 f=normalize(vec3(0.,-.1,1.));float c=dot(b,b),a;vec3 d=normalize(vec3(b,sqrt(.64-c)));if(c<=.64){vec3 g=d*F(A,z),h=u(g,a);float l=asin(h.y),i=acos(-h.x/cos(l));i=h.z<0.?-i:i;float I=texture2D(E,vec2(i*.5/3.141593,-(l/3.141593+.5))).x,J=smoothstep(0.,a,.0016),p=pow(dot(d,f),D)*C,q=dot(d,vec3(0.,0.,1.));gl_FragColor=vec4(vec3(pow(I*J*q,1.5)*p+.2)*w,1.);int K=int(B);float r=0.;for(int j=0;j<64;j++){if(j>=K)break;vec4 m=y[j];vec3 n=m.xyz,v=n-g;float e=m.w;if(dot(v,v)>e*e*4.)continue;vec3 L=u(n,a);a=length(L-g);if(a<e){if(a+a<e)gl_FragColor.xyz=.2*w;r+=smoothstep(e*.5,0.,a)+(1.-exp(-2.*(e-a)));}}gl_FragColor.xyz+=min(1.,r*q*p)*H+pow(1.-dot(d,f),4.)*x;}float G=pow(dot(normalize(vec3(-b,sqrt(1.-c))),f)*1.3,4.)*smoothstep(.1,1.,.2/(c-.64));gl_FragColor+=vec4(G*x,G);}";

export const GLSLX_NAME_DOTS = "k";
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
