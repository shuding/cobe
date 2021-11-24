export const GLSLX_SOURCE_MAIN =
  "precision highp float;uniform vec2 t;uniform vec3 K,L,w;uniform vec4 x[64];uniform float y,z,k,A,B,C,D;uniform sampler2D E;float r=1./k;mat3 F(float a,float b){float c=cos(a),d=cos(b),e=sin(a),f=sin(b);return mat3(d,f*e,-f*c,0.,c,e,f,d*-e,d*c);}vec3 u(vec2 a){float b=sqrt(1.-a.y*a.y);return vec3(cos(a.x)*b,sin(a.x)*b,a.y);}vec3 v(vec3 a,out float s){a=a.xzy,a.z=-a.z;vec2 l=vec2(atan(a.y,a.x),a.z+r-1.);float m=max(2.,floor(log2(2.236068*k*3.141593*(1.-a.z*a.z))*.72021));vec2 d=floor(pow(1.618034,m)/2.236068*vec2(1.,1.618034)+.5),b=fract((d+1.)*.618034)*6.283185-3.883222,c=-2.*d*r;mat2 n=mat2(c.y,-c.x,-b.y,b.x);float h=3.141593;vec2 o=floor(n*l/(b.x*c.y-c.x*b.y)),i;for(float e=0.;e<4.;e+=1.){vec2 p=vec2(mod(e,2.),floor(e*.5));float f=dot(d,o+p);if(f>k)continue;vec2 j=vec2(6.283185*fract(f*.618034),(k-2.*f+1.)*r);float q=length(a-u(j));if(q<h)h=q,i=j;}s=h;vec3 g=u(i);g=g.xzy,g.y=-g.y;return g;}void main(){vec2 a=gl_FragCoord.xy/t*2.-1.;a.x*=t.x/t.y;float c=dot(a,a),b;vec3 d=vec3(0.,0.,1.),e=normalize(vec3(a,sqrt(.64-c)));if(c<=.64){vec3 f=e*F(z,y),g=v(f,b);float j=asin(g.y),h=acos(-g.x/cos(j));h=g.z<0.?-h:h;float G=texture2D(E,vec2(h*.5/3.141593,-(j/3.141593+.5))).x,H=smoothstep(8e-3,0.,b),l=dot(e,d),s=pow(l,C)*B,m=G*H*s,M=mix((1.-m)*pow(l,.4),m,D)+.1;gl_FragColor=vec4(K*M,1.);int N=int(A);float n=0.;for(int i=0;i<64;i++){if(i>=N)break;vec4 o=x[i];vec3 p=o.xyz,I=p-f;float q=o.w;if(dot(I,I)>q*q*4.)continue;vec3 O=v(p,b);b=length(O-f),b<q?n+=smoothstep(q*.5,0.,b):0.;}n=min(1.,n*s),gl_FragColor.xyz=mix(gl_FragColor.xyz,L,n),gl_FragColor.xyz+=pow(1.-dot(e,d),4.)*w;}float J=pow(dot(normalize(vec3(-a,sqrt(1.-c))),d),4.)*smoothstep(.1,1.,.2/(c-.64));gl_FragColor+=vec4(J*w,J);}";

export const GLSLX_NAME_DOTS = "k";
export const GLSLX_NAME_U_RESOLUTION = "t";
export const GLSLX_NAME_GLOW_COLOR = "w";
export const GLSLX_NAME_MARKERS = "x";
export const GLSLX_NAME_PHI = "y";
export const GLSLX_NAME_THETA = "z";
export const GLSLX_NAME_MARKERS_NUM = "A";
export const GLSLX_NAME_DOTS_BRIGHTNESS = "B";
export const GLSLX_NAME_DIFFUSE = "C";
export const GLSLX_NAME_DARK = "D";
export const GLSLX_NAME_U_TEXTURE = "E";
export const GLSLX_NAME_BASE_COLOR = "K";
export const GLSLX_NAME_MARKER_COLOR = "L";
