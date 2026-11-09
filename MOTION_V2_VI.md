
# HealthyXZZS Motion V2 — Hướng dẫn tạo nhân vật có chuyển động

Motion V2 là pipeline mới, không xóa các dự án và renderer hiện tại. Video đẹp và có chuyển động cơ thể khi bạn cung cấp clip MP4 từ công cụ image-to-video hoặc tự quay. Không dùng xoay tay chân giả hay morph hình để giả chuyển động.

## Yêu cầu
- Node.js 20+ (khuyên dùng 22), FFmpeg và FFprobe.
- voice.srt chuẩn timing và voice.mp3 (giọng đọc).
- Một ảnh 16:9 được duyệt cho mỗi cảnh.
- Video chuyển động thật, chỉ bắt buộc cho các cảnh mode=character.
- Không cần API trả phí nếu tự tạo clip qua công cụ bên ngoài.
- Nếu muốn tự động tạo clip qua fal.ai, bạn phải tự cài @fal-ai/client và thiết lập FAL_KEY; chạy lệnh --execute mới phát sinh chi phí.

## Cách chạy (từ thư mục gốc repository)

BƯỚC 1 — Tạo cảnh từ SRT:

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --style V1 --character "Carmen, 69, grey bob hair, teal blouse, beige trousers"

BƯỚC 2 — Mở projects/video_moi/motion/scenes.json; chỉnh visual và action đúng nội dung kịch bản. Chọn mode: character (người chuyển động), still (ảnh tĩnh có chuyển động camera nhẹ), graphic (biểu đồ). Mặc định khoảng 1/3 scene là character để giảm chi phí.

BƯỚC 3 — Xuất yêu cầu 20 ảnh và DỪNG:

    node .claude/skills/health-video/scripts/motion_v2.mjs batch projects/video_moi --index 1

Đọc các file trong motion/batches/: batch_001_agent.md, batch_001_prompts.md, batch_001_scene_text.txt và batch_001_motion_prompts.md. Tạo hình trong app bạn chọn, đặt tên SC001.png... rồi lưu dưới images/. Không chuyển sang batch 2 trước khi duyệt.

BƯỚC 4 — Tạo MP4 nhân vật chuyển động bằng video AI phù hợp hoặc trình dựng video tùy chọn. Dùng prompt trong batch_001_motion_prompts.md, cùng ảnh SC###.png làm first frame (và last frame nếu có); lưu vào clips/SC###.mp4. Ưu tiên 30fps và 16:9, mỗi clip dài đủ thời lượng cảnh.

Để chỉ xem prompt, không chạy API:

    node .claude/skills/health-video/scripts/motion_v2.mjs animate projects/video_moi --batch 1 --max 1

Tùy chọn TỰ NGUYỆN dùng API trả phí, không có mặc định:

    cd .claude/skills/health-video && npm install --no-save @fal-ai/client
    export FAL_KEY='YOUR_KEY'
    node scripts/motion_v2.mjs animate ../../../../projects/video_moi --batch 1 --max 1 --execute

Tham khảo bảng giá trước khi chạy: https://fal.ai/models/fal-ai/wan/v2.7/image-to-video

BƯỚC 5 — Kiểm tra kỹ thuật, tạo ảnh khung hình để soi biến dạng:

    node .claude/skills/health-video/scripts/motion_v2.mjs qa projects/video_moi --frames

Đọc motion/qa/report.json và xem các ảnh *_12.jpg, *_50.jpg, *_88.jpg. Kiểm tra khớp vai, đầu gối, bàn tay, chân, nhận diện, quần áo, viền khung và chuyển động có đúng hành động. Không có bộ kiểm thử nào cam kết tuyệt đối về giải phẫu; kiểm tra bằng mắt là bắt buộc.

BƯỚC 6 — Duyệt CHỈ các scene đã kiểm tra:

    node .claude/skills/health-video/scripts/motion_v2.mjs approve projects/video_moi SC001 SC004 SC007

BƯỚC 7 — Render video và voice một lần (không thu âm thanh từ video AI):

    node .claude/skills/health-video/scripts/motion_v2.mjs render projects/video_moi

Đầu ra: projects/video_moi/out/final_v2.mp4

Bản nháp khi còn thiếu clip dùng --draft --allow-stills, nhưng đây không phải sản phẩm “nhân vật chuyển động”:

    node .claude/skills/health-video/scripts/motion_v2.mjs render projects/video_moi --draft --allow-stills --max-scenes 20

Kiểm tra tiến độ:

    node .claude/skills/health-video/scripts/motion_v2.mjs status projects/video_moi

## DNA phong cách
- V1: minh họa 2D pastel hơi bão hòa, contournét sạch, shading tinh tế, viền khung tranh ở mép NGOÀI toàn ảnh; hình vẫn full-bleed, không chia panel.
- V2: 2D hoạt hình màu sắc đậm và rõ hơn, độ tương phản mạnh, outline sắc nét, vẫn có khung trang trí sát 4 cạnh.
- LEGACY: phong cách mannequin da xanh của dự án gốc.
- Mỗi cảnh gắn master character reference để giữ cùng một khuôn mặt, vóc dáng, tóc và trang phục.
- Nhân vật bình thường mặc quần áo đời thường, chỉ mặc đồ bác sĩ nếu có bác sĩ thật trong cảnh.
- Tránh ảnh photorealistic/3D, đầu/tay/chân biến dạng, nhòe màu, khuôn mặt thay đổi, chữ AI lỗi và nhiều icon.

## Giới hạn và nguyên tắc
Pipeline sẽ không tự tạo người biết vận động chỉ từ một ảnh nếu không có clip/video model. Scene still chỉ có chuyển động camera Ken Burns, không có cử động cơ thể. Dữ liệu render và QA không tự upload Google Drive; chưa có đăng nhập OAuth Drive trong bản nâng cấp này. Nếu muốn tạo hàng loạt có chi phí, bạn phải chủ động cấu hình và chạy.

Các file hiện có ở projects/, characters/ và bộ render HTML cũ được giữ nguyên, không bị thay thế.

## Kiểm thử offline

    node --test .claude/skills/health-video/tests/motion_v2.test.mjs


## Đạo diễn cảnh tự động V3 — KHÔNG còn một nhân vật đứng một chỗ

Từ V3, Motion V2 tích hợp scene director: phân tích từ khóa tiếng Tây Ban Nha trong
SRT để chọn bối cảnh, góc máy, hành động, đạo cụ và kỹ thuật thể hiện. Đây là
gợi ý **theo quy tắc**, không phải hiểu kịch bản hoàn toàn bằng AI; hãy duyệt từng
scene trước khi tạo ảnh.

- **Bối cảnh:** phòng khách, góc tập với ghế chắc chắn, hành lang, công viên,
  sân vườn, phòng ngủ, nhà bếp, bàn ăn, phòng khám, bàn đọc sách — phù hợp
  chủ đề chân, tim mạch, tiểu đường, bàng quang, ngủ, ăn uống hoặc tâm lý.
- **Góc nhìn:** toàn thân, trung cảnh, cận mặt, cận đồ vật, qua vai, góc nhìn từ trên,
  khung lệch 2/3 và infographic.
- **Hành động:** đi bộ, đứng lên/ngồi xuống có kiểm soát, tập cạnh ghế, chuẩn bị
  bữa ăn, cầm sách, ghi chú, nghỉ trên giường, thảo luận ở phòng khám...
  Không mặc định đứng yên, nhìn camera trong mọi cảnh.
- **Phong cách trong cảnh:** đời thường có chiều sâu, minh họa động tác,
  cận cảnh thực phẩm/đồ vật, giải phẫu, so sánh và infographic. Toàn video
  vẫn giữ **cùng DNA V1/V2**, viền ảnh và kiểu nét; không tự nhảy sang 3D.
- **Nhân vật:** khóa mặt, tuổi, hình thể và màu trang phục chính từ master reference.
  Chỉ đổi quần áo khi thật sự có lý do theo kịch bản (ví dụ đồ ngủ).
- **An toàn:** không tự bịa cải thiện bệnh lý; tư thế và dụng cụ bài tập phải theo
  tài liệu y khoa; kiểm tra clip bằng mắt.

Khi init, các file được tạo:
- `motion/scenes.json`: mỗi cảnh có setting, environment, shot, framing, mood,
  lighting, palette_treatment, wardrobe, treatment, object, action và visual;
  bạn có thể sửa từng trường để đúng nội dung.
- `motion/scene_map.md`: bảng đạo diễn toàn bộ cảnh để kiểm tra độ đa dạng trước.
- `motion/batches/batch_001_prompts.md`: prompt 20 ảnh, **mỗi ảnh một bố cục**.
- `motion/batches/batch_001_motion_prompts.md`: prompt chuyển động cho những
  scene có mode=character, cố định camera trong *một clip* nhưng đổi góc ở
  các clip kế tiếp.
- `motion/qa/report.json`: thêm thống kê số bối cảnh, góc máy,
  hành động riêng, cảnh bị lặp cả bối cảnh và góc máy.

Ví dụ khởi tạo giữ mức đa dạng cao:

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --style V1 --variety high --topic legs

Các chủ đề nhận diện tự động nếu bỏ `--topic`: legs, heart, diabetes,
bladder, sleep, food, mind, general. Nếu tự chọn, dùng đúng một từ khóa này.
Muốn bố cục nhẹ nhàng hơn, chọn `--variety balanced`.

**Điều chỉnh quan trọng:** tệp SRT chỉ có phụ đề, nên hành động do hệ thống
đề xuất có thể chưa chính xác nếu lời thoại mơ hồ hoặc có ngữ cảnh đặc biệt.
Bắt buộc mở `scene_map.md` và `scenes.json`, sửa lại những cảnh diễn
tập, biểu cảm hoặc y khoa sai ý trước khi tạo hình.



## V4 — Master Style tùy chỉnh: dùng mọi phong cách hình ảnh

**Không giới hạn ở V1/V2/LEGACY.** Bạn có thể chọn crayon, màu nước, đồ họa vector, scrapbook, anime, 3D stylized, minh họa y khoa, collage hoặc phong cách riêng bằng ảnh mẫu. Cấu hình master được dùng nhất quán cho mọi cảnh, trong khi Scene Director tiếp tục đổi địa điểm, góc máy và hành động.

### Cách 1: Chỉ có ảnh Master Style

Chuẩn bị ảnh master trên máy (PNG/JPG/WEBP). Nếu muốn giữ khuôn mặt nhân vật nhất quán, thêm ảnh nhân vật chuẩn.

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --master-image /path/style_master.png --character-image /path/carmen.png --character "Carmen, 68, grey bob hair, teal blouse"

Script sao chép ảnh vào thư mục projects/video_moi/motion/master/, lưu mô tả trong motion/scenes.json và xuất prompt có tên file tham chiếu cho TỪNG SC###. **Bạn phải đính kèm các file ảnh này khi tạo ảnh bằng ứng dụng AI**; chỉ ghi tên file trong prompt không có nghĩa ứng dụng AI đã nhìn thấy file.

### Cách 2: Tạo Master Style từ file JSON

Có sẵn file styles/master_style.template.json. Có thể điền tên, mô tả phong cách, chất liệu, bảng màu, chuyển động, negative prompt, kèm các ảnh tham chiếu. JSON có thể lưu ở GitHub và tái sử dụng cho nhiều video.

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --master styles/master_crayon.example.json

Cũng có thể dùng cả JSON và ảnh:

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --master /path/my_style.json --master-image /path/style.webp --character-image /path/character.png

Các trường JSON: id, label, image (mô tả cảnh), graphic (đồ họa/giải phẫu), motion (cách giữ style khi chuyển động), negative (lỗi riêng cần tránh), reference_images (danh sách ảnh phong cách), character_references (danh sách ảnh nhân vật). Đường dẫn bên trong JSON tương đối với vị trí file JSON.

### Giữ master xuyên suốt video

- Không ép master trở lại 2D, pastel, viền trang trí hoặc phong cách cũ.
- Không thay đổi danh tính nhân vật, phong cách nét, chất liệu và ánh sáng tùy tiện giữa các cảnh.
- Tùy chọn master có thể là 3D stylized hoặc ảnh thật. Các cấm đoán riêng của V1/V2 sẽ không áp lên master tùy chỉnh; vẫn ngăn lỗi anatomy, thêm tay/chân, đổi mặt và rung.
- Đọc motion/scene_map.md để chỉnh bố cục và hành động; đọc motion/batches/batch_001_prompts.md để tạo đúng 20 ảnh và dừng.
- Với các cảnh nhân vật chuyển động, dùng hình SC### đã duyệt làm first frame cho model image-to-video; model hiện tại không tự nhận thêm ảnh tham chiếu master khác. Duyệt clip bằng mắt.
- Nếu repository đang công khai, cân nhắc khi commit ảnh người thật, ảnh có bản quyền hoặc tài sản nhạy cảm.

**Giới hạn quan trọng:** hệ thống có thể tiếp nhận và chuyển tiếp mọi cấu hình master hợp lệ, nhưng không tự phân tích phong cách thị giác từ ảnh bằng AI. Độ chính xác còn tùy công cụ tạo hình/video có hỗ trợ ảnh tham chiếu và model của nó hay không. Đây là nâng cấp để không khóa cứng style, không phải lời bảo đảm mọi phong cách đều được mô phỏng hoàn hảo.
