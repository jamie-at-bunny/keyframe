// AVFoundation encoder for the Keyframe renderer.
//
// Reads PNG frames from stdin, each prefixed with its byte length as a 4-byte
// big-endian integer, and writes them in order with AVAssetWriter, muxing an
// optional WAV as AAC (or LPCM for ProRes). Built and cached by render.mjs:
//
//   encode --out out.mp4 --width 1920 --height 1080 --fps 30 \
//          [--codec h264|hevc|prores] [--alpha] [--bitrate 12000000] [--audio mix.wav]
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

func fail(_ message: String) -> Never {
  FileHandle.standardError.write("encode: \(message)\n".data(using: .utf8)!)
  exit(1)
}

// ── Options ──────────────────────────────────────────────────────────────────
var opts: [String: String] = [:]
var flags = Set<String>()
var argv = CommandLine.arguments.dropFirst()
while let arg = argv.popFirst() {
  guard arg.hasPrefix("--") else { fail("unexpected argument \(arg)") }
  let name = String(arg.dropFirst(2))
  if name == "alpha" { flags.insert(name); continue }
  guard let value = argv.popFirst() else { fail("--\(name) needs a value") }
  opts[name] = value
}

guard let outPath = opts["out"], let width = Int(opts["width"] ?? ""), let height = Int(opts["height"] ?? ""),
  let fps = Int32(opts["fps"] ?? "")
else { fail("--out, --width, --height and --fps are required") }
let codec = opts["codec"] ?? "h264"
let alpha = flags.contains("alpha")
let bitrate = Int(opts["bitrate"] ?? "") ?? Int(Double(width * height * Int(fps)) * 0.2)

let outURL = URL(fileURLWithPath: outPath)
try? FileManager.default.removeItem(at: outURL)
let fileType: AVFileType = outURL.pathExtension.lowercased() == "mov" ? .mov : .mp4

// ── Video ────────────────────────────────────────────────────────────────────
let color: [String: Any] = [
  AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
  AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
  AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
]
var videoSettings: [String: Any] = [
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoColorPropertiesKey: color,
]
switch codec {
case "h264":
  if alpha { fail("h264 has no alpha channel; use --codec hevc or prores") }
  videoSettings[AVVideoCodecKey] = AVVideoCodecType.h264
  videoSettings[AVVideoCompressionPropertiesKey] = [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoExpectedSourceFrameRateKey: fps,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
  ]
case "hevc":
  videoSettings[AVVideoCodecKey] = alpha ? AVVideoCodecType.hevcWithAlpha : AVVideoCodecType.hevc
  videoSettings[AVVideoCompressionPropertiesKey] = [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoExpectedSourceFrameRateKey: fps,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
  ]
case "prores":
  videoSettings[AVVideoCodecKey] = alpha ? AVVideoCodecType.proRes4444 : AVVideoCodecType.proRes422HQ
default:
  fail("unknown codec \(codec)")
}
if codec == "prores" && fileType != .mov { fail("prores needs a .mov output") }

let writer: AVAssetWriter
do { writer = try AVAssetWriter(outputURL: outURL, fileType: fileType) } catch { fail("\(error)") }

let videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
videoInput.expectsMediaDataInRealTime = false
guard writer.canAdd(videoInput) else { fail("cannot add a \(codec) track to a .\(outURL.pathExtension) file") }
writer.add(videoInput)
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: videoInput,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
  ])

// ── Audio ────────────────────────────────────────────────────────────────────
var audioInput: AVAssetWriterInput?
var audioOutput: AVAssetReaderTrackOutput?
var audioReader: AVAssetReader?
if let audioPath = opts["audio"] {
  let asset = AVURLAsset(url: URL(fileURLWithPath: audioPath))
  guard let track = try? await asset.loadTracks(withMediaType: .audio).first else { fail("no audio track in \(audioPath)") }
  do { audioReader = try AVAssetReader(asset: asset) } catch { fail("\(error)") }
  let pcm: [String: Any] = [
    AVFormatIDKey: kAudioFormatLinearPCM,
    AVLinearPCMBitDepthKey: 16,
    AVLinearPCMIsFloatKey: false,
    AVLinearPCMIsBigEndianKey: false,
    AVLinearPCMIsNonInterleaved: false,
  ]
  let output = AVAssetReaderTrackOutput(track: track, outputSettings: pcm)
  audioReader!.add(output)
  audioOutput = output
  // ProRes masters keep the mix uncompressed; delivery files get AAC.
  let settings: [String: Any] =
    codec == "prores"
    ? pcm.merging([AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2]) { $1 }
    : [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVEncoderBitRateKey: 256_000]
  let input = AVAssetWriterInput(mediaType: .audio, outputSettings: settings)
  input.expectsMediaDataInRealTime = false
  guard writer.canAdd(input) else { fail("cannot add audio") }
  writer.add(input)
  audioInput = input
}

// ── Frames ───────────────────────────────────────────────────────────────────
func readExactly(_ count: Int) -> Data? {
  var data = Data(count: count)
  var got = 0
  let ok = data.withUnsafeMutableBytes { (buf: UnsafeMutableRawBufferPointer) -> Bool in
    while got < count {
      let n = read(0, buf.baseAddress! + got, count - got)
      if n <= 0 { return false }
      got += n
    }
    return true
  }
  return ok ? data : nil
}

func nextFrame() -> Data? {
  guard let header = readExactly(4) else { return nil }
  let length = header.reduce(0) { ($0 << 8) | Int($1) }
  guard let png = readExactly(length) else { fail("stream ended inside a frame") }
  return png
}

let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!

func pixelBuffer(from png: Data) -> CVPixelBuffer {
  // Chromium's PNGs carry no colour profile. Read them as the sRGB they are,
  // or ImageIO assumes device RGB and colour-converts every frame.
  guard let source = CGImageSourceCreateWithData(png as CFData, nil),
    let decoded = CGImageSourceCreateImageAtIndex(source, 0, nil),
    let image = decoded.copy(colorSpace: sRGB)
  else { fail("could not decode a frame") }
  guard image.width == width, image.height == height else {
    fail("frame is \(image.width)x\(image.height), expected \(width)x\(height)")
  }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  guard let buffer = pb else { fail("no pixel buffer") }
  CVPixelBufferLockBaseAddress(buffer, [])
  let ctx = CGContext(
    data: CVPixelBufferGetBaseAddress(buffer), width: width, height: height, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: sRGB,
    bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.clear(CGRect(x: 0, y: 0, width: width, height: height))
  ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
  CVPixelBufferUnlockBaseAddress(buffer, [])
  CVBufferSetAttachment(buffer, kCVImageBufferColorPrimariesKey, kCVImageBufferColorPrimaries_ITU_R_709_2, .shouldPropagate)
  CVBufferSetAttachment(buffer, kCVImageBufferTransferFunctionKey, kCVImageBufferTransferFunction_ITU_R_709_2, .shouldPropagate)
  CVBufferSetAttachment(buffer, kCVImageBufferYCbCrMatrixKey, kCVImageBufferYCbCrMatrix_ITU_R_709_2, .shouldPropagate)
  return buffer
}

// ── Write ────────────────────────────────────────────────────────────────────
guard writer.startWriting() else { fail("\(writer.error.map { "\($0)" } ?? "could not start writing")") }
writer.startSession(atSourceTime: .zero)
audioReader?.startReading()

// Feed an input from `next` (which appends one sample and returns false when
// there are none left) whenever the writer is ready for more.
final class Feed: @unchecked Sendable {
  let input: AVAssetWriterInput
  let next: () -> Bool
  init(_ input: AVAssetWriterInput, _ next: @escaping () -> Bool) {
    self.input = input
    self.next = next
  }
  func run(_ label: String) async {
    await withCheckedContinuation { (done: CheckedContinuation<Void, Never>) in
      var finished = false
      input.requestMediaDataWhenReady(on: DispatchQueue(label: label)) {
        while self.input.isReadyForMoreMediaData && !finished {
          if !self.next() {
            finished = true
            self.input.markAsFinished()
            done.resume()
          }
        }
      }
    }
  }
}

nonisolated(unsafe) var frames: Int64 = 0
let video = Feed(videoInput) {
  guard let png = nextFrame() else { return false }
  if !adaptor.append(pixelBuffer(from: png), withPresentationTime: CMTime(value: frames, timescale: fps)) {
    fail("frame \(frames): \(writer.error.map { "\($0)" } ?? "append failed")")
  }
  frames += 1
  return true
}
let audio = audioInput.map { input in
  Feed(input) {
    guard let sample = audioOutput!.copyNextSampleBuffer() else { return false }
    input.append(sample)
    return true
  }
}

async let videoFed: Void = video.run("video")
async let audioFed: Void? = audio?.run("audio")
_ = await (videoFed, audioFed)

writer.endSession(atSourceTime: CMTime(value: frames, timescale: fps))
await writer.finishWriting()
if writer.status != .completed { fail("\(writer.error.map { "\($0)" } ?? "writer status \(writer.status.rawValue)")") }
print("\(frames)")
