# HealthyXZZS V8 — Claude Local Animation (không dịch vụ tạo video bên ngoài)

## Hiểu đúng khả năng

V8 để Claude Code **tự viết/chạy code** trên máy có repository, tạo video MP4 từ ảnh bạn đã đưa cho Claude. Không gọi fal.ai, Kling, Hailuo, Runway hay bất kỳ image-to-video API nào; **không yêu cầu FAL_KEY**. Dùng mã Python + thư viện Pillow và FFmpeg cài **trên máy**, chỉ để xử lý ảnh, dựng frame và nén MP4. Đây là thư viện/phần mềm dựng video cục bộ, không phải dịch vụ AI và không upload ảnh ra máy chủ.

**Ranh giới quan trọng:**
- **1 ảnh PNG/JPG phẳng:** Claude chỉ có thể tạo chuyển động **rất nhẹ** bằng kỹ thuật pixel nội bộ — nhịp thở minh họa của vùng thân trên và lá cây/rèm cửa dao động ở vùng bạn chọn. Kết quả là *micro-animation*, KHÔNG phải cử động khớp tự nhiên như người thật, không tự biết chân tay nào ở đâu.
- **Ảnh nhân vật tách thành nhiều lớp PNG trong suốt + background riêng:** Claude có thể lập trình keyframe với chuyển động các lớp, cổ/tay/đầu/đồ vật theo điểm xoay đã xác định. Đây là hoạt hình 2D có điều khiển; nếu chỉ quay lớp cứng, chuyển động có thể vẫn hơi máy móc. Để tạo động tác phức tạp (đi bộ, đứng lên, ngồi xuống, tập thể dục) cần nhiều tư thế/rig chi tiết và soát giải phẫu.
- **Không có phương pháp thuần code nào từ *một ảnh phẳng bất kỳ* mà tự suy ra chuẩn 3D cơ thể, mặt sau và các tư thế khuất, bảo đảm cử động như video AI.** V8 không được gọi một bản zoom/pan hoặc nhịp thở giả là “nhân vật đi lại tự nhiên”.

## Cài đặt một lần trên máy chạy Claude Code

Cần Node.js 20+, Python 3.10+, FFmpeg, FFprobe và Pillow:

    python3 -m pip install Pillow
    ffmpeg -version
    node --version

Không yêu cầu đăng ký tài khoản hoặc API key. Nếu máy chạy trong container không có FFmpeg, Claude Code chỉ cần cài FFmpeg bằng trình quản lý gói của hệ điều hành.

## A. Bạn gửi một ảnh đã tạo cho Claude

Ảnh đã đặt tên đúng SC### và lưu ở thư mục uploads/batch01 mà Claude Code đọc được. Dự án đã có SRT/voice và motion/scenes.json.

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images projects/video_moi --from uploads/batch01 --batch 1 --max 3 --local

Lệnh này sẽ:
1. Kiểm tra và nhập ảnh đúng mã SC### như V7, giữ nguyên file nguồn.
2. Viết file cấu hình chuyển động theo cảnh tại motion/local/SC001.json, SC002.json...
3. Nếu đã có cấu hình đủ dữ liệu, chạy Python/FFmpeg trên máy và lưu clips/SC###.mp4.
4. Nếu chỉ có ảnh phẳng và chưa biết vùng thân/tán lá, **dừng việc dựng cảnh đó** và in NEEDS SETUP. Claude Code phải xem ảnh, đánh dấu vùng rồi chạy lại. Không “tự bịa” vị trí cơ thể.

Cũng có thể dùng một ảnh tên bất kỳ:

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-from-images projects/video_moi --from uploads/hinh1.png --scene SC001 --batch 1 --max 1 --local

## B. Đã có ảnh trong projects/.../images

Chuẩn bị cấu hình V8 theo scene, không thay thế file cũ:

    node .claude/skills/health-video/scripts/motion_v2.mjs local-init projects/video_moi --batch 1 --max 3

Chọn chế độ rig nếu đã có lớp nhân vật tách biệt:

    node .claude/skills/health-video/scripts/motion_v2.mjs local-init projects/video_moi --batch 1 --max 3 --mode rig

**Quan trọng:** local-init sẽ không ghi đè JSON đã có. Chuyển từ micro sang rig bằng cách chỉnh JSON hiện hữu và chuẩn bị các file asset.

Sau khi Claude Code xem ảnh và điền vùng chuyển động hoặc lớp rig:

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-local projects/video_moi --batch 1 --max 3

Tối đa ba scene lần chạy mặc định, tối đa 20 scene/batch, không tự chạy batch tiếp theo. Cần tạo lại MP4 đã có thì backup video trước và dùng --force; lệnh sẽ xóa duyệt cũ sau khi render lại.

## C. Cấu hình 1 ảnh phẳng: micro

Ví dụ file projects/video_moi/motion/local/SC001.json:

    {
      "version": 1,
      "mode": "micro",
      "region": [0.32, 0.24, 0.67, 0.70],
      "breath_strength": 0.012,
      "ambient_regions": [
        {
          "box": [0.03, 0.06, 0.21, 0.72],
          "strength": 0.015,
          "hz": 0.25
        }
      ]
    }

Tọa độ được chuẩn hóa từ 0 đến 1 theo kích thước ảnh:
- region: [trái, trên, phải, dưới] là vùng thân nhân vật mà Claude Code phải **nhìn thấy trong ảnh và tự lựa chọn**. Không được điền vùng đoán bừa.
- breath_strength: 0.001–0.025, khuyên dùng 0.008–0.012. Chỉ là biến dạng pixel nhẹ; không có động tác tay/chân tách rời.
- ambient_regions: 0–8 vùng vật thể hiện có trong ảnh, ví dụ rèm, lá cây, tóc, ánh nắng phản chiếu. Chọn vùng nhỏ, tránh gộp cả phòng.
- strength: 0.001–0.035; hz: 0.05–1.0 (chu kỳ/giây).
- Không khuyên dùng micro cho cảnh hướng dẫn người già đứng lên, ngã, bước qua bậc hoặc các động tác yêu cầu đúng khớp xương.

Nếu chỉ muốn làm cảnh vật cử động, dùng mode=ambient và danh sách ambient_regions; bỏ region và breath_strength.

## D. Cấu hình chuyển động tay/chân thật sự trong 2D: rig

Ví dụ project/motion/local/SC001.json:

    {
      "version": 1,
      "mode": "rig",
      "background": "motion/local/SC001/background.png",
      "layers": [
        {
          "image": "motion/local/SC001/head.png",
          "pivot": [0.51, 0.31],
          "keyframes": [
            {"t": 0, "rotate": 0, "dx": 0, "dy": 0},
            {"t": 0.5, "rotate": 5, "dx": 1, "dy": 0},
            {"t": 1, "rotate": 0, "dx": 0, "dy": 0}
          ]
        },
        {
          "image": "motion/local/SC001/right_arm.png",
          "pivot": [0.58, 0.38],
          "keyframes": [
            {"t": 0, "rotate": 0, "dx": 0, "dy": 0},
            {"t": 0.5, "rotate": -10, "dx": 3, "dy": 0},
            {"t": 1, "rotate": 0, "dx": 0, "dy": 0}
          ]
        }
      ]
    }

**Yêu cầu file quan trọng:**
- background.png phải KHÔNG có nhân vật, nếu không nhân vật gốc sẽ bị “bóng ma” phía dưới lớp di chuyển.
- Mỗi layer PNG có nền trong suốt, cùng tỷ lệ/kích thước canvas 16:9, vẽ chính xác bộ phận nằm đúng vị trí trong ảnh tổng.
- pivot [x,y] là vị trí khớp quay theo tỷ lệ 0..1 toàn khung.
- keyframes phải sắp từ 0 đến 1, mỗi phần có 2–40 keyframes; rotate giới hạn 40°, dx/dy tối đa 120 px. Sử dụng nội suy ease-in/ease-out.
- Claude Code cần kiểm tra mốc vai/khuỷu/cổ/khớp gối, điểm đặt chân, chiều của lớp và che khuất. Không phải chỉ tách bừa ra rồi xoay cánh tay để gọi là tự nhiên.

Engine giữ bối cảnh full-bleed, xuất clip MP4 960×540/24fps mặc định; renderer dựng final của dự án có thể nâng 1080p nhưng không khôi phục chi tiết 1080p từ 540p. Có thể chọn đầu ra local 1280×720:

    node .claude/skills/health-video/scripts/motion_v2.mjs animate-local projects/video_moi --batch 1 --max 3 --width 1280 --height 720 --fps 24

Đầu ra cho mỗi scene: clips/SC###.mp4; trạng thái clip ở motion/progress.json ghi rõ local_mode=micro/ambient/rig. Không cần Internet.

## E. Kiểm tra và xuất video hoàn chỉnh

    node .claude/skills/health-video/scripts/motion_v2.mjs qa projects/video_moi --frames

Xem thật từng MP4, các ảnh 12% / 50% / 88%, chú ý biến dạng cơ thể, nền bị kéo, tay/chân giật, mắt/mặt sai, tư thế y khoa không an toàn. QA tự động **không kiểm tra được chất lượng động tác theo nghĩa bác sĩ**. Chỉ duyệt clip sau khi xem:

    node .claude/skills/health-video/scripts/motion_v2.mjs approve projects/video_moi SC001 SC002

Cuối cùng:

    node .claude/skills/health-video/scripts/motion_v2.mjs render projects/video_moi

Renderer có giọng đọc, xuất video MP4 16:9; các ảnh SRT/voice và công cụ V2–V7 đều được giữ nguyên. V8 không tự duyệt clip vì render thành công chỉ chứng minh **video được mã hóa**, không chứng minh nhân vật đã chuyển động giống người.

## F. Claude Code có thể tự chạy qua skill

    /local-animation projects/video_moi uploads/batch01

Skill mới trong .claude/skills/local-animation/SKILL.md yêu cầu Claude kiểm tra ảnh trước, xác định động tác đúng kịch bản, thử tạo bằng code, xem QA rồi thông báo **đúng** kết quả. Nếu ảnh không đủ dữ liệu để tách cánh tay, tạo bước đi, Claude phải nói rõ cần thêm pose hoặc lớp nhân vật; không được tuyên bố đã làm được từ một ảnh.

**Không có cloud video provider, không FAL_KEY, không ứng dụng tạo video AI khác.** Công cụ cục bộ (Pillow/FFmpeg) là các chương trình thực thi trên máy, không phải dịch vụ nhận ảnh của bạn.
