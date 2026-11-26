#!/usr/bin/env python3
"""Generate numbered image order (1..40) for the nicturia_tu video, in the 2D whiteboard master style."""
import json, pathlib
D = pathlib.Path(__file__).parent

STY = ("Soft 2D cartoon storybook illustration, exactly matching the attached reference image: clean dark brown outlines, soft muted colours with gentle "
       "shading, warm friendly faces with rosy cheeks, slightly rounded proportions, cozy homely look, ")
SHEET = STY + "plain pure white background. "
SCENE = STY + "simple cozy background, single full-frame edge-to-edge 16:9 scene, NO border, NO frame, NO rounded corners. "
END = " Correct anatomy, five fingers per hand. No text, no letters, no numbers, no logos, high resolution."
ENDS = " No text, no labels, no letters, no numbers, no logos, 16:9, high resolution."
ANT = ("DANIEL (exactly the man in the attached reference image: about 70 years old, thick wavy grey hair, dark round-rectangular glasses, kind wrinkled face, "
       "dark teal cardigan over a light blue button shirt, grey trousers, dark grey slippers)")
ANTP = ANT  # owner's reference keeps the same outfit, also in bed
CAR = ("MARTA, Daniel's wife (same soft cartoon style as the attached reference: about 68 years old, short wavy white-grey hair, small round glasses, "
       "kind face, soft lilac cardigan over a cream blouse, grey trousers, grey slippers)")
CARP = CAR
DOC = "a friendly middle-aged male doctor with short brown hair, white coat, blue tie and a stethoscope, same soft cartoon style"
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
SURG = "a calm middle-aged female surgeon with dark hair in a bun, white coat over light green scrubs, same soft cartoon style"

BED = "A cozy bedroom at night, soft moonlight through the window, a warm bedside lamp on a wooden nightstand, a wooden bed with a white sheet, a dusty blue blanket and plump white pillows like the attached reference"
BATH = "a softly lit small bathroom at night, a dim night light near the floor"
PSH = (SHEET + f"Characters: {CARP} and {ANTP}. Pose sheet: SIX separate poses, same scale, two rows of three, widely spaced, nothing touching, each lying pose with only a white pillow and a dusty blue blanket, no room background: ")
PSD = (SHEET + f"Characters: {CAR} and {ANT}. Pose sheet: SIX separate full-body poses, same scale, two rows of three, widely spaced, nothing touching, no floor, no background: ")
PE = END.replace(" high resolution.", " 16:9, high resolution.")
PARTS = [
 ("PARTE 1 · Gancho + la explicación incompleta + la hormona de la noche", [
  ("P1", "6 tư thế (đồ ngủ): Daniel ngồi mép giường dụi mắt buồn ngủ; Daniel lê bước đi, tay vịn tường; Daniel ngủ ngửa yên bình; Daniel nằm mở mắt nhìn trần nhà; Marta vẫy chào; Daniel cầm điện thoại gõ bình luận",
   PSH + "1) Daniel sitting on the edge of a bed, sleepy, rubbing his eyes; 2) Daniel shuffling forward half asleep, one hand reaching out to a wall, slippers; "
   "3) Daniel lying on his back seen from the side, peacefully asleep; 4) Daniel lying on his back seen from the side, eyes wide open staring at the ceiling, tired; "
   "5) Marta standing, smiling and waving at the viewer; 6) Daniel sitting, typing on a smartphone with a smile." + PE),
  ("O1", "10 đồ vật: đồng hồ đầu giường; bàng quang; hai quả thận; tuyến tiền liệt; não (có tuyến yên phát sáng nhỏ); vỉ thuốc; ly nước; mặt trăng; mặt trời; bồn cầu",
   items([CLOCK, "a friendly cartoon urinary bladder, pale yellow-pink", "a pair of friendly cartoon kidneys, red-brown", "a small cartoon prostate gland, simple pink walnut shape",
          "a friendly cartoon brain with a tiny glowing gland underneath it", "a blister pack of pills", "a glass of water", "a crescent moon", "a bright sun", "a white toilet"])),
  ("S1_1", "2:47 đêm: Daniel tỉnh dậy trong bóng tối, nhìn đồng hồ",
   scene(f"{BED}, dark: {ANTP} waking up in the middle of the night, propped on one elbow, squinting at {CLOCK} on the nightstand, {CARP} asleep beside him.")),
  ("S1_2", "Daniel lê bước vào nhà vệ sinh, ngái ngủ",
   scene(f"A dark hallway at night leading to {BATH}: {ANTP} shuffling half asleep toward the bathroom door, one hand on the wall.")),
  ("S1_3", "Daniel quay lại giường, ngồi thở dài mệt mỏi",
   scene(f"{BED}: {ANTP} sitting on the edge of the bed in the dark, shoulders slumped, sighing, tired.")),
  ("S1_4", "Phòng khám: Daniel kể với bác sĩ chuyện dậy 3–4 lần mỗi đêm",
   scene(f"A clinic office: {ANT} sitting across the desk from {DOC}, holding up three fingers, explaining he wakes up three times a night.")),
  ("S1_5", "Bác sĩ đưa vỉ thuốc, Daniel cầm mà vẫn băn khoăn",
   scene(f"A clinic office: {DOC} handing a small box of pills to {ANT}, who takes it with a doubtful, unconvinced face.")),
  ("S1_6", "Daniel trẻ (khoảng 35 tuổi) ngủ say một mạch tới sáng",
   scene(f"{BED}: a younger version of Daniel, about 35 years old, thick wavy dark brown hair, same dark glasses and same teal cardigan outfit, sleeping deeply and peacefully, moonlight.")),
  ("S1_7", "Daniel hiện tại nằm thao thức, ánh trăng",
   scene(f"{BED}, blue moonlight: {ANTP} lying awake on his back, eyes open, staring at the ceiling, {CLOCK} glowing on the nightstand.")),
  ("S1_8", "Sáng: Daniel ngồi bàn bếp gõ bình luận trên điện thoại, Marta mang cà phê",
   scene(f"A sunny kitchen in the morning: {ANT} sitting at the table smiling and typing on his smartphone, {CAR} bringing two cups of coffee.")),
 ]),
 ("PARTE 2 · De las piernas a la vejiga (Dramatización: hombre de 71 años)", [
  ("P2", "6 tư thế (đồ thường): Daniel ngồi ghế bành giải ô chữ; Daniel xem TV; Daniel ngáp trên ghế; Daniel đi bộ; Daniel kéo tất xem vết hằn ở mắt cá; Daniel ấn ngón tay vào mắt cá sưng",
   PSD + "1) Daniel sitting in an armchair doing a crossword in a newspaper with a pen; 2) Daniel sitting in an armchair holding a TV remote, watching; "
   "3) Daniel sitting in an armchair yawning, eyes half closed; 4) Daniel walking briskly, arms swinging; 5) Daniel sitting, pulling down his sock to look at a red sock mark on his ankle; "
   "6) Daniel sitting, pressing a finger into his slightly swollen ankle, curious." + PE),
  ("O2", "10 đồ vật: chân có tĩnh mạch và van; tĩnh mạch van đóng; tĩnh mạch van hở; bắp chân như cái bơm; mắt cá sưng có vết tất; giọt dịch xanh; tim; thận; bàng quang đầy; ghế bành",
   items(["a simple cartoon lower leg showing a blue vein running up it", "a close-up of a vein with a small valve closed (two little flaps meeting)",
          "a close-up of a vein with a small valve not closing well (flaps apart)", "a cartoon calf muscle squeezing a vein like a pump, with an upward arrow shape made of flowing blood (no text)",
          "a swollen ankle with a red sock mark line", "a single light blue fluid drop", "a friendly cartoon heart", "a pair of friendly cartoon kidneys", "a cartoon urinary bladder that is full",
          "a cozy armchair"])),
  ("S2_1", "Ông kỹ sư về hưu (Daniel) ngồi ghế bành giải ô chữ cả buổi (Dramatización)",
   scene(f"A cozy living room in the afternoon: {ANT} sitting in an armchair doing a crossword, a pile of newspapers and a cup of tea beside him, he has been sitting for hours.")),
  ("S2_2", "Daniel từ chối ly nước buổi chiều",
   scene(f"A living room in the late afternoon: {CAR} offering a glass of water to {ANT}, who refuses with a raised hand, worried about the night.")),
  ("S2_3", "Daniel ngồi xem TV, chân thả xuống, mắt cá hơi sưng",
   scene(f"A living room in the evening: {ANT} sitting on the sofa watching TV, feet on the floor, his ankles slightly swollen, a little tired.")),
  ("S2_4", "Tối: Daniel cởi tất, thấy vết hằn đỏ ở mắt cá",
   scene(f"A bedroom in the evening, warm lamp light: {ANT} sitting on the edge of the bed, pulling off his sock and noticing a deep red sock mark on his slightly puffy ankle.")),
  ("S2_5", "Daniel lên giường nằm xuống, chân ngang tim",
   scene(f"{BED}, side view: {ANTP} lying down flat in bed, legs stretched out level with his chest, relaxed, just closing his eyes.")),
  ("S2_6", "Nửa đêm: Daniel lại dậy đi vệ sinh",
   scene(f"A dark bedroom at midnight: {ANTP} getting out of bed again, feet searching for slippers, {CLOCK}, {CARP} asleep.")),
  ("S2_7", "4 giờ sáng: Daniel đứng trước cửa nhà vệ sinh, mệt mỏi",
   scene(f"{BATH}: {ANTP} standing at the bathroom door, exhausted, eyes half closed, hair messy.")),
  ("S2_8", "Daniel đi bộ trong công viên, khỏe khoắn",
   scene(f"A sunny park path in the morning: {ANT} walking briskly, smiling, trees and benches around.")),
 ]),
 ("PARTE 3 · Los hábitos de la noche + rutina pasos 1–3", [
  ("P3", "6 tư thế: Daniel đi về phía bếp; Daniel đứng dậy khỏi ghế; Daniel uống nước buổi sáng; Marta nấu ăn với rau thơm và chanh; Daniel từ chối ly rượu; Daniel chỉ vào đồng hồ",
   PSD + "1) Daniel walking toward the kitchen, relaxed, arms swinging; 2) Daniel getting up from an armchair, hands on the armrests; "
   "3) Daniel drinking a big glass of water; 4) Marta cooking, sprinkling fresh herbs and squeezing a lemon over a pan; "
   "5) Daniel politely refusing a glass of red wine with a raised palm; 6) Daniel pointing at a wall clock with plain hands and no digits." + PE),
  ("O3", "10 đồ vật: lát bánh mì; miếng phô mai; súp gói; bánh quy mặn; giăm bông thái lát; bát tráng miệng ngọt; tách trà mật ong; ly rượu vang; lọ muối; chanh và rau thơm",
   items(["a slice of bread", "a wedge of cheese", "a soup packet next to a soup can (no labels)", "a few salty crackers", "a few slices of ham",
          "a small bowl of sweet dessert pudding", "a cup of tea with a honey dipper", "a glass of red wine", "a salt shaker", "a lemon with a bunch of fresh herbs"])),
  ("S3_1", "Bữa tối: Daniel và Marta ăn bánh mì, phô mai, giăm bông, súp",
   scene(f"A kitchen table in the evening: {ANT} and {CAR} having dinner with bread, cheese, sliced ham and a bowl of soup, cozy lamp light.")),
  ("S3_2", "Daniel ăn tráng miệng ngọt và trà mật ong buổi tối",
   scene(f"A living room late in the evening: {ANT} on the sofa eating a sweet dessert with a cup of tea with honey, the window dark outside.")),
  ("S3_3", "Daniel uống một ly rượu vang buổi tối",
   scene(f"A living room in the evening: {ANT} holding a glass of red wine in an armchair, relaxed, a lamp on.")),
  ("S3_4", "Đêm: Daniel trằn trọc, giấc ngủ chập chờn",
   scene(f"{BED}, dark: {ANTP} tossing and turning, the blanket twisted, restless, {CLOCK}.")),
  ("S3_5", "Daniel nhón gót vịn mặt bếp",
   scene(f"A bright kitchen in the daytime: {ANT} holding the kitchen counter and rising up on his toes doing heel raises, a kettle nearby, smiling.")),
  ("S3_6", "Daniel đứng dậy đi lại sau khi ngồi lâu",
   scene(f"A living room in the daytime: {ANT} getting up from his armchair and stretching, about to walk to the kitchen, a crossword left on the chair.")),
  ("S3_7", "Buổi trưa: Daniel uống nước, bình nước trên bàn",
   scene(f"A sunny kitchen at midday: {ANT} drinking a big glass of water, a water jug on the table, bright noon light.")),
  ("S3_8", "Marta nấu bữa tối nhẹ: cá tươi, rau, chanh, rau thơm",
   scene(f"A kitchen in the early evening: {CAR} cooking a fresh fish fillet with vegetables, lemon and herbs, {ANT} setting the table, warm light.")),
 ]),
 ("PARTE 4 · Rutina pasos 4–5 + cuándo ir al médico + apnea + cierre", [
  ("P4", "6 tư thế: Daniel nằm gác chân lên tường; Daniel nằm trên giường gác chân lên chồng gối đọc sách; Daniel ngáy há miệng; Daniel đeo mặt nạ CPAP ngủ; Marta lo lắng; Daniel và Marta vẫy chào",
   PSH + "1) Daniel lying on his back on a pillow with his legs raised and resting up against a wall, relaxed; 2) Daniel lying on a bed with his legs raised high on a stack of pillows, reading a book; "
   "3) Daniel lying on his back snoring with his mouth open; 4) Daniel sleeping on his side wearing a CPAP mask with a hose, peaceful; "
   "5) Marta sitting up, worried, hand on her chest; 6) Daniel and Marta standing together in day clothes, waving at the viewer." + PE),
  ("O4", "10 đồ vật: nhiệt kế phòng; vòi sen nước ấm; ống nghiệm máu; que thử đường huyết; mặt cắt họng bị hẹp; máy CPAP và mặt nạ; bộ đo giấc ngủ tại nhà; ly nước có giọt; sổ tay và bút; gối tựa",
   items(["a room thermometer with no digits", "a shower head with warm water and a little steam", "a blood test tube with a cap", "a small glucose meter with a blank screen and a test strip",
          "a simple side cross-section of a head showing the throat airway narrowing during sleep", "a CPAP machine with its mask and hose", "a small home sleep test kit: a little box with a finger clip and a soft nasal tube",
          "a big glass of water", "a notebook with a pen", "two soft cushions stacked"])),
  ("S4_1", "Tối: Daniel nằm sofa gác chân lên tay vịn/gối cao hơn tim",
   scene(f"A living room in the evening, warm lamp: {ANTP} lying on the sofa with his legs raised on cushions on the armrest, higher than his heart, reading a book, relaxed.")),
  ("S4_2", "Daniel đi vệ sinh trước khi lên giường",
   scene(f"A clean bright bathroom in the evening: {ANTP} washing his hands at the sink after using the toilet, calm, ready for bed.")),
  ("S4_3", "Phòng ngủ mát, cửa sổ hé; Daniel tắm nước ấm trước đó",
   scene(f"A cool airy bedroom at night with cool blue tones, window slightly open, curtains moving: {ANTP} with slightly damp hair after a warm shower, pulling up a light blanket.")),
  ("S4_4", "Phòng khám: bác sĩ xem chân sưng của Daniel",
   scene(f"A clinic office: {DOC} kneeling and gently pressing on the swollen ankle of {ANT}, who sits on the exam table.")),
  ("S4_5", "Daniel làm xét nghiệm máu, y tá lấy máu",
   scene(f"A clinic room: a friendly middle-aged female nurse in light blue scrubs taking a blood sample from the arm of {ANT}, who stays calm.")),
  ("S4_6", "Đêm: Daniel ngáy to, Marta lo lắng nhìn",
   scene(f"{BED}, dim light: {ANTP} snoring loudly on his back with his mouth open, {CARP} sitting up, worried, watching him.")),
  ("S4_7", "Daniel ngủ ngon với máy CPAP",
   scene(f"{BED}: {ANTP} sleeping peacefully on his side wearing a CPAP mask, the small machine on the nightstand, {CARP} asleep beside him, calm.")),
  ("S4_8", "Sáng: hai ông bà kéo rèm đón nắng, khỏe khoắn, vẫy chào",
   scene(f"A bright bedroom at sunrise: {ANTP} and {CARP} opening the curtains together, rested and smiling, waving at the viewer.")),
 ]),
]
nums, out = {}, []
head = ("# Prompt ảnh: \"Levantarse a orinar de noche\" (Claves de la Longevidad)\n\n"
        "Style và nhân vật theo **ảnh mẫu mới bạn gửi**: ông **Daniel** (tóc xám dày gợn sóng, kính gọng sẫm, áo len cardigan xanh lục đậm, sơ mi xanh nhạt, quần xám, dép xám). Vợ **Marta** cùng style (tóc trắng xám xoăn ngắn, kính tròn, áo len tím nhạt). Giữ nguyên trang phục như ảnh mẫu kể cả khi ngủ, chăn xanh xám như ảnh mẫu.\n"
        "**Mỗi lần tạo, đính kèm ảnh mẫu** (ảnh 7 tư thế bạn vừa gửi). 7 tư thế trong ảnh mẫu mình sẽ cắt ra dùng luôn.\n"
        "Ảnh **tràn khung, không viền**, không chữ, không số. **Đặt tên ảnh theo số `1.png` … `40.png`**, gửi mỗi lần 5 ảnh.\n\n"
        "Tạm chia **4 phần** theo nội dung (thời gian chính xác sẽ có khi bạn gửi giọng đọc). Mỗi phần 10 ảnh: 1 tấm tư thế + 1 tấm đồ vật + 8 cảnh.\n")
n = 0
for pi, (title, lst) in enumerate(PARTS, 1):
    part = [f"# {title}\n"]
    for key, vi, prompt in lst:
        n += 1; nums[key] = n
        part.append(f"**Ảnh {n}** (`{n}.png`): {vi}\n```\n{prompt}\n```\n")
    out.append("\n".join(part))
(D / "TOAN_BO_PROMPT_nicturia_tu.txt").write_text(head + "\n" + "\n".join(out))
(D / "image_numbers.json").write_text(json.dumps(nums, indent=0))
print(n, "images")
