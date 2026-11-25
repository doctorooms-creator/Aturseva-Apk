/**
 * REDESIGN ICON SET — line-art vectors faithful to the owner's Figma frames
 * (doc 24 §9 exact-fidelity directive). ~1.8 stroke, round caps/joins,
 * 24×24 viewBox. Rendered via react-native-svg.
 */
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Polyline, Rect } from 'react-native-svg'

export type RdIconProps = { size?: number; color?: string; strokeWidth?: number }

const defaults = { size: 24, color: '#4A4A4A', strokeWidth: 1.8 } as const

export function RdSearch({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="15.2" y1="15.2" x2="20" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  )
}

export function RdPin({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21c-4.4-4.7-6.6-8-6.6-11a6.6 6.6 0 1 1 13.2 0c0 3-2.2 6.3-6.6 11z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="1.7" fill={color} />
    </Svg>
  )
}

export function RdCalendar({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="8" y1="3" x2="8" y2="6.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="16" y1="3" x2="16" y2="6.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {[8, 12, 16].map((x) =>
        [10, 13.5, 17].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r="0.95" fill={color} />),
      )}
    </Svg>
  )
}

export function RdTooth({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 8c0-2.5 2-4 5-4s5 1.5 5 4c0 3-1 5-1.5 8-.3 1.8-1 3-2 3s-1.2-1.5-1.5-3c-.2-1-.3-1.5-1-1.5s-.8.5-1 1.5c-.3 1.5-.5 3-1.5 3s-1.7-1.2-2-3C8 13 7 11 7 8z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="18.2" cy="5" r="3" fill={color} />
      <G stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round">
        <Line x1="18.2" y1="3.6" x2="18.2" y2="6.4" />
        <Line x1="16.8" y1="5" x2="19.6" y2="5" />
      </G>
    </Svg>
  )
}

export function RdHeart({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth, shade = '#9A9A9A' }: RdIconProps & { shade?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20.5C7 16.5 4 13.4 4 9.8 4 7 6 5 8.5 5c1.4 0 2.7.7 3.5 1.8C12.8 5.7 14.1 5 15.5 5 18 5 20 7 20 9.8c0 3.6-3 6.7-8 10.7z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M9 6.2c1-1.3 2.4-1.8 3.8-1.4" stroke={shade} strokeWidth={strokeWidth} strokeLinecap="round" fill={shade} fillOpacity="0.25" />
    </Svg>
  )
}

export function RdLungs({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth, shade = '#9A9A9A' }: RdIconProps & { shade?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 8.5L9 11M12 8.5l3 2.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 11c-2.6.6-4.6 2.7-4.6 5.6 0 2 1.1 3.4 2.6 3.4 1.3 0 2-1.1 2-2.6V11z" fill={shade} fillOpacity="0.22" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M15 11c2.6.6 4.6 2.7 4.6 5.6 0 2-1.1 3.4-2.6 3.4-1.3 0-2-1.1-2-2.6V11z" fill={shade} fillOpacity="0.22" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Svg>
  )
}

export function RdBrain({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 14c-1-4 1-8 4-9 1.5-.6 3-.6 4.5 0 1.5-.6 3-.6 4.5 0 3 1 5 5 4 9-.7 3-2.5 5-5 5.5-1 .2-2-.3-3.5-.3s-2.5.5-3.5.3C7.5 19 5.7 17 5 14z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path d="M12 5.5v12.5" stroke={color} strokeWidth={strokeWidth * 0.85} strokeLinecap="round" />
      <Path d="M8 11.5c1 .3 1.7 1 2 2M16 10.5c-1 .3-1.8 1.1-2.1 2.2" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
    </Svg>
  )
}

export function RdEar({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8.5c0-3-2.4-5-5-5s-5 2-5 4.5c0 2 .8 3 2 4.4.9 1.1 1.6 1.9 1.6 3.3 0 1.6 1.1 2.6 2.6 2.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.5 10.2a2.6 2.6 0 0 0-2.4-1.9M15 12.8a5 5 0 0 0-4.2-3.6" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
    </Svg>
  )
}

export function RdEye({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth, shade = '#9A9A9A' }: RdIconProps & { shade?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      <Path d="M9.5 18.5l-.6 1.6M14.5 18.5l.6 1.6" stroke={shade} strokeWidth={strokeWidth * 0.85} strokeLinecap="round" />
    </Svg>
  )
}

export function RdStar({ size = defaults.size, color = '#E7BF40' }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" fill={color} />
    </Svg>
  )
}

export function RdStarHalf({ size = defaults.size, color = '#E7BF40', track = '#D9D9D9' }: RdIconProps & { track?: string }) {
  const half = size / 2
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" fill={track} />
      <G clipPath="url(#halfclip)">
        <Path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" fill={color} />
      </G>
      <Rect id="halfrect" x="0" y="0" width="12" height="24" fill="none" />
      <Defs>
        <ClipPath id="halfclip">
          <Rect x="0" y="0" width="12" height="24" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export function RdRupeeCircle({ size = defaults.size, fill = '#80AD69' }: RdIconProps & { fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" fill={fill} />
      <G stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 8h6" />
        <Path d="M9 11h6" />
        <Path d="M9 8c3.2 0 3.2 3 0 3l4.5 5" />
      </G>
    </Svg>
  )
}

export function RdBack({ size = defaults.size, color = '#2C2928', strokeWidth = 2 }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="20" y1="12" x2="4" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polyline points="10,6 4,12 10,18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

export function RdMap({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M9 4v14M15 6v14" stroke={color} strokeWidth={strokeWidth * 0.85} strokeLinejoin="round" />
      <Circle cx="13.6" cy="10" r="1.6" fill={color} />
    </Svg>
  )
}

export function RdSliders({ size = defaults.size, color = defaults.color, strokeWidth = 1.8 }: RdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="9" x2="20" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="4" y1="15" x2="20" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="14" cy="9" r="2.3" fill="#FFFFFF" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="8" cy="15" r="2.3" fill="#FFFFFF" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  )
}
