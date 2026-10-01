"""Rebuild the silent, captioned home tour from the site's existing demo clips.

Requires ffmpeg and DejaVu Sans. Run from any directory.
"""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[2]
font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
scenes = [
    ('smart-lights.mp4.mp4', 'Lighting, made easy', 'SET THE MOOD FROM YOUR PHONE'),
    ('remote-ac-smart-home.mp4.mp4', 'Come home to comfort', 'CONTROL YOUR AIR CONDITIONING'),
    ('garage-control.mp4.mp4', 'A simpler welcome home', 'OPEN THE GARAGE FROM YOUR PHONE'),
    ('good-night-smart-home.mp4.mp4', 'One tap. Good night.', 'BRING YOUR EVENING ROUTINE TOGETHER'),
]
command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
for file, _, _ in scenes:
    command += ['-i', str(root / file)]
filters = []
for i, (_, title, caption) in enumerate(scenes):
    filters.append(
        f'[{i}:v]trim=duration=8,setpts=PTS-STARTPTS,scale=960:540,fps=24,setsar=1,'
        f'drawbox=x=0:y=438:w=iw:h=102:color=0x142a22@0.92:t=fill,'
        f"drawtext=fontfile={font}:text='{title}':fontsize=27:fontcolor=0xf5f4ed:x=30:y=458,"
        f"drawtext=fontfile={font}:text='{caption}':fontsize=12:fontcolor=0xc6d7b7:x=32:y=503[v{i}]"
    )
filters.append(''.join(f'[v{i}]' for i in range(len(scenes))) + 'concat=n=4:v=1:a=0[out]')
command += ['-filter_complex', ';'.join(filters), '-map', '[out]', '-an', '-c:v', 'libx264',
            '-preset', 'medium', '-crf', '29', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
            str(root / 'redesign/assets/home-tour.mp4')]
subprocess.run(command, check=True)
