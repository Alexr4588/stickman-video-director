"""Isolate Chase's existing head and give the animator a clean facial-expression layer."""
from pathlib import Path
import cv2
import numpy as np
base = Path(__file__).resolve().parent
source = cv2.imread(str(base.parent / 'references/frames/chase-standing.png'))
mask = np.zeros(source.shape[:2], np.uint8)
for x,y,w,h in [(80,130,52,15),(138,112,39,20),(79,146,54,17),(140,140,42,18),(116,174,36,17)]:
    area=source[y*4:(y+h)*4,x*4:(x+w)*4]
    ink=(area.max(axis=2)<166).astype(np.uint8)*255
    mask[y*4:(y+h)*4,x*4:(x+w)*4]=cv2.dilate(ink,np.ones((9,9),np.uint8))
cv2.imwrite(str(base/'assets/chase-expression-base.png'),cv2.inpaint(source,mask,6,cv2.INPAINT_TELEA)[210:880,144:880])
