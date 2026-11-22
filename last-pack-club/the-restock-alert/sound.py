"""Deterministic mono Foley at 48 kHz; timings use seconds from picture start."""
import wave
from pathlib import Path
import numpy as np
rate=48000
mix=np.zeros(18*rate)
rng=np.random.default_rng(41)
def add(start,sample):
    i=round(start*rate)
    mix[i:i+len(sample)]+=sample
def time(d): return np.arange(round(d*rate))/rate
def rub(at,d,vol):
    t=time(d); n=rng.normal(size=len(t)); n=np.diff(n,prepend=0)
    add(at,vol*n*np.sin(np.pi*t/d)**2*(.65+.35*np.cos(115*t)))
for at in [.12,.63,1.17,17.59]: rub(at,.21,.025)
t=time(.49)
ping=(.16*np.sin(2*np.pi*1046.5*t)*np.exp(-11*t)+.17*np.sin(2*np.pi*1568*t)*np.exp(-8*t))*np.minimum(1,t/.007)
for at in [1.5,9.8]: add(at,ping)
for at in [4.30,14.05,14.25,14.45]:
    t=time(.065);add(at,.19*np.exp(-66*t)*np.sin(2*np.pi*(680*t-2300*t*t))+.055*rng.normal(size=len(t))*np.exp(-120*t))
t=time(.30);add(15.30,.105*np.sin(2*np.pi*(660*t-840*t*t)+.4*np.sin(120*t))*np.sin(np.pi*t/.3)**2)
t=time(.12);add(17.30,.23*np.sin(2*np.pi*115*t)*np.exp(-43*t)+.07*rng.normal(size=len(t))*np.exp(-100*t))
with wave.open(str(Path(__file__).parent/'assets/effects.wav'),'wb') as w:
    w.setparams((1,2,rate,0,'NONE','NONE'));w.writeframes((mix*32767).astype('<i2').tobytes())
