// Small CPU painter for the same genuine 3D mesh when WebGL is unavailable.
// It preserves projection, depth sorting and rotation. It is not a flat-image zoom.
// Full WebGL remains the primary renderer; this path prioritizes compatibility.
import * as T from './vendor/three.module.js';
export class SoftwareRenderer {
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');if(!this.ctx)throw Error('Canvas unavailable');this.ratio=1;this.w=1;this.h=1;this.isSoftware=true;this.cache=new WeakMap();}
 setPixelRatio(r){this.ratio=Math.min(r,1.25);}
 setClearColor(){}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=Math.ceil(w*this.ratio);this.domElement.height=Math.ceil(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 render(scene,camera){const ctx=this.ctx,w=this.domElement.width,h=this.domElement.height;ctx.clearRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),tris=[],lines=[];const mvp=new T.Matrix4(),nm=new T.Matrix3(),norm=new T.Vector3(),wp=new T.Vector3();
  scene.traverseVisible(o=>{if(!o.isMesh&&!o.isLine)return;const g=o.geometry,m=o.material;if(!g?.attributes.position||!m||Array.isArray(m)||m.opacity<=0)return;const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,idx=g.index;const color=m.color||new T.Color(0xffffff);mvp.multiplyMatrices(vp,o.matrixWorld);const a=mvp.elements;nm.getNormalMatrix(o.matrixWorld);const projected=new Float32Array(p.count*4);const shade=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=a[3]*x+a[7]*y+a[11]*z+a[15];projected[i*4]=(a[0]*x+a[4]*y+a[8]*z+a[12])/d*w*.5+w*.5;projected[i*4+1]=-(a[1]*x+a[5]*y+a[9]*z+a[13])/d*h*.5+h*.5;projected[i*4+2]=(a[2]*x+a[6]*y+a[10]*z+a[14])/d;projected[i*4+3]=d;
   if(n){norm.set(n.getX(i),n.getY(i),n.getZ(i)).applyNormalMatrix(nm);shade[i]=.65+.35*Math.max(0,norm.dot(new T.Vector3(-.45,.65,.62)));}else shade[i]=1;}
  if(o.isLine){const pts=[];for(let i=0;i<p.count;i++)pts.push([projected[i*4],projected[i*4+1],projected[i*4+2]]);lines.push({pts,color:'#'+color.getHexString(),opacity:m.opacity||1});return;}
  const count=idx?idx.count:p.count;for(let i=0;i<count;i+=3){const i0=idx?idx.getX(i):i,i1=idx?idx.getX(i+1):i+1,i2=idx?idx.getX(i+2):i+2;const b0=i0*4,b1=i1*4,b2=i2*4;if(projected[b0+3]<0||projected[b1+3]<0||projected[b2+3]<0)continue;const x0=projected[b0],y0=projected[b0+1],x1=projected[b1],y1=projected[b1+1],x2=projected[b2],y2=projected[b2+1];const area=(x1-x0)*(y2-y0)-(y1-y0)*(x2-x0);if(m.side!==T.DoubleSide&&area>=0)continue;if(Math.abs(area)<.018)continue;
   const f=(shade[i0]+shade[i1]+shade[i2])/3;let r=color.r,gg=color.g,b=color.b;if(c&&m.vertexColors){r*=(c.getX(i0)+c.getX(i1)+c.getX(i2))/3;gg*=(c.getY(i0)+c.getY(i1)+c.getY(i2))/3;b*=(c.getZ(i0)+c.getZ(i1)+c.getZ(i2))/3;}const rgb=[r,gg,b].map(v=>Math.round(Math.min(255,255*Math.pow(Math.max(0,v*f),1/2.2))));tris.push({p:[x0,y0,x1,y1,x2,y2],z:(projected[b0+2]+projected[b1+2]+projected[b2+2])/3,color:`rgb(${rgb.join(',')})`,opacity:m.opacity??1});}
 });tris.sort((a,b)=>b.z-a.z);for(const t of tris){ctx.globalAlpha=t.opacity;ctx.fillStyle=t.color;ctx.beginPath();ctx.moveTo(t.p[0],t.p[1]);ctx.lineTo(t.p[2],t.p[3]);ctx.lineTo(t.p[4],t.p[5]);ctx.closePath();ctx.fill();if(t.opacity>.98){ctx.strokeStyle=t.color;ctx.lineWidth=.45;ctx.stroke();}}ctx.globalAlpha=1;
  // Lines are cut-edge annotations and intentionally remain visible.
  for(const l of lines){ctx.globalAlpha=l.opacity;ctx.strokeStyle=l.color;ctx.lineWidth=.6*this.ratio;ctx.beginPath();l.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}ctx.globalAlpha=1;
 }
}
