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
PARTS = [
 ("PART 1 · Hook + Surgery 1: carotid endarterectomy", [
  ("P1", "6 tư thế: Daniel gật đầu ký giấy; Daniel suy nghĩ cầm tờ giấy; Daniel giơ tay đặt câu hỏi; Daniel xoa cổ; Marta chỉ tay giải thích; Marta vẫy tay chào",
   poses(["Daniel sitting, nodding while signing a paper with a pen", "Daniel standing, holding a sheet of paper, thoughtful", "Daniel raising one hand to ask a question",
          "Daniel touching the side of his neck, slightly worried", "Marta pointing to the side with one hand, explaining", "Marta smiling warmly and waving at the viewer"])),
  ("O1", "10 đồ vật: bút và giấy cam kết (trống); bằng cấp đóng khung (trống); cổ có động mạch cảnh; động mạch có mảng bám; não; máy siêu âm; lọ thuốc; huyết áp kế; viên aspirin; dấu hỏi",
   items(["a pen lying on a blank consent form", "a framed diploma with no text", "a side view of a neck showing the carotid artery in red", "a cross-section of an artery narrowed by yellow plaque",
          "a friendly cartoon brain", "an ultrasound probe", "a pill bottle with no label", "an upper-arm blood pressure monitor with blank screen", "two small white round pills", "a big question mark shape"])),
  ("S1_1", "Phòng khám với bằng cấp trên tường, bác sĩ phẫu thuật nói chuyện với Daniel",
   scene(f"A clean consultation office with framed diplomas (no text) on the wall: {SURG} sitting behind a desk, calmly recommending surgery to {ANT}, who listens seriously.")),
  ("S1_2", "Daniel ký giấy cam kết, Marta ngồi cạnh lo lắng",
   scene(f"The same office: {ANT} signing a consent form with a pen while {CAR} sits beside him looking slightly worried.")),
  ("S1_3", "Một ca phẫu thuật thành công: người già đi bộ vui vẻ sau mổ",
   scene(f"A sunny park path: {ANT} walking happily and freely, pain-free, smiling at the sky.")),
  ("S1_4", "Siêu âm động mạch cổ cho Daniel",
   scene(f"A clinic room: {ANT} lying back on an exam table while a technician holds an ultrasound probe on the side of his neck, a monitor with a simple grey image (no text).")),
  ("S1_5", "Cơn thiếu máu não thoáng qua: Daniel bỗng yếu tay, Marta lo lắng",
   scene(f"A kitchen: {ANT} suddenly dropping a cup, one arm weak, confused face, while {CAR} rushes to him, worried.")),
  ("S1_6", "Daniel khỏe mạnh, đi bộ buổi sáng (không triệu chứng)",
   scene(f"A morning neighborhood street: {ANT} walking briskly and feeling fine, carrying a newspaper.")),
  ("S1_7", "Daniel uống thuốc buổi sáng với hộp chia thuốc",
   scene(f"A morning kitchen: {ANT} taking his pills from a weekly pill organizer with a glass of water, blood pressure monitor on the table.")),
  ("S1_8", "Daniel hỏi bác sĩ phẫu thuật, giơ tờ giấy ghi câu hỏi",
   scene(f"A consultation office: {ANT} holding a small note card and asking a question, {SURG} answering openly with a hand gesture, {CAR} beside him.")),
 ]),
 ("PART 2 · Surgery 2: spinal cord stimulator + Surgery 3: prostate cancer", [
  ("P2", "6 tư thế: Daniel đau lưng ôm thắt lưng; Daniel tập vật lý trị liệu với dây kháng lực; Daniel chống gậy; Daniel bình tĩnh trầm ngâm; Marta đặt tay lên vai an ủi; Marta giơ ngón cái",
   poses(["Daniel bending slightly, hand on his lower back, in pain", "Daniel doing a gentle physical therapy exercise with a resistance band", "Daniel walking with a wooden cane",
          "Daniel sitting calmly, hands folded, thoughtful", "Marta with a comforting hand raised as if on someone's shoulder, kind face", "Marta smiling with a thumbs up"])),
  ("O2", "10 đồ vật: cột sống; máy kích thích tủy sống nhỏ có dây; pin; tia sét nhỏ; tuyến tiền liệt; ống nghiệm máu; máy MRI; lịch theo dõi; miếng lót thấm; đồng hồ cát",
   items(["a simple cartoon spine", "a small implantable stimulator device with thin wires", "a small battery", "a small yellow lightning bolt", "a small cartoon walnut-shaped gland (prostate) in soft pink",
          "a blood test tube", "an MRI scanner", "a calendar page with ticked boxes and no digits", "a folded absorbent pad", "an hourglass"])),
  ("S2_1", "Daniel nằm sofa, đau lưng, không ngủ được",
   scene(f"A living room at night: {ANT} lying uncomfortably on the sofa, hand on his lower back, unable to rest, a lamp on.")),
  ("S2_2", "Phòng khám: bác sĩ cầm mô hình máy kích thích tủy sống",
   scene(f"A clinic office: {DOC} holding up a small implantable device with thin wires and showing it to {ANT}, who looks hopeful but unsure.")),
  ("S2_3", "Daniel tập vật lý trị liệu với chuyên viên",
   scene(f"A bright physiotherapy room: {ANT} doing gentle back exercises on a mat with a friendly physiotherapist in a polo shirt guiding him.")),
  ("S2_4", "Nhóm phục hồi đau mạn tính: vài người lớn tuổi tập cùng nhau",
   scene(f"A community rehab room: a small group of older adults including {ANT} doing gentle stretching together, an instructor demonstrating.")),
  ("S2_5", "Daniel nghe tin chẩn đoán, Marta nắm tay",
   scene(f"A clinic office: {ANT} sitting still, shocked, while {CAR} holds his hand; {DOC} speaking gently across the desk.")),
  ("S2_6", "Daniel làm xét nghiệm máu PSA",
   scene(f"A clinic lab: a nurse in light blue scrubs drawing blood from {ANT}'s arm, he sits calmly.")),
  ("S2_7", "Daniel nằm vào máy MRI",
   scene(f"A hospital imaging room: {ANT} in a hospital gown lying on the table of an MRI scanner, a technician nearby, calm atmosphere.")),
  ("S2_8", "Hai ông bà đi dạo yên bình (theo dõi chủ động, sống bình thường)",
   scene(f"A riverside path in autumn: {ANT} and {CAR} walking calmly arm in arm, relaxed, enjoying life.")),
 ]),
 ("PART 3 · Surgery 4: both knees at once + Surgery 5: aortic aneurysm", [
  ("P3", "6 tư thế: Daniel đi khung tập đi; Daniel ngồi xe lăn; Daniel tập gập gối với chuyên viên; Daniel ôm đầu gối đau; Marta đỡ tay Daniel; Marta suy nghĩ",
   poses(["Daniel walking with a walking frame (walker)", "Daniel sitting in a wheelchair", "Daniel sitting on a chair bending his knee gently",
          "Daniel holding his painful knee", "Marta holding someone's arm to support them, side view", "Marta standing, hand on chin, thoughtful"])),
  ("O3", "10 đồ vật: khớp gối nhân tạo; khớp háng nhân tạo; giọt máu; cục máu đông; phổi; trái tim; động mạch chủ phình to; ống ghép stent; thước dây; máy siêu âm",
   items(["an artificial knee joint implant", "an artificial hip joint implant", "a red blood drop", "a small dark red blood clot", "a pair of cartoon lungs",
          "a friendly cartoon heart", "a cartoon aorta with a round bulge (aneurysm) in the belly part", "a Y-shaped stent graft", "a tape measure", "an ultrasound probe"])),
  ("S3_1", "Daniel đi bộ thoải mái sau thay một khớp gối",
   scene(f"A sunny garden path: {ANT} walking freely and happily some weeks after a single knee replacement, pain-free, smiling.")),
  ("S3_2", "Phòng mổ: bác sĩ giải thích 'cả hai gối cùng lúc'",
   scene(f"A clinic office: {SURG} pointing to a knee model with two knees on the desk, explaining to {ANT} and {CAR}.")),
  ("S3_3", "Sau mổ hai gối: Daniel nằm viện, cả hai chân băng bó",
   scene(f"A hospital room: {ANT} in a hospital gown lying in bed with both knees bandaged, tired, an IV stand nearby, {CAR} sitting beside the bed.")),
  ("S3_4", "Ở nhà một mình, khó đi lại với khung tập đi",
   scene(f"A living room: {ANT} struggling to walk alone with a walking frame, both knees bandaged, looking tired; no one else in the room.")),
  ("S3_5", "Có người đỡ: Marta đi cùng khi tập đi",
   scene(f"A bright hallway at home: {ANT} walking carefully with a walking frame while {CAR} walks beside him, supporting his arm, both smiling.")),
  ("S3_6", "Siêu âm bụng kiểm tra động mạch chủ",
   scene(f"A clinic room: {ANT} lying on an exam table while a technician moves an ultrasound probe over his belly, a monitor with a simple grey image (no text).")),
  ("S3_7", "Bác sĩ mạch máu so sánh mổ mở và đặt stent qua bẹn (mô hình)",
   scene(f"A vascular clinic office: {SURG} showing a simple aorta model and a Y-shaped stent graft to {ANT} and {CAR}, explaining the two options.")),
  ("S3_8", "Kiểm tra định kỳ hằng năm (chụp hình ảnh)",
   scene(f"A hospital imaging room: {ANT} lying on the table of a CT scanner, calm, a technician smiling nearby.")),
 ]),
 ("PART 4 · 4 questions to ask + closing", [
  ("P4", "6 tư thế: Daniel cầm tờ ghi câu hỏi; Daniel bắt tay bác sĩ; Daniel đọc báo; Daniel viết hồi ký trên máy tính; Marta ghi chép; hai ông bà vẫy tay",
   poses(["Daniel holding a small list of questions", "Daniel reaching out for a handshake, smiling", "Daniel reading a newspaper, interested",
          "Daniel typing on a laptop at a desk, happy", "Marta writing notes in a small notebook", "Daniel and Marta standing together waving at the viewer"])),
  ("O4", "10 đồ vật: danh sách câu hỏi (trống); đồng hồ; lịch 6 tháng; mũi tên rẽ hai hướng; nhà; biểu đồ cột; ống nghe; xấp giấy in nghiên cứu; cuốn sách hồi ký; điện thoại",
   items(["a small paper list with blank lines", "a wall clock with plain hands and no digits", "a calendar page with no digits", "a signpost with two arrows pointing different ways",
          "a small cozy house", "a simple bar chart with no text", "a stethoscope", "a stack of printed papers with highlighter marks (no readable text)", "a hardcover book", "a smartphone"])),
  ("S4_1", "Daniel và Marta ngồi bàn bếp viết câu hỏi trước buổi khám",
   scene(f"A kitchen table: {ANT} and {CAR} writing a list of questions on paper before a doctor's appointment, cups of tea.")),
  ("S4_2", "Daniel hỏi bác sĩ phẫu thuật, bác sĩ trả lời cởi mở",
   scene(f"A consultation office: {ANT} asking a question with a raised finger, {SURG} answering openly and calmly, showing a simple chart (no text).")),
  ("S4_3", "Daniel đi khám ý kiến thứ hai ở phòng khám khác",
   scene(f"A different bright clinic: {ANT} and {CAR} greeting {DOC} with a handshake, a second-opinion visit.")),
  ("S4_4", "Ông Raymond (74 tuổi) đọc báo buổi sáng, đánh dấu bài báo (Dramatización)",
   scene("A sunny breakfast table: a sharp 74-year-old man with white short hair and a white moustache, in a brown cardigan, reading a newspaper and highlighting printed papers; same flat cartoon style as the attached reference.")),
  ("S4_5", "Ông Raymond ngồi với bác sĩ, cùng đọc các bài nghiên cứu (Dramatización)",
   scene(f"A consultation office: the 74-year-old man with white short hair, white moustache and brown cardigan going through highlighted printed papers together with {DOC}, collaborative.")),
  ("S4_6", "Ông Raymond viết xong hồi ký, vui vẻ bên máy tính (Dramatización)",
   scene("A cozy study: the 74-year-old man with white short hair, white moustache and brown cardigan happily holding a freshly printed manuscript next to his laptop, bookshelves behind.")),
  ("S4_7", "Daniel chia sẻ video cho con gái qua điện thoại",
   scene(f"A living room: {ANT} showing his phone screen to his adult daughter (around 40, brown hair) who sits beside him on the sofa, interested.")),
  ("S4_8", "Hai ông bà đi dạo công viên, vẫy chào (kết)",
   scene(f"A green park at golden hour: {ANT} and {CAR} walking arm in arm, waving goodbye to the viewer.")),
 ]),
]
nums, out = {}, []
head = ("# Image prompts: \"5 surgeries after 60\" (Claves de la Longevidad)\n\n"
        "Nhân vật chính mới: ông **Daniel** (tóc xám vuốt ngược, kính gọng đen chữ nhật, sơ mi xanh lục xắn tay, quần xanh đậm, đồng hồ) theo ảnh master bạn gửi; vợ **Marta**. **Mỗi lần tạo, đính kèm ảnh master** `projects/cirugias_60/master/style_ref.webp`.\n"
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
