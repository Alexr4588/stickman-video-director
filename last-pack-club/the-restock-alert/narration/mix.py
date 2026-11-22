from pathlib import Path
import subprocess
import tempfile
import wave
import os
import numpy as np

base = Path(__file__).resolve().parent
os.chdir(base)
rate = 48000
# Start, latest finish, visible phrase, pronunciation, pitch ratio, speaking tempo.
cues = [
    (.10, 1.89, "I WASN’T EVEN BUYING", "I wasn't even buying", 1.035, 1.00),
    (1.90, 3.99, "POKÉMON CARDS TODAY.", "Poh kay mon cards today.", 1.02, .98),
    (4.48, 6.40, "BUT A RESTOCK ALERT?", "But a re-stock alert?", 1.045, .98),
    (6.68, 8.73, "BE RUDE NOT TO.", "Be rude not to.", 1.015, .97),
    (9.03, 9.79, "GONE.", "Gone.", .97, .92),
    (10.35, 11.68, "LOVELY.", "Lovely.", .945, .94),
    (12.02, 12.67, "OH.", "Oh.", .98, 1.0),
    (12.76, 13.95, "ANOTHER ONE.", "Another one.", .98, .97),
    (14.35, 15.28, "AND…", "And.", .96, .90),
    (15.47, 16.38, "GONE.", "Gone.", .935, .88),
]
voice = np.zeros(rate*18)
duck = np.ones_like(voice)
def stamp(t):
    v=round(100*t)
    return f'0:00:{v//100:02d}.{v%100:02d}'
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Club,Archivo Black,58,&H00FFFFFF,&H00FFFFFF,&H002C2238,&H00000000,0,0,0,0,100,100,0,0,1,8,0,2,64,64,235,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
with tempfile.TemporaryDirectory() as tmp:
    phrase=Path(tmp)/'speech.txt'
    for start,limit,caption,spoken,pitch,tempo in cues:
        phrase.write_text(spoken)
        raw=subprocess.check_output(['ffmpeg','-v','error','-f','lavfi','-i',f'flite=textfile={phrase}:voice=awb','-af',f'asetrate={round(16000*pitch)},aresample=48000,atempo={tempo/pitch}','-ac','1','-f','f32le','-'])
        a=np.frombuffer(raw,'<f4').astype(float)
        nz=np.flatnonzero(abs(a)>.0018)
        a=a[max(0,nz[0]-480):min(len(a),nz[-1]+960)]
        if len(a)>round((limit-start)*rate):
            raise RuntimeError(f'Phrase overruns its cue: {caption} {len(a)/rate:.2f}')
        a*=min(.82/max(abs(a)),.105/np.sqrt(np.mean(a*a)))
        i=round(start*rate); j=i+len(a)
        voice[i:j]=a
        duck[i:j]=.40
        ramp=round(.045*rate)
        duck[i-ramp:i]=np.linspace(1,.4,ramp)
        duck[j:j+ramp]=np.linspace(.4,1,ramp)
        end=min(limit,j/rate+.10)
        ass+=f'Dialogue: 0,{stamp(start)},{stamp(end)},Club,,0,0,0,,{caption}\n'
        print(caption,round(start,2),round(j/rate,2))
Path('subtitles.ass').write_text(ass)
with wave.open('../assets/effects.wav') as w:
    effects=np.frombuffer(w.readframes(w.getnframes()),'<i2')/32768
assert not voice[round(16.5*rate):].any()
mix=voice+effects*duck
assert max(abs(mix))<1
with wave.open('mix.wav','wb') as w:
    w.setparams((1,2,rate,0,'NONE','NONE'))
    w.writeframes(np.round(mix*32768).astype('<i2').tobytes())
