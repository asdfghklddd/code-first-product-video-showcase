// 中文说明：从实际编码的成片抽取 PNG，用于检查标题、转场和结尾。
// 源自本地交付检查工具；改为命令行参数，移除固定视频路径和个人目录。
// macOS 自带 AVFoundation，不依赖 FFmpeg；需要 Xcode Command Line Tools。
// 用法：swift scripts/inspect-video.swift input.mp4 out/review 0 4.5 9.9
import AVFoundation
import AppKit
import Foundation

let arguments = Array(CommandLine.arguments.dropFirst())
if arguments == ["--help"] {
    print("用法：swift scripts/inspect-video.swift <视频> <新建或空输出目录> <秒数> [秒数…]")
    exit(0)
}
func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}
guard arguments.count >= 3 else { fail("缺少参数；使用 --help 查看用法。") }
let times = arguments.dropFirst(2).compactMap(Double.init)
guard times.count == arguments.count - 2,
      times.allSatisfy({ $0.isFinite && $0 >= 0 }) else {
    fail("抽帧秒数必须是有限的非负数。")
}
let input = URL(fileURLWithPath: arguments[0])
let output = URL(fileURLWithPath: arguments[1], isDirectory: true)
let manager = FileManager.default
guard manager.fileExists(atPath: input.path) else { fail("输入视频不存在。") }
do {
    // 输出使用空目录，避免重新检查时覆盖上一批人工验收的图片。
    if manager.fileExists(atPath: output.path),
       !(try manager.contentsOfDirectory(atPath: output.path)).isEmpty {
        fail("输出目录非空，请指定新的检查目录。")
    }
    let asset = AVURLAsset(url: input)
    let duration = CMTimeGetSeconds(try await asset.load(.duration))
    guard duration.isFinite && duration > 0,
          times.allSatisfy({ $0 < duration }) else {
        fail("视频时长无效，或抽帧位置超出视频范围（结束时间不含在内）。")
    }
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.maximumSize = CGSize(width: 1280, height: 720)
    // 不用默认的关键帧附近采样；同时记录实际时间，便于识别时间取整。
    generator.requestedTimeToleranceBefore = .zero
    generator.requestedTimeToleranceAfter = .zero
    try manager.createDirectory(at: output, withIntermediateDirectories: true)
    var frames: [[String: Any]] = []
    for (index, seconds) in times.enumerated() {
        let result = try await generator.image(
            at: CMTime(seconds: seconds, preferredTimescale: 60000))
        let frame = result.image
        let actual = result.actualTime
        let image = NSBitmapImageRep(cgImage: frame)
        guard let data = image.representation(using: .png, properties: [:]) else {
            fail("无法编码抽帧图片。")
        }
        let name = String(format: "frame-%03d.png", index)
        try data.write(to: output.appendingPathComponent(name))
        frames.append(["file": name, "requestedSeconds": seconds,
                       "actualSeconds": CMTimeGetSeconds(actual),
                       "width": frame.width, "height": frame.height])
        print(name, "实际秒数", CMTimeGetSeconds(actual))
    }
    // 只记录文件名，不把本机绝对路径带入可分享的检查报告。
    let report: [String: Any] = ["input": input.lastPathComponent,
        "durationSeconds": duration, "frames": frames,
        "scope": "抽帧检查，不代表完整解码或人工画面验收已通过"]
    try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
        .write(to: output.appendingPathComponent("inspection.json"))
} catch {
    fail("抽帧失败：\(error.localizedDescription)")
}
