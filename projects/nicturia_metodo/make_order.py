#!/usr/bin/env python3
"""Generate numbered image order (1..40) for the nicturia video, in the 2D whiteboard master style."""
import json, pathlib
D = pathlib.Path(__file__).parent

STY = ("Clean flat 2D cartoon illustration, exactly matching the attached reference image: smooth dark outlines, soft flat muted colours with gentle "
       "shading, warm cream background tones, friendly rounded faces, simple shapes, ")
SHEET = STY + "plain pure white background. "
SCENE = STY + "simple suggested background, single full-frame edge-to-edge 16:9 scene, NO border, NO frame, NO rounded corners. "
END = " Correct anatomy, five fingers per hand. No text, no letters, no numbers, no logos, high resolution."
ENDS = " No text, no labels, no letters, no numbers, no logos, 16:9, high resolution."
CAR = ("MARTA, Tomás's wife (same flat cartoon style as the attached reference: 70-year-old woman, short wavy grey hair, no glasses, kind round face, "
       "dusty-rose cardigan over a light blouse, grey trousers, grey slippers)")
ANT = ("TOMÁS (exactly the man in the attached reference: about 70 years old, short wavy grey hair, NO glasses, round friendly face, "
       "teal V-neck sweater over a light blue collared shirt, navy blue trousers, grey slippers)")
ANTP = ("TOMÁS (exactly the man in the attached reference: about 70 years old, short wavy grey hair, NO glasses, round friendly face, "
        "in light blue striped pyjamas)")
CARP = ("MARTA, Tomás's wife (same flat cartoon style: 70-year-old woman, short wavy grey hair, no glasses, in a soft pink nightgown)")
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
PARTS = [
 ("PHẦN 1 · Mở đầu + vì sao tiểu đêm đáng lo (giấc ngủ vỡ, té ngã)", [
  ("P1", "6 tư thế: Tomás ngồi dậy ngái ngủ; Tomás lê bước dò đường trong tối; Tomás ngáp mệt mỏi; Tomás vấp chân suýt ngã; Marta chỉ tay giải thích; Marta vẫy tay chào",
   poses(["Tomás in light blue striped pyjamas sitting up in bed groggy, rubbing his eyes", "Tomás in pyjamas and slippers shuffling forward in the dark, one hand stretched out feeling the way",
          "Tomás yawning, tired, shoulders slumped", "Tomás in pyjamas tripping, one foot caught, arms out, about to fall",
          "Marta standing, pointing to the side with one hand, explaining", "Marta smiling warmly and waving at the viewer"])),
  ("O1", "10 đồ vật: đồng hồ đầu giường (không số); bàng quang; đôi thận; não; trái tim; tấm thảm quăn mép; khung xương hông; mặt trăng; bồn cầu; ly nước",
   items([CLOCK, "a friendly cartoon urinary bladder", "a pair of friendly cartoon kidneys", "a friendly cartoon brain", "a friendly cartoon heart",
          "a small rug with a curled-up corner", "a simple cartoon hip bone and thigh bone", "a crescent moon with two little stars", "a simple white toilet", "a glass of water"])),
  ("S1_1", "Đêm khuya: Tomás đang ngủ say thì choàng tỉnh, đồng hồ đầu giường",
   scene(f"A dark bedroom at night lit by moonlight: {ANTP} suddenly awake in bed, eyes open, looking at {CLOCK} on the nightstand; his wife asleep beside him.")),
  ("S1_2", "Tomás đi dò dẫm trong hành lang tối tới nhà vệ sinh",
   scene(f"A dark home hallway at night: {ANTP} in slippers walking sleepily toward a bathroom door with a small warm night-light, one hand on the wall.")),
  ("S1_3", "Quay lại giường, nằm mở mắt, trăng ngoài cửa sổ",
   scene(f"A dark bedroom: {ANTP} lying in bed wide awake staring at the ceiling, tired; a crescent moon in the window; {CLOCK} on the nightstand.")),
  ("S1_4", "Giấc ngủ vỡ vụn: Tomás trở mình liên tục, chăn xộc xệch",
   scene(f"A night bedroom: {ANTP} tossing and turning in bed, blanket twisted, restless, moonlight, small swirl lines of restlessness.")),
  ("S1_5", "Gần sáng: Tomás vấp mép thảm trong hành lang tối",
   scene(f"A dark hallway before dawn: {ANTP} tripping on the curled edge of a rug, losing balance, arms out, sleepy face.")),
  ("S1_6", "Buổi sáng: Tomás mệt mỏi bên tách cà phê, Marta lo lắng",
   scene(f"A morning kitchen: {ANT} sitting at the table, tired with heavy eyelids, holding a coffee cup; {CAR} looking at him with concern.")),
  ("S1_7", "Hai ông bà ngồi sofa viết bình luận trên máy tính bảng",
   scene(f"A sunny living room: {ANT} and {CAR} sitting together on a sofa, Marta typing a comment on a tablet, both smiling.")),
  ("S1_8", "Hai ông bà ngủ ngon yên bình (mục tiêu)",
   scene(f"A cosy bedroom at night, starry sky in the window: {ANTP} and {CARP} sleeping peacefully side by side, calm smiles, soft blue moonlight.")),
 ]),
 ("PHẦN 2 · 3 thay đổi trong cơ thể sau 50 tuổi (ADH, dịch ở chân, bàng quang nhạy)", [
  ("P2", "6 tư thế: Tomás ngồi xem tivi lâu; Tomás cúi nhìn mắt cá sưng; Tomás nằm thẳng trên giường; Tomás ôm bụng dưới mắc tiểu gấp; Marta giơ ngón tay giải thích; Marta chống cằm suy nghĩ",
   poses(["Tomás sitting in an armchair for a long time, holding a TV remote", "Tomás sitting, leaning down to look at his swollen ankle, sock pulled down",
          "Tomás in pyjamas lying flat on his back, legs straight", "Tomás standing with knees together, hand on lower belly, urgent need to pee, worried face",
          "Marta raising one index finger, explaining", "Marta standing, hand on chin, thoughtful"])),
  ("O2", "10 đồ vật: giọt hormone ADH có cánh; mặt trăng; mặt trời; cẳng chân hằn tất; mắt cá sưng; trái tim; giọt máu; bàng quang đầy; bàng quang co nhỏ cứng; chuông báo động",
   items(["a small blue hormone droplet with tiny wings carrying an envelope (a messenger)", "a crescent moon", "a smiling sun", "a lower leg with red sock-line marks on the skin",
          "a puffy swollen ankle and foot", "a friendly cartoon heart", "a red blood drop", "a cartoon bladder filling with yellow liquid",
          "a small tense cartoon bladder with stiff wrinkled wall", "a ringing red alarm bell"])),
  ("S2_1", "Não gửi giọt ADH tới thận lúc ngủ (Tomás ngủ, ẩn dụ)",
   scene(f"A calm night bedroom: {ANTP} sleeping peacefully, a soft glowing dotted line drawn from his head down to his lower back (a gentle hormone signal), moonlight.")),
  ("S2_2", "Tomás ngồi ghế bành cả buổi chiều xem tivi",
   scene(f"A living room in the afternoon: {ANT} sitting deep in an armchair watching TV for hours, feet on the floor, remote in hand.")),
  ("S2_3", "Buổi tối cởi tất thấy vết hằn và mắt cá sưng",
   scene(f"An evening bedroom: {ANT} sitting on the edge of the bed pulling off his socks and noticing red sock marks and puffy ankles, surprised.")),
  ("S2_4", "Tomás nằm xuống giường, chân ngang tim",
   scene(f"A night bedroom: {ANTP} lying down flat in bed, legs at the same level as his chest, lamp switched off, calm.")),
  ("S2_5", "Nửa đêm bật dậy vì mắc tiểu gấp",
   scene(f"Midnight bedroom: {ANTP} sitting up quickly in bed with an urgent face, one hand on his lower belly, high moon in the window.")),
  ("S2_6", "Tomás đứng trước bồn cầu, ngạc nhiên vì tiểu rất ít",
   scene(f"A small night bathroom with a night-light: {ANTP} standing near the toilet scratching his head, puzzled and sleepy (decent, seen from the side, nothing explicit).")),
  ("S2_7", "Phòng khám: bác sĩ giải thích bằng hình bàng quang",
   scene(f"A clinic office: {DOC} pointing at a simple bladder poster on the wall (no text) while {ANT} listens attentively.")),
  ("S2_8", "Tomás và Marta gõ số '2' bình luận trên điện thoại",
   scene(f"A kitchen table: {ANT} and {CAR} smiling, Tomás typing on a phone, a cup of tea, morning light.")),
 ]),
 ("PHẦN 3 · Phương pháp 5 bước: buổi sáng, buổi chiều, cà phê–rượu, muối", [
  ("P3", "6 tư thế: Tomás uống ly nước lớn buổi sáng; Tomás uống từng ngụm nhỏ; Tomás cầm tách cà phê; Tomás từ chối ly rượu; Marta nấu ăn với chanh và rau thơm; Marta giơ ngón cái",
   poses(["Tomás in pyjamas drinking a big glass of water", "Tomás taking a small sip from a small glass", "Tomás holding a cup of coffee, steam rising",
          "Tomás politely raising a hand to refuse a glass of wine", "Marta in an apron squeezing a lemon over a pan, happy", "Marta smiling with a thumbs up"])),
  ("O3", "10 đồ vật: bình nước lớn; ly nước nhỏ; tách cà phê; ấm trà; ly rượu vang; bát súp; lát thịt nguội; miếng phô mai; lọ nước tương (không nhãn); chanh và rau thơm",
   items(["a big water jug", "a small glass of water", "a cup of coffee with steam", "a teapot", "a glass of red wine", "a bowl of soup",
          "a plate of sliced cold cuts", "a wedge of cheese", "a small soy sauce bottle with no label", "a lemon half with fresh herbs"])),
  ("S3_1", "Sáng sớm: Tomás uống ly nước đầy bên cửa sổ, mặt trời mọc",
   scene(f"An early-morning kitchen at sunrise: {ANTP} drinking a full glass of water by the window, a coffee maker waiting on the counter.")),
  ("S3_2", "Xưởng gỗ: Tomás mải làm, bình nước bị bỏ quên (Dramatización)",
   scene(f"A home workshop in the daytime: {ANT} busy sanding a wooden birdhouse at a workbench, a full water bottle forgotten on a shelf behind him.")),
  ("S3_3", "Buổi trưa: Tomás uống nước đều đặn trong vườn",
   scene(f"A sunny garden at midday: {ANT} sitting on a garden chair drinking water from a glass, a water jug on the small table, bright sun.")),
  ("S3_4", "Buổi tối: chỉ vài ngụm nước nhỏ uống thuốc",
   scene(f"An evening kitchen with warm lamp light: {ANT} taking a pill with just a small sip of water from a tiny glass.")),
  ("S3_5", "Cà phê buổi sáng, đồng hồ chỉ trước trưa",
   scene(f"A bright morning café table at home: {ANT} enjoying a cup of coffee, a wall clock with plain hands and no digits, sunlight.")),
  ("S3_6", "Ly rượu dời sang bữa trưa ngoài hiên",
   scene(f"A sunny terrace at lunch: {ANT} and {CAR} having lunch, a small glass of red wine beside Tomás's plate, daylight.")),
  ("S3_7", "Bữa trưa đậm đà: súp, bánh mì kẹp, phô mai",
   scene(f"A midday kitchen table: {ANT} eating a hearty lunch of soup, a sandwich and cheese, daylight from the window.")),
  ("S3_8", "Bữa tối nhẹ: cá, rau, chanh, rau thơm (ít muối)",
   scene(f"An early-evening dining table: {CAR} serving a light dinner of grilled fish with lemon, herbs and fresh vegetables, no salt shaker; {ANT} smiling.")),
 ]),
 ("PHẦN 4 · Nghi thức trước khi ngủ, lịch một ngày, khi nào đi khám, kết", [
  ("P4", "6 tư thế: Tomás nằm gác chân cao trên gối; Tomás đi bộ chậm trong nhà; Tomás ngủ ngáy; Tomás ghi sổ; Marta vẫy tay; hai ông bà vẫy tay",
   poses(["Tomás lying on his back on a sofa with his legs raised on pillows, higher than his heart", "Tomás walking slowly in slippers, relaxed",
          "Tomás in pyjamas sleeping on his back with mouth open, snoring (small zzz shapes, no letters)", "Tomás sitting writing in a small notebook",
          "Marta smiling and waving", "Tomás and Marta standing together waving at the viewer"])),
  ("O4", "10 đồ vật: chồng gối; ghế tựa ngả; đôi dép đi trong nhà; hộp thuốc; máy đo đường huyết; tuyến tiền liệt hoạt hình; phổi và đường thở; ống nghe; sổ ghi chép; lịch 7 ngày đánh dấu (không số)",
   items(["a stack of soft pillows", "a reclining armchair", "a pair of house slippers", "a pill bottle with no label", "a glucometer with a test strip",
          "a small cartoon walnut-shaped gland (prostate) in soft pink", "a pair of cartoon lungs with an airway", "a stethoscope", "a small notebook and pen",
          "a calendar page with seven ticked boxes and no digits"])),
  ("S4_1", "Tối: Tomás nằm sofa, chân kê cao trên gối",
   scene(f"A calm living room in the evening: {ANT} lying on the sofa with his legs raised on a stack of pillows, higher than his heart, reading a book.")),
  ("S4_2", "Đi bộ chậm 5 phút quanh nhà",
   scene(f"A cosy hallway in the evening: {ANT} in slippers walking slowly and calmly around the house, relaxed.")),
  ("S4_3", "Trước khi ngủ: Tomás bước ra từ nhà vệ sinh, thong thả",
   scene(f"An evening hallway: {ANTP} calmly stepping out of the bathroom door, relaxed and ready for bed, warm light.")),
  ("S4_4", "Bà Patricia (68 tuổi) tỉnh dậy khỏe khoắn buổi sáng (Dramatización)",
   scene("A sunny bedroom in the morning: a 68-year-old woman with short brown-grey hair and glasses, in a soft green nightgown, stretching happily in bed after a full night's sleep; same clean cartoon style as the attached reference.")),
  ("S4_5", "Phòng khám: bác sĩ xem sổ ghi và hộp thuốc của Tomás",
   scene(f"A clinic office: {ANT} showing a small notebook and a pill bottle to {DOC} who reads it attentively; {CAR} sitting beside him.")),
  ("S4_6", "Tomás ngáy, Marta lo lắng bên cạnh",
   scene(f"A night bedroom: {ANTP} snoring with mouth open (wavy zzz shapes, no letters) while {CARP} lies awake beside him, worried.")),
  ("S4_7", "Sáng hôm sau: hai ông bà thức dậy tươi tỉnh, mặt trời mọc",
   scene(f"A sunny morning bedroom at sunrise: {ANTP} and {CARP} stretching and smiling, well rested.")),
  ("S4_8", "Hai ông bà đi dạo công viên, vẫy chào (kết)",
   scene(f"A green park at golden hour: {ANT} and {CAR} walking arm in arm, waving goodbye to the viewer.")),
 ]),
]
nums, out = {}, []
head = ("# Ảnh cần tạo: \"Nicturia: el método de hidratación circadiana\" (Claves de la Longevidad)\n\n"
        "Style theo **ảnh master mới** (ông **Tomás**: tóc bạc gợn sóng, **không đeo kính**, áo len cổ tim xanh lục, sơ mi xanh nhạt, quần xanh đậm, dép xám) và vợ **Marta**. **Mỗi lần tạo, đính kèm ảnh master** `projects/nicturia_metodo/master/style_ref.webp`.\n"
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
