import os
import shutil
import cv2

base_dir = r"C:\Users\Alien\Downloads\aideneme\Video_ve_Sosyal_Medya_Gorselleri"
brain_dir = r"C:\Users\Alien\.gemini\antigravity-ide\brain\13b2d7fb-860d-4c9b-b23b-b049863ba4ac"

folders = {
    "01_Sorumluluk_Sinavlari_Reels_Kareleri": [
        ("reels_frame_1_1791119415968.jpg", "01_sorumluluk_frame1.jpg"),
        ("reels_frame_2_1791119459242.jpg", "02_sorumluluk_frame2.jpg"),
        ("reels_frame_3_1791119498001.jpg", "03_sorumluluk_frame3.jpg"),
        ("reels_frame_4_1791119537789.jpg", "04_sorumluluk_frame4.jpg"),
        ("sorumluluk_reels_cover_1791116497758.jpg", "00_sorumluluk_reels_kapak.jpg"),
    ],
    "02_Disiplin_Asistani_Reels_Kareleri": [
        ("disiplin_frame_1_1791121274137.jpg", "01_disiplin_frame1.jpg"),
        ("disiplin_frame_2_1791121301962.jpg", "02_disiplin_frame2.jpg"),
        ("disiplin_frame_3_1791121329811.jpg", "03_disiplin_frame3.jpg"),
        ("disiplin_reels_cover_1791116537310.jpg", "00_disiplin_reels_kapak.jpg"),
    ],
    "03_Profil_ve_Sosyal_Medya_Gorselleri": [
        ("instagram_profile_logo_meb_1791121053868.jpg", "meb_turk_bayrakli_logo.jpg"),
        ("instagram_profile_logo_saas_1791121081558.jpg", "modern_saas_teknoloji_logo.jpg"),
        ("instagram_feed_post_meb_1791116371701.jpg", "meb_1x1_post_gorseli.jpg"),
        ("instagram_reels_cover_meb_1791116346643.jpg", "meb_genel_reels_kapak.jpg"),
    ]
}

os.makedirs(base_dir, exist_ok=True)

copied_count = 0
for folder, files in folders.items():
    target_folder = os.path.join(base_dir, folder)
    os.makedirs(target_folder, exist_ok=True)
    
    for src_name, dst_name in files:
        src_path = os.path.join(brain_dir, src_name)
        dst_path = os.path.join(target_folder, dst_name)
        
        if os.path.exists(src_path):
            img = cv2.imread(src_path)
            if img is not None:
                # Mask out any non-shopier bottom text area (bottom 6.5%)
                h, w, c = img.shape
                cv2.rectangle(img, (0, int(h * 0.935)), (w, h), (15, 15, 15), -1)
                cv2.imwrite(dst_path, img)
            else:
                shutil.copy2(src_path, dst_path)
            print(f"Kopyalandi: {folder}/{dst_name}")
            copied_count += 1
        else:
            print(f"Bulunamadi: {src_name}")

print(f"\nToplam {copied_count} adet resim '{base_dir}' klasorune basariyla eklendi.")
