"""Recover the attached cut's art and camera path. Coordinates are in 360x640 layout units."""
from pathlib import Path
import cv2 as cv, numpy as np, json
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parent
assets=root/'assets'
assets.mkdir(exist_ok=True)
cap=cv.VideoCapture(str(root.parent/'references/One-Last-Pack-Vertical-Zoom.mp4'))
def frame(n):
    cap.set(cv.CAP_PROP_POS_FRAMES,n)
    ok,f=cap.read()
    assert ok
    return cv.cvtColor(f,cv.COLOR_BGR2RGB)
def save(name,im): Image.fromarray(im).save(assets/(name+'.png'))
def quad(f,points,w=424,h=600):
    src=np.float32(points)*3
    dst=np.float32([(0,0),(w-1,0),(w-1,h-1),(0,h-1)])
    return cv.warpPerspective(f,cv.getPerspectiveTransform(src,dst),(w,h),flags=cv.INTER_CUBIC)
def crop(f,rect):
    x,y,r,b=np.int32(rect)*3
    return f[y:b,x:r].copy()
mat=frame(330); pack=frame(93); page=frame(453); final=frame(598); reveal=frame(429)
shop=frame(80)
# Isolate the paint tooth from the original plaster and paper.
pigment=crop(pack,(12,34,101,112))
grain=cv.cvtColor(pigment,cv.COLOR_RGB2GRAY).astype('float32')
grain-=cv.GaussianBlur(grain,(0,0),8)
save('pigment',np.uint8(np.clip(128+grain*2.5,0,255)))
rng=np.random.default_rng(703)
def paint(im,seed):
    h,w=im.shape[:2]; g=np.random.default_rng(seed)
    tile=np.tile(grain,(h//grain.shape[0]+1,w//grain.shape[1]+1))[:h,:w]
    broad=cv.resize(g.normal(0,1,(12,9)).astype('f'),(w,h),interpolation=cv.INTER_CUBIC)
    fine=cv.resize(g.normal(0,1,(h//4,w//2)).astype('f'),(w,h),interpolation=cv.INTER_CUBIC)
    rgb=im.astype('f'); lum=rgb.mean(2); dark=np.clip((90-lum)/65,0,1)
    rgb+=dark[:,:,None]*np.array([12,1,9])
    rgb=rgb*.94+np.array([244,174,140])*.06
    rgb+=(.74*tile+3.5*broad+1.2*fine)[:,:,None]
    # Directional pigment pooling and peach rim on individual printed colour shapes.
    soft=cv.GaussianBlur(lum,(0,0),4)
    relief=np.clip((np.roll(soft,4,axis=0)-soft)*.21,-8,10)
    rgb+=relief[:,:,None]
    # Pool translucent purple and peach pigment at the edges of each printed
    # colour island. Preserve the linework and typography in the source image.
    hsv=cv.cvtColor(im,cv.COLOR_RGB2HSV)
    yy,xx=np.mgrid[0:h,0:w]
    for lo,hi in [(0,17),(18,38),(39,85),(86,115),(116,155)]:
        region=((hsv[:,:,0]>=lo)&(hsv[:,:,0]<=hi)&(hsv[:,:,1]>40)&(lum>80)).astype(np.uint8)
        distance=cv.distanceTransform(region,cv.DIST_L2,5)
        shadow=np.minimum(1,distance/4)*np.exp(-distance/17)*(0.5+0.5*yy/h)
        rgb+=shadow[:,:,None]*np.array([-22,-24,-10])
        rim=np.clip((np.roll(distance,-5,axis=1)+np.roll(distance,-6,axis=0)-2*distance)/9,0,1)*np.minimum(1,distance/3)
        rgb+=rim[:,:,None]*np.array([19,14,5])
    # Small broken brush marks stay in the original pond and mountains.
    if seed==73:
        brush=rgb.copy()
        for _ in range(540):
            x=int(g.integers(15,w-14)); y=int(g.integers(int(h*.22),h-45))
            if not (42<hsv[y,x,0]<114 and hsv[y,x,1]>28 and lum[y,x]>91):continue
            col=np.clip(rgb[y,x]+g.choice([-1,1])*np.array([20,16,12]),0,255)
            cv.line(brush,(x,y),(x+int(g.integers(2,13)),y-int(g.integers(0,3))),tuple(map(float,col)),int(g.integers(1,4)),cv.LINE_AA)
        rgb=rgb*.40+brush*.60
    return np.uint8(np.clip(rgb,0,255))
# Same original Psyduck, flattened from the unobscured left copy during the zoom.
psy=quad(final,[(39.8,235.8),(158.8,231.6),(164.8,399.2),(46.3,403.5)])
cat=quad(final,[(202,35),(321,31),(327,201),(208,205)])
# The hero shot supplies the ink and flat colours without pocket plastic. Restore its
# finger-covered outer margin from the corresponding unobstructed binder copy.
hero=quad(reveal,[(179.5,217.7),(309.8,214.1),(315.8,399.6),(185.1,403.4)])
wgt=np.clip((np.arange(424)-377)/18,0,1)[None,:,None]
psy=np.uint8(hero*(1-wgt)+psy*wgt)
cards=[('voltorb',(47,178),(109,176)),('oddish',(136,175),(197,173)),('diglett',(224,172),(286,170)),('magnemite',(50,280),(112,278)),('ditto',(139,277),(201,275)),('gastly',(54,383),(116,381))]
for i,(name,a,b) in enumerate(cards):
    x,y=a;u,v=b
    raw=quad(page,[a,b,(u+3,v+89),(x+3,y+89)])
    save(name,paint(raw,60+i))
save('caterpie',paint(cat,72));save('psyduck',paint(psy,73))
# Clean counter from complementary source regions, patching the small overlaps with nearby felt.
clean=pack.copy()
mask=np.zeros(clean.shape[:2],np.uint8)
cv.fillPoly(mask,[np.int32([(0,450),(90,384),(91,242),(228,241),(231,278),(318,336),(359,482),(359,535),(308,346),(231,292),(233,449),(87,446),(88,407),(0,471)])*3],255)
mask=cv.dilate(mask,np.ones((15,15),np.uint8))
alternative=np.zeros_like(mask)
cv.fillPoly(alternative,[np.int32([(171,208),(319,206),(322,258),(359,286),(359,308),(321,278),(323,409),(174,411),(170,365),(112,414),(40,639),(27,639),(101,405),(175,351)])*3],255)
clean[mask>0]=mat[mask>0]
bad=cv.bitwise_and(mask,alternative)
if np.any(bad):
    # Copy nearby felt vertically with soft edges to retain the photographed brushwork.
    patchmask=cv.dilate(bad,np.ones((33,33),np.uint8))
    small=cv.resize(clean,(360,640),interpolation=cv.INTER_AREA)
    tiny=cv.resize(patchmask,(360,640),interpolation=cv.INTER_AREA)
    smooth=cv.resize(cv.inpaint(small,tiny,9,cv.INPAINT_TELEA),(1080,1920),interpolation=cv.INTER_CUBIC)
    tile=np.tile(grain,(1920//grain.shape[0]+1,1080//grain.shape[1]+1))[:1920,:1080]
    replacement=np.clip(smooth.astype(float)+tile[:,:,None],0,255)
    alpha=cv.GaussianBlur(patchmask,(0,0),3)[:,:,None]/255
    clean=np.uint8(clean*(1-alpha)+replacement*alpha)
save('counter',clean)
wrapper=quad(pack,[(100,251),(223,255),(225,439),(95,437)])
wm=np.zeros(wrapper.shape[:2],np.uint8)
for x,y,rx,ry in [(362,51,42,43),(37,448,43,45)]:
    cv.ellipse(wm,(x,y),(rx,ry),0,0,360,255,-1)
save('wrapper',paint(cv.inpaint(wrapper,wm,8,cv.INPAINT_TELEA),99))
# Preserve the original binder cover, paper and pocket geometry.
rgba=np.dstack([page,np.zeros(page.shape[:2],np.uint8)])
alpha=np.zeros(page.shape[:2],np.uint8)
cv.fillPoly(alpha,[np.int32([(0,151),(338,140),(352,494),(0,506)])*3],255,lineType=cv.LINE_AA)
rgba[:,:,3]=alpha
save('binder',rgba[410:1525,:])
# Track the printed page only. The painted counter does not move during the final zoom.
getgray=lambda f: cv.cvtColor(cv.resize(f,(540,960)),cv.COLOR_RGB2GRAY)
ref=getgray(page); trackmask=np.zeros_like(ref);trackmask[258:713,37:455]=255
pts=cv.goodFeaturesToTrack(ref,230,.015,5,mask=trackmask)
prev=ref;current=pts.copy(); initial=pts.copy(); trans=[]
cap.set(cv.CAP_PROP_POS_FRAMES,450)
for n in range(450,600):
    ret,f=cap.read(); assert ret
    cur=cv.cvtColor(cv.resize(f,(540,960)),cv.COLOR_BGR2GRAY)
    nextpts,ok,_=cv.calcOpticalFlowPyrLK(prev,cur,current,None)
    valid=ok.ravel().astype(bool)
    valid&=(nextpts[:,0,0]>3)&(nextpts[:,0,0]<537)&(nextpts[:,0,1]>5)&(nextpts[:,0,1]<950)
    initial=initial[valid];current=nextpts[valid]
    m,_=cv.estimateAffinePartial2D(initial,current,method=cv.RANSAC,ransacReprojThreshold=1.5)
    assert m is not None
    m[:,2]/=1.5
    trans.append(m.round(6).tolist());prev=cur
(assets/'binder-camera.json').write_text(json.dumps(trans))
print('Final binder camera', trans[-1])
