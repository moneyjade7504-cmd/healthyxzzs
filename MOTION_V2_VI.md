
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
