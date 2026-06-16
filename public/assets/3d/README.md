# Premium Golf Login 3D Assets

Place the production 3D assets here:

- `golfer.glb`
- `golf-ball.glb` (optional)
- `flag.glb` (optional)

Recommended `golfer.glb` requirements:

- Format: optimized `.glb` / `.gltf`
- Style: realistic or semi-realistic professional golfer, not cartoon/stick figure
- Licensing: client-owned or properly licensed, no watermarked stock assets
- Polycount: web optimized
- Textures: 1K or 2K max, compressed where possible
- Rig: human golfer rig suitable for swing animation
- Animation clips preferred:
  - `Idle`
  - `Aim` or `Address`
  - `Backswing`
  - `Swing`
  - `FollowThrough`
  - `Reset`

The login scene automatically attempts to load `/assets/3d/golfer.glb`.
If it is not present, the login still works, but no fake primitive golfer is rendered.
Production quality requires adding the rigged animated `golfer.glb`.
