#!/usr/bin/env python3
"""Generate numbered image order (1..40) for the nicturia video, in the 2D whiteboard master style."""
import json, pathlib
D = pathlib.Path(__file__).parent

STY = ("Hand-drawn whiteboard cartoon illustration, exactly matching the attached reference image: sketchy dark grey ink pencil outlines "
       "with slightly rough doubled lines, soft muted flat colours (denim blue, warm beige, light grey, pale cream) with light hatching, "
       "small grey hatched ground shadow under feet and furniture, expressive cartoon faces, white background, ")
SHEET = STY + "plain pure white background. "
SCENE = STY + "simple suggested background, single full-frame edge-to-edge 16:9 scene, NO border, NO frame, NO rounded corners. "
END = " Correct anatomy, five fingers per hand. No text, no letters, no numbers, no logos, high resolution."
ENDS = " No text, no labels, no letters, no numbers, no logos, 16:9, high resolution."
CAR = ("MARTA, Gerald's wife (same hand-drawn style as the attached reference: 70-year-old woman, short wavy grey hair, small round "
       "glasses, kind face, lilac cardigan over a light grey top, beige trousers, grey shoes)")
ANT = ("GERALD (exactly the man in the attached reference: 71-year-old man, bald on top with messy grey tufts at the sides, big ears, "
       "round thin-rimmed glasses, blue zip jacket over a grey crew-neck sweater, beige trousers, grey shoes)")
ANTP = ("GERALD (exactly the man in the attached reference: 71-year-old man, bald on top with messy grey tufts at the sides, big ears, "
        "round thin-rimmed glasses, in light blue striped pyjamas)")
CARP = ("MARTA, Gerald's wife (same hand-drawn style: 70-year-old woman, short wavy grey hair, small round glasses, in a lilac nightgown)")
DOC = "a friendly middle-aged female doctor in a white coat with a stethoscope"
CLOCK = "a simple glowing bedside clock with plain hands and NO digits"

def poses(lst):
    body = "; ".join(f"{i+1}) {p}" for i, p in enumerate(lst))
    return (SHEET + f"Characters: {CAR} and {ANT}. Pose sheet: SIX separate full-body poses, same scale, two rows of three, widely "
            f"spaced, nothing touching, no floor, no background: {body}." + END.replace(" high resolution.", " 16:9, high resolution."))

def items(lst):
    body = "; ".join(f"{i+1}) {p}" for i, p in enumerate(lst))
    return (SHEET + f"Object sheet: TEN items drawn SEPARATELY, same scale, evenly spaced in two rows of five, nothing touching: {body}." + ENDS)

def scene(s): return SCENE + s + END

PARTS = [
 ("PHẦN 1 · Mở đầu + Mục 1 (ADH, thận làm việc ban đêm)", [
  ("P1", "6 tư thế: Gerald ngồi dậy trên giường ngái ngủ; Gerald lê dép đi vịn tường; Marta chống cằm suy nghĩ; Gerald ngủ say; Marta giơ ngón tay giải thích; Marta vẫy tay chào",
   poses([f"Gerald in pyjamas sitting up groggy, rubbing his eyes", "Gerald in pyjamas and slippers shuffling forward, one hand touching an invisible wall, sleepy",
          "Marta standing, hand on chin, thoughtful", "Gerald in pyjamas lying asleep on his back, peaceful smile, eyes closed",
          "Marta standing, raising one index finger, explaining", "Marta smiling warmly and waving at the viewer"])),
  ("O1", "10 đồ vật: đồng hồ đầu giường (không số); bàng quang hoạt hình; đôi thận; não; giọt hormone có cánh như lá thư; vỉ thuốc; ly nước; mặt trăng; bồn cầu; tuyến tiền liệt hoạt hình",
   items([CLOCK, "a friendly cartoon urinary bladder, round and pink", "a pair of friendly cartoon kidneys", "a friendly cartoon brain",
          "a small blue hormone droplet with tiny wings carrying an envelope (a messenger)", "a blister pack of pills", "a glass of water",
          "a crescent moon with two little stars", "a simple white toilet", "a small cartoon walnut-shaped gland (prostate) in soft pink"])),
  ("S1_1", "Phòng ngủ tối: Gerald choàng tỉnh, đồng hồ phát sáng đầu giường",
   scene(f"A dark bedroom at night lit by moonlight: {ANTP} suddenly awake in bed, eyes wide open, looking at {CLOCK} on the nightstand; Marta asleep beside him.")),
  ("S1_2", "Gerald lê bước trong hành lang tối tới nhà vệ sinh có đèn ngủ",
   scene(f"A dark home hallway at night: {ANTP} in slippers shuffling sleepily toward a bathroom door with a small warm night-light, one hand on the wall.")),
  ("S1_3", "Quay lại giường, Gerald mở mắt nhìn trần nhà, trăng ngoài cửa sổ",
   scene(f"A dark bedroom: {ANTP} lying in bed wide awake staring at the ceiling, tired; a crescent moon in the window; {CLOCK} on the nightstand.")),
  ("S1_4", "Phòng khám: bác sĩ đưa hộp thuốc cho Gerald, dặn uống ít nước",
   scene(f"A bright simple clinic office: {ANT} sitting across a desk from {DOC} who hands him a small pill box and gestures 'drink less'; a glass of water on the desk.")),
  ("S1_5", "Bữa tối: Gerald đẩy ly nước ra xa, lo lắng",
   scene(f"An evening dining table with a warm lamp: {ANT} pushing a glass of water away with a worried face, an empty dinner plate.")),
  ("S1_6", "Hai ông bà ngủ say yên bình, bầu trời sao",
   scene(f"A cosy bedroom at night, starry sky in the window: {ANTP} and {CARP} sleeping peacefully side by side, calm smiles, soft blue moonlight.")),
  ("S1_7", "Gerald buổi sáng mệt mỏi bên tách cà phê (thiếu ngủ)",
   scene(f"A morning kitchen: {ANT} sitting at the table, tired with heavy eyelids, holding a coffee cup, yawning; sunlight through the window.")),
  ("S1_8", "Marta ngồi sofa gõ bình luận trên máy tính bảng, mỉm cười",
   scene(f"A sunny living room: {CAR} sitting on a sofa typing a comment on a tablet, smiling; a cup of tea beside her.")),
 ]),
 ("PHẦN 2 · Mục 2 (dịch từ chân về bàng quang)", [
  ("P2", "6 tư thế: Gerald đứng dậy khỏi ghế vươn vai; Gerald cúi nhìn mắt cá sưng; Gerald nằm thẳng; Gerald đi bộ; Marta chỉ tay; Marta giơ ngón cái",
   poses(["Gerald standing up from an armchair, stretching his back", "Gerald sitting, leaning down to look at his swollen ankle, sock pulled down",
          "Gerald in pyjamas lying flat on his back, legs straight", "Gerald walking briskly, arms swinging, happy",
          "Marta pointing to the side with one hand, explaining", "Marta smiling with a thumbs up"])),
  ("O2", "10 đồ vật: cẳng chân có vết hằn tất; mắt cá sưng; tĩnh mạch có van; bắp chân 'máy bơm'; trái tim; giọt máu; đôi thận; bàng quang đang đầy; mảnh ghép hình; điều khiển TV",
   items(["a lower leg and ankle with red sock-line marks on the skin", "a puffy swollen ankle and foot", "a cut-away blue vein showing small one-way valves inside",
          "a cartoon calf muscle with a little pump handle", "a friendly cartoon heart", "a red blood drop", "a pair of friendly cartoon kidneys",
          "a cartoon bladder filling with yellow liquid", "three jigsaw puzzle pieces", "a TV remote control"])),
  ("S2_1", "Gerald (Dramatización) ngồi ghép tranh nhiều giờ, đồng hồ treo tường",
   scene(f"A retired man's living room in the afternoon: {ANT} sitting at a table working on a big jigsaw puzzle, a wall clock with plain hands and no digits, newspapers.")),
  ("S2_2", "Gerald ngồi lâu trên ghế bành xem TV",
   scene(f"A living room: {ANT} sitting deep in an armchair watching TV for a long time, feet still on the floor, remote in hand.")),
  ("S2_3", "Buổi tối Gerald cởi tất, thấy vết hằn và mắt cá sưng",
   scene(f"An evening bedroom: {ANT} sitting on the edge of the bed pulling off his socks and noticing red sock marks and puffy ankles, surprised.")),
  ("S2_4", "Gerald nằm xuống giường, chân ngang tim (đêm)",
   scene(f"A night bedroom: {ANTP} lying down flat in bed, legs at the same level as his chest, lamp switched off, calm.")),
  ("S2_5", "Nửa đêm: Gerald tỉnh dậy lần 1, trăng cao",
   scene(f"Midnight bedroom: {ANTP} sitting up in bed, sleepy, high moon in the window, {CLOCK}.")),
  ("S2_6", "Gần sáng: Gerald đứng trước cửa nhà vệ sinh lần thứ 3, trời chuyển xanh",
   scene(f"Early dawn hallway, sky turning dark blue in the window: {ANTP} standing at the bathroom door again, exhausted, yawning.")),
  ("S2_7", "Gerald đi bộ trong phòng khách / làm việc nhà, năng động",
   scene(f"A bright living room: {ANT} standing up from his puzzle table and walking around, stretching, active and cheerful.")),
  ("S2_8", "Sáng hôm sau Gerald tỉnh dậy khỏe khoắn, kéo rèm nắng",
   scene(f"A sunny morning bedroom: {ANTP} opening the curtains, rested and smiling, sunlight pouring in.")),
 ]),
 ("PHẦN 3 · Mục 3 (muối, đường, rượu) + Mục 4 (thói quen trước khi ngủ)", [
  ("P3", "6 tư thế: Marta nhón gót tập bắp chân (vịn ghế); Gerald uống nước buổi trưa; Gerald nằm gác chân lên tường; Marta nấu ăn với chanh và rau thơm; Gerald từ chối ly rượu; Marta vẫy tay",
   poses(["Marta standing holding a chair back, rising up on her toes doing a heel raise", "Gerald drinking a glass of water, smiling",
          "Gerald lying on his back on a mat with his legs raised resting up against a wall", "Marta in an apron squeezing a lemon over a pan, happy",
          "Gerald politely raising a hand to refuse a glass of wine", "Marta smiling and waving"])),
  ("O3", "10 đồ vật: lát bánh mì; miếng phô mai; hộp súp (không nhãn); bánh quy mặn; đĩa thịt nguội; lọ muối; miếng bánh ngọt; tách trà với hũ mật ong; ly rượu vang; chanh và rau thơm",
   items(["a slice of bread", "a wedge of cheese", "a plain soup can with no label", "a small pile of salty crackers", "a plate of sliced cold cuts (ham, salami)",
          "a salt shaker", "a slice of cake dessert", "a cup of tea next to a small honey jar with a dipper", "a glass of red wine", "a lemon half with fresh herbs"])),
  ("S3_1", "Bữa tối nhiều muối ẩn: bánh mì, phô mai, súp lon, thịt nguội",
   scene(f"An evening dinner table: {ANT} and {CAR} eating a dinner of bread, cheese, canned soup and cold cuts, cosy lamp light.")),
  ("S3_2", "Món tráng miệng ngọt và trà mật ong buổi tối",
   scene(f"A living room at night: {CAR} enjoying a slice of cake and a cup of honey tea on the sofa.")),
  ("S3_3", "Ly rượu bên lò sưởi buổi tối",
   scene(f"An evening living room by a fireplace: {ANT} in an armchair holding a glass of red wine, relaxed.")),
  ("S3_4", "Marta nhón gót bên quầy bếp (bơm bắp chân)",
   scene(f"A bright kitchen: {CAR} holding the kitchen counter and rising up on her toes doing calf raises, a kettle on the stove.")),
  ("S3_5", "Buổi trưa nắng: hai ông bà uống nước trong bữa trưa",
   scene(f"A sunny midday terrace: {ANT} and {CAR} at lunch, each drinking a big glass of water, bright sun high in the sky.")),
  ("S3_6", "Bữa tối nhẹ: cá tươi, rau, chanh, rau thơm (ít muối)",
   scene(f"A warm kitchen in the early evening: {CAR} serving a light dinner of grilled fresh fish with lemon, herbs and vegetables, no salt shaker; {ANT} smiling.")),
  ("S3_7", "Gerald nằm sofa, chân kê cao trên gối cao hơn tim",
   scene(f"A calm living room in the evening: {ANT} lying on the sofa with his legs raised on a stack of pillows, higher than his heart, reading a book.")),
  ("S3_8", "Phòng ngủ mát, cửa sổ hé; Marta tắm nước ấm từ sớm (1–2 giờ trước khi ngủ)",
   scene(f"A cool calm bedroom with the window slightly open and soft blue evening light: {CAR} in a bathrobe with a towel on her hair after a warm bath, relaxed.")),
 ]),
 ("PHẦN 4 · Mục 5 (khi nào đi khám) + Mục 6 (ngưng thở khi ngủ) + Kết", [
  ("P4", "6 tư thế: Gerald ngủ ngáy há miệng; Marta bịt tai khó chịu; Gerald ngủ đeo mặt nạ CPAP; Gerald ghi sổ; Marta uống nước khát; hai ông bà vẫy tay",
   poses(["Gerald in pyjamas sleeping on his back with mouth open, snoring (small zzz shapes, no letters)", "Marta in a nightgown covering her ears, annoyed",
          "Gerald in pyjamas sleeping peacefully wearing a CPAP nasal mask with a hose", "Gerald sitting writing in a small notebook with a pen",
          "Marta drinking a big glass of water, thirsty", "Gerald and Marta standing together waving at the viewer"])),
  ("O4", "10 đồ vật: máy CPAP; mặt nạ CPAP; cuốn sổ ghi chép; máy đo đường huyết; ống nghiệm nước tiểu; ống nghe; trái tim; phổi và đường thở; chân sưng to; lịch 3 ngày (không số)",
   items(["a small bedside CPAP machine", "a CPAP nasal mask with a hose", "a small notebook and pen (a diary)", "a glucometer with a test strip",
          "a urine sample cup", "a stethoscope", "a friendly cartoon heart", "a pair of cartoon lungs with an airway",
          "a very swollen lower leg", "a simple calendar page with three ticked boxes and no digits"])),
  ("S4_1", "Phòng khám: Gerald đưa cuốn sổ ghi chép cho bác sĩ",
   scene(f"A bright clinic office: {ANT} showing a small notebook diary to {DOC} who reads it attentively; Marta sitting beside him.")),
  ("S4_2", "Bác sĩ khám mắt cá chân sưng của Gerald",
   scene(f"A clinic examination room: {DOC} gently pressing on {ANT}'s swollen ankle while he sits on the exam bed.")),
  ("S4_3", "Marta khát nước ban đêm, uống ly to bên bồn rửa",
   scene(f"A dark kitchen at night: {CARP} drinking a big glass of water at the sink, very thirsty, moonlight through the window.")),
  ("S4_4", "Gerald ngáy, Marta thức trắng bên cạnh",
   scene(f"A night bedroom: {ANTP} snoring loudly with mouth open (wavy zzz shapes, no letters) while {CARP} lies awake beside him, worried.")),
  ("S4_5", "Thiết bị đo giấc ngủ tại nhà trên đầu giường",
   scene(f"A bedroom in the evening: {ANTP} sitting on the bed while Marta helps him attach a small home sleep test device with a finger clip.")),
  ("S4_6", "Gerald ngủ yên với máy CPAP",
   scene(f"A calm night bedroom: {ANTP} sleeping peacefully on his side wearing a CPAP mask, a small CPAP machine on the nightstand, {CARP} sleeping happily.")),
  ("S4_7", "Buổi sáng hai ông bà tỉnh dậy tươi tỉnh, mặt trời mọc",
   scene(f"A sunny morning bedroom at sunrise: {ANTP} and {CARP} stretching and smiling, well rested.")),
  ("S4_8", "Hai ông bà đi dạo công viên, vẫy chào (kết)",
   scene(f"A green park at golden hour: {ANT} and {CAR} walking arm in arm, waving goodbye to the viewer.")),
 ]),
]

nums, out = {}, []
head = ("# Ảnh cần tạo: \"¿Por qué se despierta a orinar de noche?\" (Claves de la Longevidad)\n\n"
        "Style theo **ảnh master mới bạn gửi** (ông Gerald, nét chì phác thảo, áo khoác xanh, quần be). **Mỗi lần tạo, đính kèm ảnh master** "
        "`projects/nicturia/master/style_ref.webp`.\n"
        "Nhân vật: **Gerald** (giống hệt ảnh master) và vợ **Marta** (tóc xám xoăn ngắn, kính tròn nhỏ, áo len tím).\n"
        "7 tư thế trong ảnh master đã được cắt dùng luôn (ngồi xem điện thoại, ghép tranh, ngáp đi tới nhà vệ sinh, chỉ tay, nhón gót, gác chân trên sofa, đứng).\n"
        "Ảnh **tràn khung, không viền**, không chữ, không số. **Đặt tên ảnh theo số `1.png` … `40.png`**, gửi theo từng phần.\n\n"
        "Chia **4 phần** theo giọng đọc (24:59): P1 = Mở đầu + Mục 1 (0:00–3:34) · P2 = Mục 2 (3:34–8:15) · P3 = Mục 3 + 4 (8:15–19:09) · P4 = Mục 5 + 6 + Kết (19:09–24:59).\n"
        "Mỗi phần 10 ảnh (1 tấm tư thế + 1 tấm đồ vật + 8 cảnh).\n")
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
