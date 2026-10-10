// Renders og-image.png (1200x630). Run from site/:  swift tools/og.swift og-image.png
import AppKit

let W: CGFloat = 1200, H: CGFloat = 630
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(W), pixelsHigh: Int(H), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
let ctx = NSGraphicsContext(bitmapImageRep: rep)!
NSGraphicsContext.current = ctx
let cg = ctx.cgContext
// flip to top-left origin
cg.translateBy(x: 0, y: H); cg.scaleBy(x: 1, y: -1)
func hex(_ h: UInt32, _ a: CGFloat = 1) -> NSColor { NSColor(srgbRed: CGFloat((h>>16)&255)/255, green: CGFloat((h>>8)&255)/255, blue: CGFloat(h&255)/255, alpha: a) }
let cream = hex(0xFBF6EF), ink = hex(0x2A211C), ember = hex(0xE0603A), emberText = hex(0xB04420), muted = hex(0x6E6055)

cream.setFill(); cg.fill(CGRect(x: 0, y: 0, width: W, height: H))
// glow
let space = CGColorSpace(name: CGColorSpace.sRGB)!
let glow = CGGradient(colorsSpace: space, colors: [hex(0xE0603A, 0.30).cgColor, hex(0xE0603A, 0).cgColor] as CFArray, locations: [0, 1])!
cg.drawRadialGradient(glow, startCenter: CGPoint(x: 960, y: 250), startRadius: 0, endCenter: CGPoint(x: 960, y: 250), endRadius: 520, options: [])

func text(_ s: String, _ font: NSFont, _ color: NSColor, _ x: CGFloat, _ y: CGFloat, kern: CGFloat = 0, width: CGFloat = 1000) {
    let p = NSMutableParagraphStyle(); p.lineBreakMode = .byWordWrapping
    let a = NSAttributedString(string: s, attributes: [.font: font, .foregroundColor: color, .kern: kern, .paragraphStyle: p])
    NSGraphicsContext.saveGraphicsState()
    let flipped = NSGraphicsContext(cgContext: cg, flipped: true)
    NSGraphicsContext.current = flipped
    a.draw(with: CGRect(x: x, y: y, width: width, height: 400), options: [.usesLineFragmentOrigin])
    NSGraphicsContext.restoreGraphicsState()
}
func rounded(_ r: CGRect, _ rad: CGFloat, _ fill: NSColor, shadow: Bool = false) {
    cg.saveGState()
    if shadow { cg.setShadow(offset: CGSize(width: 0, height: 18), blur: 50, color: hex(0x783214, 0.22).cgColor) }
    cg.addPath(CGPath(roundedRect: r, cornerWidth: rad, cornerHeight: rad, transform: nil)); cg.setFillColor(fill.cgColor); cg.fillPath()
    cg.restoreGState()
}

// icon
let icon = NSImage(contentsOfFile: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "../brand/icon-1024.png")!
cg.saveGState()
cg.addPath(CGPath(roundedRect: CGRect(x: 80, y: 78, width: 64, height: 64), cornerWidth: 15, cornerHeight: 15, transform: nil)); cg.clip()
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(cgContext: cg, flipped: true)
icon.draw(in: CGRect(x: 80, y: 78, width: 64, height: 64), from: .zero, operation: .sourceOver, fraction: 1, respectFlipped: true, hints: nil)
NSGraphicsContext.restoreGraphicsState()
cg.restoreGState()
text("Thensday", NSFont.systemFont(ofSize: 34, weight: .bold), ink, 160, 88, kern: -0.6)

let bold = NSFont.systemFont(ofSize: 84, weight: .heavy)
text("Make your", bold, ink, 76, 196, kern: -3.6)
text("doomscroll", bold, ink, 76, 290, kern: -3.6)
var serif = NSFont.systemFont(ofSize: 100, weight: .regular)
if let d = serif.fontDescriptor.withDesign(.serif)?.withSymbolicTraits(.italic), let f = NSFont(descriptor: d, size: 100) { serif = f }
text("count.", serif, emberText, 80, 376, kern: -2)
text("Share anything you scroll past. Thensday reads the whole reel and brings it back at the moment you'll do it.", NSFont.systemFont(ofSize: 25, weight: .regular), muted, 80, 512, width: 600)

// card
let cx: CGFloat = 770, cy: CGFloat = 96, cw: CGFloat = 352
rounded(CGRect(x: cx, y: cy, width: cw, height: 440), 34, hex(0xFFFFFF), shadow: true)
// thumbnail gradient
cg.saveGState()
let th = CGRect(x: cx + 22, y: cy + 22, width: cw - 44, height: 130)
cg.addPath(CGPath(roundedRect: th, cornerWidth: 20, cornerHeight: 20, transform: nil)); cg.clip()
let g = CGGradient(colorsSpace: space, colors: [hex(0xF2A65A).cgColor, hex(0xE0603A).cgColor, hex(0x6A2824).cgColor] as CFArray, locations: [0, 0.5, 1])!
cg.drawLinearGradient(g, start: CGPoint(x: th.minX, y: th.minY), end: CGPoint(x: th.maxX, y: th.maxY), options: [])
let sun = CGGradient(colorsSpace: space, colors: [hex(0xFFE3B0, 0.95).cgColor, hex(0xFFC074, 0).cgColor] as CFArray, locations: [0, 1])!
cg.drawRadialGradient(sun, startCenter: CGPoint(x: th.midX, y: th.minY + 50), startRadius: 0, endCenter: CGPoint(x: th.midX, y: th.minY + 50), endRadius: 80, options: [])
cg.restoreGState()
// read badge
rounded(CGRect(x: cx + cw - 104, y: cy + 34, width: 72, height: 28), 14, hex(0xE7F2EA))
text("Read ✓", NSFont.systemFont(ofSize: 15, weight: .bold), hex(0x24693F), cx + cw - 94, cy + 38)
text("Café Lume — slow brunch in Alfama", NSFont.systemFont(ofSize: 23, weight: .bold), ink, cx + 24, cy + 168, kern: -0.4, width: cw - 48)
text("Go before 9; the pastel de nata is €1.80.", NSFont.systemFont(ofSize: 17), muted, cx + 24, cy + 232, width: cw - 48)
// pills
var px = cx + 24
for s in ["Alfama, Lisbon", "€1.80", "Before 9am"] {
    let f = NSFont.systemFont(ofSize: 15, weight: .semibold)
    let w = (s as NSString).size(withAttributes: [.font: f]).width + 24
    rounded(CGRect(x: px, y: cy + 286, width: w, height: 32), 16, hex(0xF1E7DA))
    text(s, f, hex(0x3A2E26), px + 12, cy + 292)
    px += w + 8
}
// moment
rounded(CGRect(x: cx + 22, y: cy + 344, width: cw - 44, height: 74), 22, ink)
rounded(CGRect(x: cx + 36, y: cy + 358, width: 46, height: 46), 13, ember)
cg.setStrokeColor(NSColor.white.cgColor); cg.setLineWidth(3); cg.setLineCap(.round)
cg.move(to: CGPoint(x: cx + 47, y: cy + 389)); cg.addLine(to: CGPoint(x: cx + 71, y: cy + 389))
cg.addArc(center: CGPoint(x: cx + 59, y: cy + 389), radius: 7, startAngle: .pi, endAngle: 0, clockwise: false)
cg.strokePath()
text("Saturday morning", NSFont.systemFont(ofSize: 19, weight: .bold), cream, cx + 96, cy + 357)
text("Open in Maps", NSFont.systemFont(ofSize: 16, weight: .semibold), hex(0xF7A07F), cx + 96, cy + 383)

NSGraphicsContext.restoreGraphicsState()
let png = rep.representation(using: .png, properties: [:])!
try! png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
print("ok")
