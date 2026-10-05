import os
import cv2
import numpy as np
from PIL import Image, ImageDraw

def clean_frame_bottom(pil_img):
    """
    Remove non-Shopier external website URLs at the bottom of the frame
    by filling with smooth dark gradient background.
    """
    w, h = pil_img.size
    draw = ImageDraw.Draw(pil_img)
    bottom_crop_y = int(h * 0.94)
    bg_color = pil_img.getpixel((10, bottom_crop_y - 20))
    draw.rectangle([0, bottom_crop_y, w, h], fill=bg_color)
    return pil_img

def render_reels_video(frame_paths, output_path):
    target_width = 1080
    target_height = 1920
    fps = 30
    hold_seconds = 3.5
    transition_seconds = 0.8

    hold_frames = int(fps * hold_seconds)
    transition_frames = int(fps * transition_seconds)

    images = []
    for p in frame_paths:
        img = Image.open(p).convert("RGB")
        img = clean_frame_bottom(img)
        img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        images.append(np.array(img))

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (target_width, target_height))

    num_images = len(images)
    for i in range(num_images):
        current_img = images[i]
        next_img = images[(i + 1) % num_images] if i < num_images - 1 else None
        
        for _ in range(hold_frames):
            bgr = cv2.cvtColor(current_img, cv2.COLOR_RGB2BGR)
            out.write(bgr)
            
        if next_img is not None:
            for t in range(transition_frames):
                alpha = t / float(transition_frames)
                blended = cv2.addWeighted(current_img, 1.0 - alpha, next_img, alpha, 0)
                bgr = cv2.cvtColor(blended, cv2.COLOR_RGB2BGR)
                out.write(bgr)

    out.release()
    print(f"Rendered: {output_path}")

# Render Disiplin Video
disiplin_frames = [
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\disiplin_frame_1_1791121274137.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\disiplin_frame_2_1791121301962.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\disiplin_frame_3_1791121329811.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\reels_frame_4_1791119537789.jpg"
]
disiplin_out = r"C:\Users\Alien\Downloads\aideneme\MEB_Disiplin_Tanitim_Reels.mp4"
render_reels_video(disiplin_frames, disiplin_out)

# Render Sorumluluk Video
sorumluluk_frames = [
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\reels_frame_1_1791119415968.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\reels_frame_2_1791119459242.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\reels_frame_3_1791119498001.jpg",
    r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac\reels_frame_4_1791119537789.jpg"
]
sorumluluk_out = r"C:\Users\Alien\Downloads\aideneme\MEB_Sorumluluk_Tanitim_Reels.mp4"
render_reels_video(sorumluluk_frames, sorumluluk_out)
