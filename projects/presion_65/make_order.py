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

NURSE = "a friendly middle-aged female nurse in light blue scrubs"
CUFF = "a white upper-arm blood pressure monitor with a grey cuff on his upper arm, the screen blank with NO digits"
PARTS = [
 ("PHẦN 1 · Mở đầu + vì sao động mạch thay đổi sau 65 tuổi", [
  ("P1", "6 tư thế: Gerald thở phào nhẹ nhõm; Gerald chóng mặt ôm đầu; Gerald đầu óc mơ hồ (dấu ? quanh đầu); Gerald loạng choạng suýt ngã; Marta chỉ tay giải thích; Marta vẫy tay chào",
   poses(["Gerald sitting on a chair, smiling with relief, hand on his chest", "Gerald standing, dizzy, one hand on his forehead, small swirl lines around his head",
          "Gerald standing, confused, scratching his head, small question-mark shapes floating (no letters)", "Gerald stumbling forward, arms out, about to lose balance",
          "Marta standing, pointing to the side with one hand, explaining", "Marta smiling warmly and waving at the viewer"])),
  ("O1", "10 đồ vật: máy đo huyết áp bắp tay (màn hình trống); ống tưới vườn mới mềm dẻo; ống tưới cũ cứng nứt; trái tim; mặt cắt động mạch khỏe đàn hồi; mặt cắt động mạch cứng có vôi; não; đôi thận; cuốn hướng dẫn (bìa trống); kính lúp",
   items(["a white upper-arm blood pressure monitor with cuff and a blank screen with NO digits", "a bright new flexible green garden hose, coiled", "an old faded stiff cracked garden hose", "a friendly cartoon heart",
          "a cross-section of a healthy flexible artery, round and pink", "a cross-section of a stiff artery with thick wall and white calcium spots", "a friendly cartoon brain", "a pair of friendly cartoon kidneys",
          "a thick guideline book with a blank cover (no text)", "a magnifying glass"])),
  ("S1_1", "Phòng khám: bác sĩ cho Gerald xem kết quả, Gerald thở phào",
   scene(f"A bright simple clinic office: {ANT} sitting with a blood pressure cuff just removed from his arm, smiling with relief while {DOC} gives him a thumbs up across the desk.")),
  ("S1_2", "Buổi sáng Gerald ngồi mép giường, chóng mặt",
   scene(f"An early-morning bedroom: {ANTP} sitting on the edge of the bed, dizzy, holding his head with one hand, soft swirl lines near his head, sunrise light.")),
  ("S1_3", "Gerald đứng giữa bếp, quên mất mình định làm gì (đầu óc mơ hồ)",
   scene(f"A kitchen: {ANT} standing in the middle of the kitchen holding an empty cup, confused and foggy, a faint cloud drawn around his head.")),
  ("S1_4", "Gerald vấp tấm thảm, Marta đỡ kịp",
   scene(f"A living room: {ANT} tripping over the edge of a rug and losing balance while {CAR} rushes to catch his arm, worried.")),
  ("S1_5", "Hai ông bà ngồi sofa viết bình luận trên máy tính bảng",
   scene(f"A sunny living room: {ANT} and {CAR} sitting together on a sofa, Marta typing a comment on a tablet, both smiling.")),
  ("S1_6", "Vườn: ống tưới mới mềm dẻo phun nước, Gerald tưới cây vui vẻ",
   scene(f"A green garden in spring: {ANT} happily watering flowers with a bright new flexible garden hose, the hose curving easily, a soft arc of water.")),
  ("S1_7", "Ống tưới cũ cứng nằm dưới nắng gắt nhiều năm (ẩn dụ)",
   scene("A sunny garden corner: an old faded stiff cracked garden hose lying on the hot dry ground under a strong sun, a wooden fence, no people.")),
  ("S1_8", "Gerald cầm ống tưới cũ cứng, ngắm nghía, suy nghĩ",
   scene(f"A garden: {ANT} holding up an old stiff garden hose that will not bend, looking at it thoughtfully.")),
 ]),
 ("PHẦN 2 · Hướng dẫn 2017, nghiên cứu SPRINT và HYVET, ai quyết định mục tiêu", [
  ("P2", "6 tư thế: Gerald đọc tờ giấy, bối rối; Gerald uống thuốc với ly nước; Gerald chống gậy đi chậm; Gerald đi bộ tự tin; Marta giơ ngón cái; Marta chống cằm suy nghĩ",
   poses(["Gerald holding a sheet of paper, reading with a puzzled face", "Gerald taking a pill with a glass of water", "Gerald walking slowly with a wooden cane",
          "Gerald walking confidently, smiling", "Marta smiling with a thumbs up", "Marta standing, hand on chin, thoughtful"])),
  ("O2", "10 đồ vật: cuốn hướng dẫn bìa trống; bảng kẹp có biểu đồ cột; cân thăng bằng; lọ thuốc; áo phông một cỡ treo móc; bia bắn tên có mũi tên; khung tập đi; ống nghe; đồng hồ cát; bánh sinh nhật (không số)",
   items(["a thick guideline book with a blank cover", "a clipboard with a simple bar chart (no text, no numbers)", "a balance scale", "a pill bottle with no label",
          "a huge one-size T-shirt on a hanger", "a target board with an arrow in the center", "a walking frame (walker)", "a stethoscope", "an hourglass", "a birthday cake with candles (no numbers)"])),
  ("S2_1", "Phòng họp: các bác sĩ quanh bàn, biểu đồ lớn trên tường (ra hướng dẫn)",
   scene("A meeting room: a group of doctors in white coats sitting around a table, a large wall chart with a simple downward line (no text, no numbers), serious discussion.")),
  ("S2_2", "Nghiên cứu lớn: hàng người lớn tuổi đang đo huyết áp",
   scene(f"A large bright hall: a row of older adults sitting at tables having their blood pressure measured by nurses, organised clinical-trial atmosphere; {ANT} among them.")),
  ("S2_3", "Một cụ ông rất già, yếu, đi khung tập đi được đo huyết áp",
   scene(f"A clinic: a very frail 90-year-old man with a walking frame sitting while {NURSE} gently measures his blood pressure; same hand-drawn style as the attached reference.")),
  ("S2_4", "Sinh nhật 81 tuổi của Gerald, cả nhà vây quanh bánh",
   scene(f"A cosy dining room: {ANT} looking a little older, blowing out candles on a birthday cake (no numbers), {CAR} and grandchildren clapping.")),
  ("S2_5", "Bác sĩ và Gerald cùng xem biểu đồ, cá nhân hóa mục tiêu",
   scene(f"A clinic office: {DOC} and {ANT} leaning over a chart together on the desk, discussing, Gerald nodding, collaborative mood.")),
  ("S2_6", "Áo một cỡ quá rộng mặc trên Gerald (ẩn dụ 'một cỡ cho tất cả')",
   scene(f"A bedroom with a mirror: {ANT} trying on a giant one-size T-shirt that is far too big for him, looking at the mirror with a funny puzzled face.")),
  ("S2_7", "Bác sĩ lão khoa kiểm tra đi đứng, thăng bằng của Gerald",
   scene(f"A clinic hallway: {DOC} watching {ANT} stand up from a chair and walk a few steps, checking his balance, clipboard in hand.")),
  ("S2_8", "Gerald và Marta viết số '2' (bình luận) trên điện thoại",
   scene(f"A kitchen table: {ANT} and {CAR} smiling, Gerald typing on a phone, a cup of tea, morning light.")),
 ]),
 ("PHẦN 3 · Áp lực mạch, huyết áp tăng vọt buổi sáng, tăng huyết áp ẩn giấu", [
  ("P3", "6 tư thế: Gerald ngồi đo huyết áp bắp tay; Gerald thức dậy vươn vai; Gerald uống cà phê; Gerald lo lắng hồi hộp; Marta ngạc nhiên che miệng; Marta chỉ tay",
   poses([f"Gerald sitting at a small table measuring his blood pressure with an upper-arm cuff, calm", "Gerald in pyjamas stretching after waking up", "Gerald holding a cup of coffee, steam rising",
          "Gerald sitting nervously, sweating slightly, hands clasped", "Marta surprised, hand over her mouth", "Marta pointing up with one finger, explaining"])),
  ("O3", "10 đồ vật: máy đo huyết áp bắp tay; tách cà phê; đồng hồ báo thức buổi sáng (không số); mặt trời mọc; mặt nạ sân khấu (ẩn dụ 'ẩn giấu'); áo blouse trắng treo móc; mạch máu co lại; trái tim đập nhanh; tia sét nhỏ (cortisol); bóng đèn",
   items(["a white upper-arm blood pressure monitor with blank screen", "a cup of coffee with steam", "a morning alarm clock with plain hands and no digits", "a rising sun over hills",
          "a simple white theatre mask", "a white doctor's coat on a hanger", "a narrowed blood vessel squeezed in the middle", "a friendly cartoon heart beating fast with motion lines",
          "a small yellow lightning bolt", "a glowing light bulb"])),
  ("S3_1", "Y tá đo huyết áp cho Gerald ở phòng khám",
   scene(f"A clinic room: {NURSE} measuring the blood pressure of {ANT} with an upper-arm cuff, a small desk.")),
  ("S3_2", "Gerald ngủ yên ban đêm (huyết áp giảm khi ngủ)",
   scene(f"A calm bedroom at night: {ANTP} sleeping peacefully, moonlight through the window, very relaxed.")),
  ("S3_3", "Bình minh: Gerald bật dậy, mặt trời mọc ngoài cửa sổ",
   scene(f"A bedroom at sunrise: {ANTP} sitting up quickly in bed, alarm clock ringing, bright sunrise through the window, energetic morning.")),
  ("S3_4", "6:45 sáng: Gerald pha cà phê trong bếp",
   scene(f"An early-morning kitchen: {ANTP} making coffee with a coffee maker, a wall clock with plain hands and no digits, soft dawn light.")),
  ("S3_5", "'Áo blouse trắng': Gerald hồi hộp khi y tá chuẩn bị đo",
   scene(f"A clinic room: {ANT} sitting tense and nervous, sweating slightly, while {NURSE} prepares the cuff, a doctor's white coat hanging on the wall.")),
  ("S3_6", "Gerald rời phòng khám vui vẻ, yên tâm",
   scene(f"A clinic exit door: {ANT} walking out happily, waving goodbye, relaxed and reassured, sunny street outside.")),
  ("S3_7", "Gerald tự đo huyết áp buổi sáng ở bàn nhà",
   scene(f"A quiet morning living room: {ANT} sitting at a table with back supported and feet flat, measuring his blood pressure with {CUFF}, a notebook beside him.")),
  ("S3_8", "Marta ngạc nhiên đọc kết quả trong sổ, Gerald chỉ vào",
   scene(f"A dining table: {CAR} looking surprised at a small notebook while {ANT} points at it, a blood pressure monitor on the table.")),
 ]),
 ("PHẦN 4 · Cách đo huyết áp tại nhà, câu hỏi cho bác sĩ, kết", [
  ("P4", "6 tư thế: Gerald quấn vòng bít bắp tay; Gerald ngồi yên nhắm mắt nghỉ 5 phút; Gerald đứng dậy khỏi ghế; Gerald ghi sổ; Gerald giơ tay hỏi; hai ông bà vẫy tay",
   poses(["Gerald sitting, wrapping a blood pressure cuff around his upper arm", "Gerald sitting quietly with eyes closed, resting, hands on lap", "Gerald standing up from a chair, one hand on the chair back",
          "Gerald sitting writing in a small notebook", "Gerald raising his hand to ask a question", "Gerald and Marta standing together waving at the viewer"])),
  ("O4", "10 đồ vật: máy đo bắp tay; máy đo cổ tay; 3 vòng bít các cỡ; sổ ghi chép; lịch 2 tuần (không số); ghế tựa; hộp chia thuốc; đồng hồ; bong bóng dấu hỏi; cuộn phim",
   items(["a white upper-arm blood pressure monitor with blank screen", "a wrist blood pressure monitor", "three blood pressure cuffs in small, medium and large sizes", "a small notebook and pen",
          "a calendar page with fourteen ticked boxes and no digits", "a sturdy chair with a straight back", "a weekly pill organizer", "a wall clock with plain hands and no digits",
          "a speech bubble with a question mark shape", "a film strip"])),
  ("S4_1", "Tư thế đo đúng: lưng tựa, chân đặt phẳng, tay đặt ngang tim trên bàn",
   scene(f"A calm living room: {ANT} sitting correctly to measure blood pressure: back against the chair, both feet flat on the floor, legs uncrossed, arm resting on the table at heart level, {CUFF}.")),
  ("S4_2", "Buổi tối Gerald đo lại huyết áp, đèn bàn ấm",
   scene(f"An evening living room with a warm lamp: {ANT} measuring his blood pressure again at the table, notebook open, calm.")),
  ("S4_3", "Thử đứng dậy: Marta đứng cạnh đỡ, Gerald đứng lên đo",
   scene(f"A living room: {ANT} standing up from a chair with the blood pressure cuff still on his arm while {CAR} stands close beside him holding his elbow for safety.")),
  ("S4_4", "Gerald đưa sổ ghi huyết áp cho bác sĩ",
   scene(f"A clinic office: {ANT} handing his blood pressure notebook to {DOC} who reads it with interest.")),
  ("S4_5", "Gerald đặt câu hỏi, bác sĩ lắng nghe, Marta ngồi cạnh",
   scene(f"A clinic office: {ANT} asking a question with a raised finger, {DOC} listening attentively, {CAR} sitting beside him with a notepad.")),
  ("S4_6", "Gerald uống thuốc buổi tối với hộp chia thuốc",
   scene(f"A kitchen in the evening: {ANT} taking his evening pill from a weekly pill organizer with a glass of water.")),
  ("S4_7", "Gerald chia sẻ video cho người bạn qua máy tính bảng",
   scene(f"A park bench: {ANT} showing a tablet to an older friend (a bearded man in a cap) who looks interested.")),
  ("S4_8", "Hai ông bà đi dạo công viên, vẫy chào (kết)",
   scene(f"A green park at golden hour: {ANT} and {CAR} walking arm in arm, waving goodbye to the viewer.")),
 ]),
]
nums, out = {}, []
head = ("# Ảnh cần tạo: \"La presión arterial después de los 65\" (Claves de la Longevidad)\n\n"
        "Cùng style ông **Gerald** và bà **Marta** như video tiểu đêm. **Mỗi lần tạo, đính kèm ảnh master** `projects/presion_65/master/style_ref.webp`.\n"
        "Ảnh **tràn khung, không viền**, không chữ, không số (màn hình máy đo để trống). **Đặt tên ảnh theo số `1.png` … `40.png`**, gửi theo từng phần.\n\n"
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
