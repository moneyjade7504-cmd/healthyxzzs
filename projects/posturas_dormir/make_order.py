#!/usr/bin/env python3
"""Generate numbered image order (1..40) for the nicturia video, in the 2D whiteboard master style."""
import json, pathlib
D = pathlib.Path(__file__).parent

STY = ("Clean 2D cartoon illustration, exactly matching the attached reference image: bold clean dark outlines, soft flat colours with gentle "
       "cel shading, warm expressive faces, simple rounded shapes, ")
SHEET = STY + "plain pure white background. "
SCENE = STY + "simple suggested background, single full-frame edge-to-edge 16:9 scene, NO border, NO frame, NO rounded corners. "
END = " Correct anatomy, five fingers per hand. No text, no letters, no numbers, no logos, high resolution."
ENDS = " No text, no labels, no letters, no numbers, no logos, 16:9, high resolution."
CAR = ("MARTA, Daniel's wife (same clean cartoon style as the attached reference: about 65 years old, short wavy grey hair, small round glasses, "
       "kind face, soft lilac cardigan over a white blouse, grey trousers, brown shoes)")
ANT = ("DANIEL (exactly the man in the attached reference: about 65 years old, short swept-back grey hair, black rectangular glasses, friendly face, "
       "teal button-up shirt with sleeves rolled up, brown belt, dark navy trousers, brown shoes, a wristwatch)")
ANTP = ("DANIEL (exactly the man in the attached reference: about 65 years old, short swept-back grey hair, black rectangular glasses, in light blue striped pyjamas)")
CARP = ("MARTA, Daniel's wife (same clean cartoon style: short wavy grey hair, small round glasses, in a lilac nightgown)")
DOC = "a friendly middle-aged male doctor with short brown hair, white coat, blue tie and a stethoscope, same flat cartoon style"
CLOCK = "a simple glowing bedside clock with plain hands and NO digits"

def poses(lst):
    body = "; ".join(f"{i+1}) {p}" for i, p in enumerate(lst))
    return (SHEET + f"Characters: {CAR} and {ANT}. Pose sheet: SIX separate full-body poses, same scale, two rows of three, widely "
            f"spaced, nothing touching, no floor, no background: {body}." + END.replace(" high resolution.", " 16:9, high resolution."))

def items(lst):
    body = "; ".join(f"{i+1}) {p}" for i, p in enumerate(lst))
    return (SHEET + f"Object sheet: TEN items drawn SEPARATELY, same scale, evenly spaced in two rows of five, nothing touching: {body}." + ENDS)

def scene(s): return SCENE + s + END

NURSE = "a friendly middle-aged female nurse in light blue scrubs"
CLOCK = "a simple bedside clock with plain hands and NO digits"
SURG = "a calm middle-aged female surgeon with dark hair in a bun, white coat over light green scrubs, same flat cartoon style"

BED = "a cozy bedroom at night, soft moonlight through the window, a bedside lamp"
PARTS = [
 ("PARTE 1 · Gancho + Número 5: brazos por encima de la cabeza", [
  ("P1", "6 tư thế (mặc đồ ngủ): Daniel nằm ngửa giơ hai tay qua đầu; Daniel ngồi mép giường vẩy hai bàn tay tê; Daniel chạm xương đòn; Daniel cầm điện thoại gõ bình luận; Marta vẫy chào; Marta suy nghĩ",
   (SHEET + f"Characters: {CARP} and {ANTP}. Pose sheet: SIX separate poses, same scale, two rows of three, widely spaced, nothing touching, no bed, no background: "
    "1) Daniel lying on his back seen from the side, both arms stretched up above his head, eyes closed; 2) Daniel sitting, shaking both hands as if they are numb and tingling; "
    "3) Daniel standing, touching his collarbone with one hand, slightly hunched upper back; 4) Daniel standing, typing on a smartphone with a smile; "
    "5) Marta standing, smiling and waving at the viewer; 6) Marta standing, hand on chin, thinking." + END.replace(" high resolution.", " 16:9, high resolution."))),
  ("O1", "10 đồ vật: gối; gối nêm; ly nước; đồng hồ đầu giường; não; tim; vai-xương đòn-xương sườn có mạch máu đi qua; cột sống cổ có động mạch; máy đo oxy kẹp ngón tay; sổ tay",
   items(["a soft white bed pillow", "a foam wedge pillow (triangular)", "a glass of water", CLOCK, "a friendly cartoon brain", "a friendly cartoon heart",
          "a simple side view of a shoulder showing the collarbone and first rib with a red artery and a yellow nerve passing between them", "a simple cartoon neck spine with two thin red arteries running up through the vertebrae",
          "a small fingertip pulse oximeter with a blank screen", "a small notebook with a pen"])),
  ("S1_1", "Buổi tối: Daniel lên giường, tắt đèn, bình yên",
   scene(f"{BED}: {ANTP} pulling back the covers and getting into bed, reaching to switch off the bedside lamp, calm and relaxed.")),
  ("S1_2", "Đêm khuya: hai ông bà ngủ say, ánh trăng",
   scene(f"{BED}, wide shot: {ANTP} and {CARP} sound asleep in a double bed, peaceful, a {CLOCK} on the nightstand.")),
  ("S1_3", "Daniel ngồi trên giường buổi sáng gõ bình luận trên điện thoại",
   scene(f"A bright bedroom in the morning: {ANTP} sitting on the edge of the bed, smiling and typing on his smartphone.")),
  ("S1_4", "Daniel ngủ ngửa, hai tay giơ qua đầu",
   scene(f"{BED}, view from slightly above: {ANTP} asleep on his back with both arms stretched up above his head on the pillow.")),
  ("S1_5", "Sáng ra Daniel ngồi mép giường vẩy hai bàn tay tê",
   scene(f"A bedroom in soft morning light: {ANTP} sitting on the edge of the bed, shaking his numb, tingling hands, slightly annoyed face.")),
  ("S1_6", "Daniel đứng trước gương chạm xương đòn, lưng hơi gù",
   scene(f"A bathroom in the morning: {ANTP} standing in front of a mirror, touching his collarbone, upper back slightly rounded, thoughtful.")),
  ("S1_7", "Bác sĩ đo huyết áp cho Daniel buổi sáng ở phòng khám",
   scene(f"A clinic office in the morning: {DOC} measuring the blood pressure of {ANT} with an upper-arm cuff, both calm.")),
  ("S1_8", "Hai ông bà ngồi bàn bếp xem video trên máy tính bảng",
   scene(f"A sunny kitchen table: {ANT} and {CAR} watching a tablet together with cups of tea, interested.")),
 ]),
 ("PARTE 2 · Número 4: boca abajo + Número 3: deshidratación", [
  ("P2", "6 tư thế: Daniel nằm sấp quay đầu sang bên; Daniel xoa cổ cứng; Marta ôm đầu đau; Marta chóng mặt khi đứng dậy; Daniel uống ly nước nhỏ; Marta đưa ly nước",
   (SHEET + f"Characters: {CARP} and {ANTP}. Pose sheet: SIX separate poses, same scale, two rows of three, widely spaced, nothing touching, no bed, no background: "
    "1) Daniel lying face down seen from the side, head turned fully to one side, eyes closed; 2) Daniel sitting, rubbing his stiff neck with one hand, grimacing; "
    "3) Marta sitting, holding her head with a headache; 4) Marta standing up slowly, a little dizzy, one hand out for balance; "
    "5) Daniel sitting, drinking a small glass of water; 6) Marta standing, offering a glass of water with a smile." + END.replace(" high resolution.", " 16:9, high resolution."))),
  ("O2", "10 đồ vật: bình nước; ly nước nhỏ; giọt máu; tế bào hồng cầu; cục máu đông; mạch máu nhỏ trong não; mặt trời mọc; nhà vệ sinh; phổi; giọt mồ hôi",
   items(["a water jug", "a small glass of water", "a red blood drop", "a small cluster of round red blood cells", "a small dark red blood clot", "a thin red branching blood vessel",
          "a rising sun", "a white toilet", "a pair of cartoon lungs", "a single clear sweat drop"])),
  ("S2_1", "Daniel ngủ sấp, đầu quay hẳn sang một bên",
   scene(f"{BED}: {ANTP} asleep face down, his head turned fully to one side on the pillow, one arm under the pillow.")),
  ("S2_2", "Sáng: Daniel ngồi dậy xoa cổ cứng",
   scene(f"A bedroom in the morning: {ANTP} sitting up in bed, rubbing his stiff neck, grimacing.")),
  ("S2_3", "Bà giáo về hưu (Marta) thức dậy đau đầu, phòng như quay (Dramatización)",
   scene(f"A bedroom in the morning: {CARP} sitting up in bed holding her head, dizzy, small swirl lines around her head.")),
  ("S2_4", "Marta đi khám, bác sĩ khám cổ",
   scene(f"A clinic office: {DOC} gently examining the neck of {CAR}, who points to the back of her neck.")),
  ("S2_5", "Vài tuần sau: Marta ngủ nghiêng thoải mái",
   scene(f"{BED}: {CARP} sleeping peacefully on her side with a pillow between her knees, a gentle smile.")),
  ("S2_6", "Đêm: Daniel ngủ, ly nước trên bàn đầu giường đã cạn",
   scene(f"{BED}: {ANTP} asleep, mouth slightly open, an empty glass on the nightstand next to a {CLOCK}.")),
  ("S2_7", "Buổi tối: Marta đưa nước, Daniel từ chối vì sợ đi tiểu đêm",
   scene(f"A living room in the evening: {CAR} offering a glass of water to {ANT}, who politely refuses with a raised hand, thinking about the bathroom at night.")),
  ("S2_8", "Sáng sớm: Daniel ngồi mép giường uống ly nước nhỏ trước khi đứng dậy",
   scene(f"A bedroom at sunrise: {ANTP} sitting on the edge of the bed, drinking a small glass of water before standing up, warm light.")),
 ]),
 ("PARTE 3 · Número 2: plano boca arriba + Número 1: boca arriba con apnea", [
  ("P3", "6 tư thế: Daniel nằm ngửa phẳng không gối; Daniel nằm ngửa ngáy há miệng; Daniel ôm gáy đau đầu; Daniel uống thuốc; Marta bịt tai; Marta lo lắng nhìn",
   (SHEET + f"Characters: {CARP} and {ANTP}. Pose sheet: SIX separate poses, same scale, two rows of three, widely spaced, nothing touching, no bed, no background: "
    "1) Daniel lying completely flat on his back seen from the side, arms by his sides; 2) Daniel lying on his back snoring with his mouth open; "
    "3) Daniel sitting, holding the back of his head with a headache; 4) Daniel standing, taking a pill with a glass of water; "
    "5) Marta sitting, covering her ears, tired; 6) Marta leaning forward, looking worried." + END.replace(" high resolution.", " 16:9, high resolution."))),
  ("O3", "10 đồ vật: máy đo huyết áp; lọ thuốc; gối nêm; mặt cắt họng (lưỡi tụt ra sau); máy đo giấc ngủ tại nhà; mặt nạ CPAP; mặt trăng; mặt trời mọc; tim; não",
   items(["an upper-arm blood pressure monitor with a blank screen", "a pill bottle with no label", "a foam wedge pillow", "a simple side cross-section of a head showing the tongue falling back and narrowing the airway",
          "a small home sleep test kit: a little box with a finger clip and a soft nasal tube", "a CPAP mask with a hose", "a crescent moon", "a rising sun", "a friendly cartoon heart", "a friendly cartoon brain"])),
  ("S3_1", "Daniel ngủ ngửa phẳng, không gối cao",
   scene(f"{BED}: {ANTP} asleep completely flat on his back on a thin flat pillow.")),
  ("S3_2", "5:30 sáng: Daniel tỉnh dậy ôm gáy đau đầu (Dramatización)",
   scene(f"A dark bedroom at dawn, faint blue light at the window: {ANTP} sitting up in bed holding the back of his head, in pain, a {CLOCK}.")),
  ("S3_3", "Buổi tối: Daniel uống thuốc huyết áp",
   scene(f"A bathroom in the evening: {ANTP} taking a pill with a glass of water, a pill organizer on the counter.")),
  ("S3_4", "Daniel ngủ trên gối nêm, nửa trên hơi cao",
   scene(f"{BED}: {ANTP} sleeping comfortably on his back on a foam wedge pillow that raises his whole upper body slightly, a small pillow under his knees.")),
  ("S3_5", "Daniel ngáy to, Marta thức bịt tai",
   scene(f"{BED}: {ANTP} snoring loudly on his back with his mouth open, while {CARP} lies awake covering her ears, tired.")),
  ("S3_6", "Marta lo lắng nhìn Daniel ngừng thở trong đêm",
   scene(f"{BED}, dim light: {CARP} sitting up in bed, worried, watching {ANTP} who is asleep on his back, very still, mouth open.")),
  ("S3_7", "Daniel và Marta đi khám nói về chứng ngáy",
   scene(f"A clinic office: {ANT} and {CAR} talking to {DOC} about snoring, Marta explaining with her hands.")),
  ("S3_8", "Tối: Daniel đeo máy đo giấc ngủ tại nhà",
   scene(f"{BED}: {ANTP} sitting on the bed fitting a small home sleep test device: a finger clip and a soft nasal tube, a small box on his chest strap, calm.")),
 ]),
 ("PARTE 4 · Las dos posturas + hidratación + habitación + cierre", [
  ("P4", "6 tư thế: Daniel nằm nghiêng gối kẹp giữa hai gối; Daniel ôm gối dài; Daniel nằm trên gối nêm; Daniel kẹp máy đo oxy; Marta viết sổ; hai ông bà vẫy tay",
   (SHEET + f"Characters: {CARP} and {ANTP}. Pose sheet: SIX separate poses, same scale, two rows of three, widely spaced, nothing touching, no bed, no background: "
    "1) Daniel lying on his side seen from the side, a pillow between his knees, eyes closed; 2) Daniel lying on his side hugging a long body pillow; "
    "3) Daniel lying back on a foam wedge pillow with a small pillow under his knees; 4) Daniel sitting, looking at a pulse oximeter clipped on his finger; "
    "5) Marta sitting, writing in a small notebook; 6) Daniel and Marta standing together, waving at the viewer." + END.replace(" high resolution.", " 16:9, high resolution."))),
  ("O4", "10 đồ vật: gối ôm dài; gối kẹp đầu gối; gối nêm; khăn cuộn; nhiệt kế phòng; máy tiếng ồn trắng; nút tai; điện thoại phát sáng xanh; máy đo oxy; sổ và bút",
   items(["a long body pillow", "a small knee pillow", "a foam wedge pillow", "a rolled towel", "a room thermometer with no digits", "a small white noise machine",
          "a pair of foam ear plugs", "a smartphone glowing with blue light", "a fingertip pulse oximeter with a blank screen", "a notebook with a pen"])),
  ("S4_1", "Daniel ngủ nghiêng trái đúng cách, gối kẹp giữa hai gối",
   scene(f"{BED}: {ANTP} sleeping peacefully on his left side, a pillow between his knees and a long pillow in front of him, {CARP} asleep beside him.")),
  ("S4_2", "Não được 'dọn dẹp' khi ngủ nghiêng: làn sóng xanh dịu quanh đầu",
   scene(f"{BED}, dreamy: {ANTP} sleeping on his side, a soft gentle glowing blue wave flowing around his head like calm water, magical and peaceful.")),
  ("S4_3", "Phòng ngủ mát: cửa sổ hé, chăn mỏng, tông xanh mát",
   scene(f"A cool, airy bedroom at night with cool blue tones, window slightly open with curtains moving, {ANTP} sleeping under a light blanket, a small fan.")),
  ("S4_4", "9 giờ tối: Daniel cất điện thoại, đọc sách dưới đèn vàng",
   scene(f"A living room at 9 pm with warm lamp light: {ANTP} putting his phone face down on the table and reading a paper book instead, relaxed.")),
  ("S4_5", "Sáng: Daniel kẹp máy đo oxy và ghi sổ",
   scene(f"A bedroom in the morning: {ANTP} sitting on the bed with a pulse oximeter on his finger, writing notes in a small notebook.")),
  ("S4_6", "Daniel đưa sổ ghi chép cho bác sĩ xem",
   scene(f"A clinic office: {ANT} showing his small notebook to {DOC}, who reads it with interest.")),
  ("S4_7", "Daniel gọi điện chia sẻ video cho bạn",
   scene(f"A sunny living room: {ANT} sitting on the sofa, smiling and sharing a video on his phone with an old friend sitting next to him (a man about 68, bald with a grey beard).")),
  ("S4_8", "Sáng: hai ông bà kéo rèm đón nắng, khỏe khoắn, vẫy chào",
   scene(f"A bright bedroom at sunrise: {ANTP} and {CARP} opening the curtains together, rested and smiling, waving at the viewer.")),
 ]),
]
nums, out = {}, []
head = ("# Image prompts: \"Posturas al dormir\" (Claves de la Longevidad)\n\n"
        "Nhân vật chính: ông **Daniel** (giống video trước) (tóc xám vuốt ngược, kính gọng đen chữ nhật, sơ mi xanh lục xắn tay, quần xanh đậm, đồng hồ) ; vợ **Marta**. Cảnh ngủ: Daniel mặc pyjama xanh sọc, Marta váy ngủ tím nhạt. **Mỗi lần tạo, đính kèm ảnh master** `projects/posturas_dormir/master/style_ref.webp`.\n"
        "Ảnh **tràn khung, không viền**, không chữ, không số. **Đặt tên ảnh theo số `1.png` … `40.png`**, gửi theo từng phần.\n\n"
        "Tạm chia **4 phần** theo nội dung (thời gian chính xác sẽ có khi bạn gửi giọng đọc). Mỗi phần 10 ảnh (1 tấm tư thế + 1 tấm đồ vật + 8 cảnh).\n")
n = 0
for pi, (title, lst) in enumerate(PARTS, 1):
    part = [f"# {title}\n"]
    for key, vi, prompt in lst:
        n += 1; nums[key] = n
        part.append(f"**Ảnh {n}** (`{n}.png`): {vi}\n```\n{prompt}\n```\n")
    (D / f"order_phan{pi}.md").write_text(head + "\n" + "\n".join(part))
    out.append("\n".join(part))
(D / "order_all.md").write_text(head + "\n" + "\n".join(out))
(D / "image_numbers.json").write_text(json.dumps(nums, indent=0))
print(n, "images")
