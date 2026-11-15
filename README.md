# HealthyXZZS — Video giải thích sức khỏe với Master Style linh hoạt

Toolkit sản xuất video khoa học/sức khỏe bằng tiếng Tây Ban Nha: đa dạng phong cách và bối cảnh, nhân vật nhất quán, chuyển động từ clip, đồng bộ giọng đọc, dựng MP4 và kiểm tra chất lượng.

## Mới: V7 — Tạo clip video chuyển động từ ảnh gửi cho Claude Code

Khi đã có ảnh SC001.png, SC002.png… do bạn tạo (bằng ChatGPT, Gemini, vẽ tay...), bạn có thể đưa chúng cho Claude Code qua một thư mục ảnh mà Claude Code truy cập được. Claude Code tự đưa các ảnh vào đúng scene của dự án, tạo prompt chuyển động cho nhân vật và môi trường, và có thể gọi model image-to-video để nhận clip MP4 thật nếu model/API đã được cấu hình và chủ động bật.

Lệnh mới (nhập ảnh + kiểm tra prompt, không phí):

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images projects/video_moi --from uploads/batch01 --batch 1 --max 3

Một ảnh có tên chưa chuẩn:

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images projects/video_moi --from uploads/my_image.png --scene SC001 --max 1

Trong Claude Code cũng có skill /animate-images để trợ lý tự kiểm tra ảnh, đối chiếu scene và chạy quy trình phù hợp. Tên file ảnh trong folder cần xác định chính xác SC###; không tự đoán thứ tự.

**Quan trọng:** Claude Code điều phối quy trình, nhưng không trực tiếp có sẵn khả năng sinh video từ pixel. Nếu bạn muốn tự động tạo MP4 thật bằng backend fal.ai đã có trong project, cần @fal-ai/client + FAL_KEY, chấp thuận chi phí, và thêm --execute. Không có backend thì chỉ nhập ảnh và chuẩn bị prompt, không phải video thật.

Bài hướng dẫn đầy đủ: [MOTION_V2_VI.md](MOTION_V2_VI.md) và [skill animate-images](.claude/skills/animate-images/SKILL.md).

## Mới: Full-bleed V6 — không còn khung tranh

Video mới **mặc định là 16:9 tràn toàn cảnh**: không khung viền, không bo góc, không khoảng trắng bao quanh. Các preset V1/V2 không còn yêu cầu khung tranh. Nếu dự án trước đây đã tạo cảnh có khung, đổi bố cục bằng lệnh:

    node .claude/skills/health-video/scripts/motion_v2.mjs frame-mode projects/video_moi --mode fullbleed

Sau đó tạo lại prompt và **ảnh/clip có viền cũ** (viền đã vẽ trong PNG/MP4 không thể biến mất chỉ vì đổi config):

    node .claude/skills/health-video/scripts/motion_v2.mjs batch projects/video_moi --index 1

Lệnh không gọi API trả phí. Ngoài `fullbleed` mặc định, vẫn có `framed` hoặc `soft-frame` nếu bạn tự chủ động chọn. Việc đổi mode làm mất trạng thái approve cũ để bạn kiểm tra và duyệt lại.

Hướng dẫn: [MOTION_V2_VI.md](MOTION_V2_VI.md).

## Mới: Living Scenes V5 — nhân vật và cảnh vật cùng chuyển động

Đã thêm lệnh `animate-live` để tạo prompt image-to-video cho các hành động nhân vật **và** chuyển động nhẹ của môi trường (lá cây, rèm cửa, hơi nước... **chỉ khi đã có trong ảnh đầu tiên**). Hỗ trợ Master Style tự chọn từ V4, bối cảnh đa dạng từ V3.

Chạy ở thư mục gốc repository (mặc định chỉ XEM prompt, **không tính phí**):

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-live projects/video_moi --batch 1 --max 3

Nếu scene có `mode=still` và bạn muốn nó thành clip phong cảnh sống động, bật `"animate_environment": true` trong `motion/scenes.json`. Có thể chỉnh `environment_motion` cho từng scene; `motion_intensity` mặc định `subtle`. Lệnh `batch` giờ xuất thêm `batch_001_live_prompts.md` để bạn tạo clip thủ công trong công cụ AI đã chọn.

**Chỉ khi bạn tự cấu hình FAL_KEY và thêm --execute**, script mới thử gọi dịch vụ video AI trả phí. Phải đưa ảnh đầu vào SC###.png vào mô hình và kiểm tra clip bằng mắt: không có công cụ nào bảo đảm tuyệt đối chuyển động tự nhiên hoặc nền không bị méo. Với clip đã duyệt, `qa`, `approve` và `render` hỗ trợ cả cảnh nhân vật và cảnh vật.

Hướng dẫn chi tiết: [MOTION_V2_VI.md](MOTION_V2_VI.md#v5--animate-live-nhân-vật-và-cảnh-vật-cùng-chuyển-động).

## Mới: Universal Master Style V4 — chọn phong cách của riêng bạn

Khi tạo video, bạn có thể dùng preset V1/V2/LEGACY hoặc **bất kỳ phong cách master do bạn cung cấp**: crayon, màu nước, scrapbook, ảnh thật, 3D stylized, anime, cartoon, collage, doodle, minh họa giải phẫu... Có thể nạp một ảnh phong cách, JSON style, hoặc cả hai; thêm ảnh nhân vật riêng nếu muốn khóa nhận diện.

Ví dụ chỉ cần ảnh master, SRT và voice:

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --master-image /path/master.png --character-image /path/character.png

Hoặc profile mẫu:

    node .claude/skills/health-video/scripts/motion_v2.mjs init projects/video_moi --srt /path/voice.srt --voice /path/voice.mp3 --master styles/master_crayon.example.json

Hệ thống lưu profile và sao chép ảnh tham chiếu vào project, thêm hướng dẫn đính kèm đúng ảnh reference trong từng prompt. **Để model thật sự nhìn thấy ảnh master, bạn vẫn phải đưa các file đó vào công cụ tạo ảnh có hỗ trợ reference image.** CLI không tự đọc nét vẽ từ ảnh hoặc bảo đảm model tái tạo mọi phong cách hoàn hảo. Scene Director V3 giữ master nhất quán trong khi đổi bối cảnh, góc máy và hành động.

Xem [MOTION_V2_VI.md](MOTION_V2_VI.md), [styles/master_style.template.json](styles/master_style.template.json) và [styles/master_crayon.example.json](styles/master_crayon.example.json).

## Mới: Motion V2 — nhân vật chuyển động thực

Đọc hướng dẫn tiếng Việt: [MOTION_V2_VI.md](MOTION_V2_VI.md).

Motion V2 là workflow bổ sung trên nhánh nâng cấp; giữ nguyên mọi dự án và engine trước đây. Ảnh được tạo theo V1/V2/LEGACY hoặc custom Master Style, tối đa 20 ảnh mỗi batch; với cảnh có nhân vật chuyển động, sử dụng video MP4 image-to-video thật (thủ công hoặc API tùy chọn), không dùng puppet ghép khớp hoặc morph. Có kiểm tra clip, duyệt thủ công, resume, render tiếng nói một lần và bảo vệ trước việc giả định ảnh tĩnh là chuyển động thật.

Cách bắt đầu:

1. Chuẩn bị SRT cùng voice và chọn DNA nhân vật (xem tài liệu hướng dẫn).
2. Khởi tạo với scripts/motion_v2.mjs init; chỉnh visual/action cho từng cảnh.
3. Chạy batch để xuất prompt cho ĐÚNG 20 ảnh rồi dừng.
4. Thêm ảnh SC###.png; tạo video cho scene mode=character dưới clips/SC###.mp4.
5. Chạy qa --frames, xem ảnh kiểm tra và approve scene rồi render.

Việc tạo clip qua API tốn tiền chỉ xảy ra nếu bạn tự cài client, cấu hình khóa và chỉ định --execute; không kích hoạt mặc định. Nếu thiếu clip động, chỉ có thể tạo preview ảnh tĩnh, không phải video có chuyển động cơ thể.

## Renderer cũ vẫn hoạt động

- reference/: 3 video demo và ANALYSIS.md.
- .claude/skills/health-video/: skill và tất cả tài liệu quy trình.
- flat/: HTML/SVG renderer với infographic.
- scripts/render_sections.mjs: dựng từng chương, ghép giọng đọc.
- projects/: các video và tài nguyên hiện có.
- characters/: library nhân vật và các thử nghiệm cũ.

Lệnh smoke test cho renderer cũ:

    bash .claude/skills/health-video/scripts/setup.sh
    cd .claude/skills/health-video/templates/example
    python3 ../../scripts/render.py timeline.json -o /tmp/example.mp4

Lệnh kiểm thử Motion V2 (offline, không tạo clip trả phí):

    node --test .claude/skills/health-video/tests/motion_v2.test.mjs
