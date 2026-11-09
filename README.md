# HealthyXZZS — Video sản xuất sức khỏe bằng minh họa 2D

Toolkit dựng video khoa học/sức khỏe bằng tiếng Tây Ban Nha: kịch bản, nhân vật nhất quán, chia cảnh, infographic, đồng bộ giọng đọc, render 1080p và QA.

## Mới: Motion V2 — nhân vật chuyển động thực

Đọc hướng dẫn tiếng Việt: [MOTION_V2_VI.md](MOTION_V2_VI.md).

Motion V2 là workflow bổ sung trên nhánh nâng cấp; giữ nguyên mọi dự án và engine trước đây. Ảnh 2D được tạo theo style DNA V1/V2/LEGACY, 20 ảnh mỗi batch; với cảnh có nhân vật chuyển động, sử dụng video MP4 image-to-video thật (thủ công hoặc API tùy chọn), không dùng puppet ghép khớp hoặc morph. Có kiểm tra clip, duyệt thủ công, resume, render tiếng nói một lần và bảo vệ trước việc giả định ảnh tĩnh là chuyển động thật.

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
