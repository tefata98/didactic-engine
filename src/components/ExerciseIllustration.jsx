import { useMemo } from 'react';

const COLORS = {
  figure: '#e2e8f0',
  band: '#a78bfa',
  arrow: '#22c55e',
  label: '#94a3b8',
  ground: 'rgba(148,163,184,0.2)',
  anchor: '#64748b',
};

const BAND_WIDTH = 3;
const FIGURE_WIDTH = 2;

/* ------------------------------------------------------------------ */
/*  Shared drawing helpers                                             */
/* ------------------------------------------------------------------ */

/** Simple stick-figure head */
function Head({ cx, cy, r = 6 }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.figure} strokeWidth={FIGURE_WIDTH} />;
}

/** Torso rectangle (slightly rounded) */
function Torso({ x, y, w = 10, h = 22 }) {
  return (
    <rect
      x={x - w / 2}
      y={y}
      width={w}
      height={h}
      rx={2}
      fill="rgba(226,232,240,0.15)"
      stroke={COLORS.figure}
      strokeWidth={FIGURE_WIDTH}
    />
  );
}

/** A single limb line */
function Limb({ x1, y1, x2, y2 }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={COLORS.figure}
      strokeWidth={FIGURE_WIDTH}
      strokeLinecap="round"
    />
  );
}

/** Resistance band path */
function Band({ d, dashed = false }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={COLORS.band}
      strokeWidth={BAND_WIDTH}
      strokeLinecap="round"
      strokeDasharray={dashed ? '4 3' : 'none'}
    />
  );
}

/** Resistance band line */
function BandLine({ x1, y1, x2, y2 }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={COLORS.band}
      strokeWidth={BAND_WIDTH}
      strokeLinecap="round"
    />
  );
}

/** Movement arrow */
function Arrow({ x1, y1, x2, y2, curved = false }) {
  const id = `arr-${x1}-${y1}-${x2}-${y2}`;
  if (curved) {
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 8;
    return (
      <g>
        <defs>
          <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill={COLORS.arrow} />
          </marker>
        </defs>
        <path
          d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
          fill="none"
          stroke={COLORS.arrow}
          strokeWidth={1.5}
          markerEnd={`url(#${id})`}
        />
      </g>
    );
  }
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill={COLORS.arrow} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={COLORS.arrow}
        strokeWidth={1.5}
        markerEnd={`url(#${id})`}
      />
    </g>
  );
}

/** Small anchor indicator (wall/floor dot) */
function AnchorPoint({ cx, cy }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={3} fill={COLORS.anchor} />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke={COLORS.anchor} strokeWidth={1} />
    </>
  );
}

/** Ground line */
function Ground({ y, x1 = 5, x2 = 115 }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={COLORS.ground} strokeWidth={1} />;
}

/* ------------------------------------------------------------------ */
/*  Exercise Illustrations                                             */
/*  Each returns JSX for start (left) and end (right) frames          */
/*  Coordinate system: each frame is ~120 wide, ~100 tall             */
/*  Left frame offset: 0, Right frame offset: 130                     */
/* ------------------------------------------------------------------ */

const FRAME_OFFSET = 130;

function drawPushups() {
  return {
    bandSetup: 'Band across upper back, ends under palms',
    start: (
      <g>
        {/* Plank, arms bent, chest near ground */}
        <Ground y={82} x1={5} x2={115} />
        <Head cx={85} cy={50} r={5} />
        <Limb x1={80} y1={54} x2={60} y2={58} /> {/* torso angled */}
        {/* Arms bent */}
        <Limb x1={80} y1={58} x2={78} y2={70} />
        <Limb x1={78} y1={70} x2={82} y2={80} />
        <Limb x1={65} y1={58} x2={62} y2={70} />
        <Limb x1={62} y1={70} x2={58} y2={80} />
        {/* Legs straight */}
        <Limb x1={40} y1={60} x2={35} y2={80} />
        <Limb x1={40} y1={60} x2={30} y2={80} />
        {/* Band across back */}
        <Band d="M58,80 Q60,52 82,80" />
        <Arrow x1={75} y1={48} x2={75} y2={38} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        {/* Arms extended, body higher */}
        <Ground y={82} x1={5} x2={115} />
        <Head cx={85} cy={38} r={5} />
        <Limb x1={80} y1={42} x2={60} y2={48} /> {/* torso */}
        {/* Arms straight */}
        <Limb x1={80} y1={46} x2={82} y2={80} />
        <Limb x1={65} y1={48} x2={58} y2={80} />
        {/* Legs straight */}
        <Limb x1={40} y1={50} x2={35} y2={80} />
        <Limb x1={40} y1={50} x2={30} y2={80} />
        {/* Band stretched across back */}
        <Band d="M58,80 Q68,38 82,80" />
      </g>
    ),
  };
}

function drawOhp() {
  return {
    bandSetup: 'Stand on band, press overhead',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={22} r={5} />
        <Torso x={60} y={28} w={10} h={24} />
        {/* Arms at shoulders */}
        <Limb x1={55} y1={32} x2={46} y2={34} />
        <Limb x1={46} y1={34} x2={46} y2={28} />
        <Limb x1={65} y1={32} x2={74} y2={34} />
        <Limb x1={74} y1={34} x2={74} y2={28} />
        {/* Legs */}
        <Limb x1={57} y1={52} x2={52} y2={72} />
        <Limb x1={52} y1={72} x2={50} y2={88} />
        <Limb x1={63} y1={52} x2={68} y2={72} />
        <Limb x1={68} y1={72} x2={70} y2={88} />
        {/* Band from feet up to hands */}
        <BandLine x1={50} y1={88} x2={46} y2={28} />
        <BandLine x1={70} y1={88} x2={74} y2={28} />
        <Arrow x1={46} y1={28} x2={46} y2={14} />
        <Arrow x1={74} y1={28} x2={74} y2={14} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={22} r={5} />
        <Torso x={60} y={28} w={10} h={24} />
        {/* Arms overhead */}
        <Limb x1={55} y1={30} x2={50} y2={18} />
        <Limb x1={50} y1={18} x2={52} y2={8} />
        <Limb x1={65} y1={30} x2={70} y2={18} />
        <Limb x1={70} y1={18} x2={68} y2={8} />
        {/* Legs */}
        <Limb x1={57} y1={52} x2={52} y2={72} />
        <Limb x1={52} y1={72} x2={50} y2={88} />
        <Limb x1={63} y1={52} x2={68} y2={72} />
        <Limb x1={68} y1={72} x2={70} y2={88} />
        {/* Band stretched overhead */}
        <BandLine x1={50} y1={88} x2={52} y2={8} />
        <BandLine x1={70} y1={88} x2={68} y2={8} />
      </g>
    ),
  };
}

function drawFlyes() {
  return {
    bandSetup: 'Anchor behind at chest height',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={42} />
        <Head cx={70} cy={22} r={5} />
        <Torso x={70} y={28} w={10} h={24} />
        {/* Arms wide open */}
        <Limb x1={65} y1={34} x2={52} y2={32} />
        <Limb x1={52} y1={32} x2={40} y2={36} />
        <Limb x1={75} y1={34} x2={88} y2={32} />
        <Limb x1={88} y1={32} x2={100} y2={36} />
        {/* Legs */}
        <Limb x1={67} y1={52} x2={62} y2={72} />
        <Limb x1={62} y1={72} x2={60} y2={88} />
        <Limb x1={73} y1={52} x2={78} y2={72} />
        <Limb x1={78} y1={72} x2={80} y2={88} />
        {/* Band from anchor to each hand */}
        <Band d="M10,42 L40,36" />
        <Band d="M10,42 L100,36" />
        <Arrow x1={40} y1={36} x2={60} y2={38} />
        <Arrow x1={100} y1={36} x2={80} y2={38} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={42} />
        <Head cx={70} cy={22} r={5} />
        <Torso x={70} y={28} w={10} h={24} />
        {/* Arms together in front */}
        <Limb x1={65} y1={34} x2={58} y2={36} />
        <Limb x1={58} y1={36} x2={64} y2={42} />
        <Limb x1={75} y1={34} x2={82} y2={36} />
        <Limb x1={82} y1={36} x2={76} y2={42} />
        {/* Legs */}
        <Limb x1={67} y1={52} x2={62} y2={72} />
        <Limb x1={62} y1={72} x2={60} y2={88} />
        <Limb x1={73} y1={52} x2={78} y2={72} />
        <Limb x1={78} y1={72} x2={80} y2={88} />
        {/* Band from anchor to hands (together) */}
        <Band d="M10,42 L64,42" />
        <Band d="M10,42 L76,42" />
      </g>
    ),
  };
}

function drawTricepExt() {
  return {
    bandSetup: 'Anchor overhead, extend arms forward',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={15} cy={8} />
        <Head cx={60} cy={22} r={5} />
        <Torso x={60} y={28} w={10} h={24} />
        {/* Arms bent behind head */}
        <Limb x1={55} y1={32} x2={48} y2={26} />
        <Limb x1={48} y1={26} x2={42} y2={20} />
        <Limb x1={65} y1={32} x2={72} y2={26} />
        <Limb x1={72} y1={26} x2={78} y2={20} />
        {/* Legs */}
        <Limb x1={57} y1={52} x2={52} y2={72} />
        <Limb x1={52} y1={72} x2={50} y2={88} />
        <Limb x1={63} y1={52} x2={68} y2={72} />
        <Limb x1={68} y1={72} x2={70} y2={88} />
        {/* Band from overhead anchor to hands */}
        <Band d="M15,8 L42,20" />
        <Band d="M15,8 L78,20" />
        <Arrow x1={42} y1={20} x2={42} y2={38} />
        <Arrow x1={78} y1={20} x2={78} y2={38} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={15} cy={8} />
        <Head cx={60} cy={22} r={5} />
        <Torso x={60} y={28} w={10} h={24} />
        {/* Arms extended forward */}
        <Limb x1={55} y1={34} x2={50} y2={38} />
        <Limb x1={50} y1={38} x2={48} y2={46} />
        <Limb x1={65} y1={34} x2={70} y2={38} />
        <Limb x1={70} y1={38} x2={72} y2={46} />
        {/* Legs */}
        <Limb x1={57} y1={52} x2={52} y2={72} />
        <Limb x1={52} y1={72} x2={50} y2={88} />
        <Limb x1={63} y1={52} x2={68} y2={72} />
        <Limb x1={68} y1={72} x2={70} y2={88} />
        {/* Band stretched from anchor to extended hands */}
        <Band d="M15,8 L48,46" />
        <Band d="M15,8 L72,46" />
      </g>
    ),
  };
}

function drawPlankPull() {
  return {
    bandSetup: 'Anchor low, plank + alternating arm pull',
    start: (
      <g>
        <Ground y={82} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={78} />
        <Head cx={90} cy={40} r={5} />
        {/* Plank body */}
        <Limb x1={86} y1={44} x2={55} y2={50} /> {/* torso */}
        {/* Supporting arm */}
        <Limb x1={82} y1={48} x2={86} y2={80} />
        {/* Pulling arm - reaching forward */}
        <Limb x1={78} y1={46} x2={68} y2={50} />
        <Limb x1={68} y1={50} x2={58} y2={56} />
        {/* Legs */}
        <Limb x1={38} y1={52} x2={32} y2={80} />
        <Limb x1={38} y1={52} x2={26} y2={80} />
        {/* Band from anchor to reaching hand */}
        <Band d="M10,78 L58,56" />
        <Arrow x1={58} y1={56} x2={72} y2={46} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={82} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={78} />
        <Head cx={90} cy={40} r={5} />
        {/* Plank body */}
        <Limb x1={86} y1={44} x2={55} y2={50} />
        {/* Supporting arm */}
        <Limb x1={82} y1={48} x2={86} y2={80} />
        {/* Pulled arm - at ribcage */}
        <Limb x1={78} y1={46} x2={80} y2={50} />
        <Limb x1={80} y1={50} x2={84} y2={48} />
        {/* Legs */}
        <Limb x1={38} y1={52} x2={32} y2={80} />
        <Limb x1={38} y1={52} x2={26} y2={80} />
        {/* Band stretched to ribcage */}
        <Band d="M10,78 L84,48" />
      </g>
    ),
  };
}

function drawSquats() {
  return {
    bandSetup: 'Stand on band, hold at shoulders',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={32} r={5} />
        <Torso x={60} y={38} w={10} h={18} />
        {/* Arms holding band at shoulders */}
        <Limb x1={55} y1={40} x2={48} y2={40} />
        <Limb x1={65} y1={40} x2={72} y2={40} />
        {/* Legs - squatted */}
        <Limb x1={57} y1={56} x2={46} y2={64} />
        <Limb x1={46} y1={64} x2={48} y2={80} />
        <Limb x1={63} y1={56} x2={74} y2={64} />
        <Limb x1={74} y1={64} x2={72} y2={80} />
        {/* Feet on ground */}
        <Limb x1={48} y1={80} x2={44} y2={88} />
        <Limb x1={72} y1={80} x2={76} y2={88} />
        {/* Band from feet to hands */}
        <BandLine x1={44} y1={88} x2={48} y2={40} />
        <BandLine x1={76} y1={88} x2={72} y2={40} />
        <Arrow x1={60} y1={36} x2={60} y2={22} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms at shoulders */}
        <Limb x1={55} y1={24} x2={48} y2={24} />
        <Limb x1={65} y1={24} x2={72} y2={24} />
        {/* Legs straight */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band from feet to hands */}
        <BandLine x1={52} y1={88} x2={48} y2={24} />
        <BandLine x1={68} y1={88} x2={72} y2={24} />
      </g>
    ),
  };
}

function drawRdl() {
  return {
    bandSetup: 'Stand on band, hip hinge',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={80} cy={38} r={5} />
        {/* Torso hinged forward */}
        <Limb x1={76} y1={42} x2={55} y2={50} />
        {/* Arms hanging down with band */}
        <Limb x1={65} y1={46} x2={62} y2={60} />
        <Limb x1={70} y1={44} x2={68} y2={58} />
        {/* Legs mostly straight */}
        <Limb x1={55} y1={50} x2={52} y2={70} />
        <Limb x1={52} y1={70} x2={50} y2={88} />
        <Limb x1={55} y1={50} x2={58} y2={70} />
        <Limb x1={58} y1={70} x2={60} y2={88} />
        {/* Band from feet to hands */}
        <BandLine x1={50} y1={88} x2={62} y2={60} />
        <BandLine x1={60} y1={88} x2={68} y2={58} />
        <Arrow x1={80} y1={38} x2={80} y2={22} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms down by sides */}
        <Limb x1={55} y1={30} x2={48} y2={46} />
        <Limb x1={65} y1={30} x2={72} y2={46} />
        {/* Legs straight */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band from feet to hands */}
        <BandLine x1={52} y1={88} x2={48} y2={46} />
        <BandLine x1={68} y1={88} x2={72} y2={46} />
      </g>
    ),
  };
}

function drawLateralWalks() {
  return {
    bandSetup: 'Mini band above knees, side step',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={55} cy={14} r={5} />
        <Torso x={55} y={20} w={10} h={22} />
        {/* Arms on hips */}
        <Limb x1={50} y1={28} x2={44} y2={34} />
        <Limb x1={44} y1={34} x2={48} y2={30} />
        <Limb x1={60} y1={28} x2={66} y2={34} />
        <Limb x1={66} y1={34} x2={62} y2={30} />
        {/* Legs together, slight squat */}
        <Limb x1={52} y1={42} x2={48} y2={62} />
        <Limb x1={48} y1={62} x2={48} y2={88} />
        <Limb x1={58} y1={42} x2={62} y2={62} />
        <Limb x1={62} y1={62} x2={62} y2={88} />
        {/* Mini band above knees */}
        <Band d="M48,60 Q55,56 62,60" />
        <Band d="M48,60 Q55,64 62,60" />
        <Arrow x1={65} y1={76} x2={80} y2={76} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={55} cy={14} r={5} />
        <Torso x={55} y={20} w={10} h={22} />
        {/* Arms on hips */}
        <Limb x1={50} y1={28} x2={44} y2={34} />
        <Limb x1={44} y1={34} x2={48} y2={30} />
        <Limb x1={60} y1={28} x2={66} y2={34} />
        <Limb x1={66} y1={34} x2={62} y2={30} />
        {/* Legs apart - stepped out */}
        <Limb x1={52} y1={42} x2={40} y2={62} />
        <Limb x1={40} y1={62} x2={38} y2={88} />
        <Limb x1={58} y1={42} x2={72} y2={62} />
        <Limb x1={72} y1={62} x2={74} y2={88} />
        {/* Mini band stretched above knees */}
        <Band d="M40,60 Q55,52 72,60" />
        <Band d="M40,60 Q55,68 72,60" />
      </g>
    ),
  };
}

function drawGluteBridges() {
  return {
    bandSetup: 'Band above knees, bridge hips up',
    start: (
      <g>
        <Ground y={86} x1={5} x2={115} />
        {/* Lying on back, hips down */}
        <Head cx={20} cy={76} r={5} />
        {/* Back on ground */}
        <Limb x1={25} y1={78} x2={58} y2={82} />
        {/* Arms flat */}
        <Limb x1={30} y1={78} x2={28} y2={84} />
        <Limb x1={40} y1={80} x2={38} y2={84} />
        {/* Legs bent, feet on ground */}
        <Limb x1={58} y1={82} x2={72} y2={70} />
        <Limb x1={72} y1={70} x2={78} y2={84} />
        <Limb x1={58} y1={82} x2={80} y2={70} />
        <Limb x1={80} y1={70} x2={86} y2={84} />
        {/* Band above knees */}
        <Band d="M68,72 Q74,66 78,72" />
        <Band d="M68,72 Q74,78 78,72" />
        <Arrow x1={58} y1={82} x2={58} y2={68} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={86} x1={5} x2={115} />
        {/* Lying, hips raised */}
        <Head cx={20} cy={76} r={5} />
        {/* Torso angled up */}
        <Limb x1={25} y1={78} x2={58} y2={66} />
        {/* Arms flat */}
        <Limb x1={30} y1={78} x2={28} y2={84} />
        <Limb x1={40} y1={80} x2={38} y2={84} />
        {/* Legs bent, feet on ground, hips up */}
        <Limb x1={58} y1={66} x2={72} y2={66} />
        <Limb x1={72} y1={66} x2={78} y2={84} />
        <Limb x1={58} y1={66} x2={80} y2={66} />
        <Limb x1={80} y1={66} x2={86} y2={84} />
        {/* Band above knees, pushed apart */}
        <Band d="M68,66 Q74,60 78,66" />
        <Band d="M68,66 Q74,72 78,66" />
      </g>
    ),
  };
}

function drawCalfRaises() {
  return {
    bandSetup: 'Stand on band, raise onto toes',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms down holding band */}
        <Limb x1={55} y1={28} x2={48} y2={44} />
        <Limb x1={65} y1={28} x2={72} y2={44} />
        {/* Legs straight, flat feet */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={84} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={84} />
        {/* Feet flat */}
        <Limb x1={48} y1={84} x2={56} y2={88} />
        <Limb x1={64} y1={84} x2={72} y2={88} />
        {/* Band under feet to hands */}
        <BandLine x1={52} y1={88} x2={48} y2={44} />
        <BandLine x1={68} y1={88} x2={72} y2={44} />
        <Arrow x1={60} y1={86} x2={60} y2={76} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={8} r={5} />
        <Torso x={60} y={14} w={10} h={24} />
        {/* Arms down holding band */}
        <Limb x1={55} y1={22} x2={48} y2={38} />
        <Limb x1={65} y1={22} x2={72} y2={38} />
        {/* Legs straight, on toes */}
        <Limb x1={57} y1={38} x2={54} y2={60} />
        <Limb x1={54} y1={60} x2={54} y2={78} />
        <Limb x1={63} y1={38} x2={66} y2={60} />
        <Limb x1={66} y1={60} x2={66} y2={78} />
        {/* On toes (heels raised) */}
        <Limb x1={52} y1={78} x2={54} y2={84} />
        <Limb x1={64} y1={78} x2={66} y2={84} />
        {/* Band under toes to hands */}
        <BandLine x1={54} y1={84} x2={48} y2={38} />
        <BandLine x1={66} y1={84} x2={72} y2={38} />
      </g>
    ),
  };
}

function drawRows() {
  return {
    bandSetup: 'Anchor at chest height, pull to ribs',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={40} />
        <Head cx={70} cy={18} r={5} />
        <Torso x={70} y={24} w={10} h={24} />
        {/* Arms extended forward */}
        <Limb x1={65} y1={32} x2={54} y2={34} />
        <Limb x1={54} y1={34} x2={40} y2={38} />
        <Limb x1={75} y1={32} x2={54} y2={36} />
        <Limb x1={54} y1={36} x2={40} y2={42} />
        {/* Legs */}
        <Limb x1={67} y1={48} x2={62} y2={68} />
        <Limb x1={62} y1={68} x2={60} y2={88} />
        <Limb x1={73} y1={48} x2={78} y2={68} />
        <Limb x1={78} y1={68} x2={80} y2={88} />
        {/* Band from anchor to hands */}
        <BandLine x1={10} y1={40} x2={40} y2={38} />
        <BandLine x1={10} y1={40} x2={40} y2={42} />
        <Arrow x1={40} y1={38} x2={58} y2={36} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={40} />
        <Head cx={70} cy={18} r={5} />
        <Torso x={70} y={24} w={10} h={24} />
        {/* Arms pulled back to ribs */}
        <Limb x1={65} y1={34} x2={62} y2={38} />
        <Limb x1={62} y1={38} x2={64} y2={42} />
        <Limb x1={75} y1={34} x2={78} y2={38} />
        <Limb x1={78} y1={38} x2={76} y2={42} />
        {/* Legs */}
        <Limb x1={67} y1={48} x2={62} y2={68} />
        <Limb x1={62} y1={68} x2={60} y2={88} />
        <Limb x1={73} y1={48} x2={78} y2={68} />
        <Limb x1={78} y1={68} x2={80} y2={88} />
        {/* Band from anchor to pulled hands */}
        <BandLine x1={10} y1={40} x2={64} y2={42} />
        <BandLine x1={10} y1={40} x2={76} y2={42} />
      </g>
    ),
  };
}

function drawFacePulls() {
  return {
    bandSetup: 'Anchor at face height, pull to face',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={26} />
        <Head cx={70} cy={18} r={5} />
        <Torso x={70} y={24} w={10} h={24} />
        {/* Arms extended forward */}
        <Limb x1={65} y1={30} x2={52} y2={28} />
        <Limb x1={52} y1={28} x2={38} y2={26} />
        <Limb x1={75} y1={30} x2={52} y2={30} />
        <Limb x1={52} y1={30} x2={38} y2={30} />
        {/* Legs */}
        <Limb x1={67} y1={48} x2={62} y2={68} />
        <Limb x1={62} y1={68} x2={60} y2={88} />
        <Limb x1={73} y1={48} x2={78} y2={68} />
        <Limb x1={78} y1={68} x2={80} y2={88} />
        {/* Band */}
        <BandLine x1={10} y1={26} x2={38} y2={26} />
        <BandLine x1={10} y1={26} x2={38} y2={30} />
        <Arrow x1={38} y1={26} x2={56} y2={20} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <AnchorPoint cx={10} cy={26} />
        <Head cx={70} cy={18} r={5} />
        <Torso x={70} y={24} w={10} h={24} />
        {/* Arms pulled to face, externally rotated (hands up) */}
        <Limb x1={65} y1={28} x2={58} y2={24} />
        <Limb x1={58} y1={24} x2={56} y2={14} />
        <Limb x1={75} y1={28} x2={82} y2={24} />
        <Limb x1={82} y1={24} x2={84} y2={14} />
        {/* Legs */}
        <Limb x1={67} y1={48} x2={62} y2={68} />
        <Limb x1={62} y1={68} x2={60} y2={88} />
        <Limb x1={73} y1={48} x2={78} y2={68} />
        <Limb x1={78} y1={68} x2={80} y2={88} />
        {/* Band to face area */}
        <BandLine x1={10} y1={26} x2={56} y2={14} />
        <BandLine x1={10} y1={26} x2={84} y2={14} />
      </g>
    ),
  };
}

function drawBicepCurls() {
  return {
    bandSetup: 'Stand on band, curl up',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms straight down */}
        <Limb x1={55} y1={28} x2={48} y2={36} />
        <Limb x1={48} y1={36} x2={46} y2={50} />
        <Limb x1={65} y1={28} x2={72} y2={36} />
        <Limb x1={72} y1={36} x2={74} y2={50} />
        {/* Legs */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band from feet to hands */}
        <BandLine x1={52} y1={88} x2={46} y2={50} />
        <BandLine x1={68} y1={88} x2={74} y2={50} />
        <Arrow x1={46} y1={50} x2={46} y2={34} />
        <Arrow x1={74} y1={50} x2={74} y2={34} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms curled up */}
        <Limb x1={55} y1={28} x2={48} y2={36} />
        <Limb x1={48} y1={36} x2={50} y2={26} />
        <Limb x1={65} y1={28} x2={72} y2={36} />
        <Limb x1={72} y1={36} x2={70} y2={26} />
        {/* Legs */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band stretched from feet to curled hands */}
        <BandLine x1={52} y1={88} x2={50} y2={26} />
        <BandLine x1={68} y1={88} x2={70} y2={26} />
      </g>
    ),
  };
}

function drawPullAparts() {
  return {
    bandSetup: 'Hold band at chest height, pull apart',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms extended forward, close together */}
        <Limb x1={55} y1={30} x2={50} y2={34} />
        <Limb x1={50} y1={34} x2={46} y2={36} />
        <Limb x1={65} y1={30} x2={70} y2={34} />
        <Limb x1={70} y1={34} x2={74} y2={36} />
        {/* Legs */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band between hands */}
        <BandLine x1={46} y1={36} x2={74} y2={36} />
        <Arrow x1={46} y1={36} x2={32} y2={36} />
        <Arrow x1={74} y1={36} x2={88} y2={36} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={14} r={5} />
        <Torso x={60} y={20} w={10} h={24} />
        {/* Arms pulled wide apart */}
        <Limb x1={55} y1={30} x2={42} y2={32} />
        <Limb x1={42} y1={32} x2={28} y2={34} />
        <Limb x1={65} y1={30} x2={78} y2={32} />
        <Limb x1={78} y1={32} x2={92} y2={34} />
        {/* Legs */}
        <Limb x1={57} y1={44} x2={54} y2={66} />
        <Limb x1={54} y1={66} x2={52} y2={88} />
        <Limb x1={63} y1={44} x2={66} y2={66} />
        <Limb x1={66} y1={66} x2={68} y2={88} />
        {/* Band stretched between hands */}
        <Band d="M28,34 Q60,28 92,34" />
      </g>
    ),
  };
}

function drawDeadBugs() {
  return {
    bandSetup: 'Lying, band on hands/feet, extend opposite limbs',
    start: (
      <g>
        <Ground y={86} x1={5} x2={115} />
        {/* Lying on back */}
        <Head cx={20} cy={76} r={5} />
        {/* Back on ground */}
        <Limb x1={25} y1={78} x2={60} y2={80} />
        {/* Arms and legs up (starting position - all limbs up) */}
        <Limb x1={35} y1={78} x2={32} y2={62} />
        <Limb x1={32} y1={62} x2={30} y2={52} />
        <Limb x1={45} y1={78} x2={42} y2={62} />
        <Limb x1={42} y1={62} x2={40} y2={52} />
        {/* Legs up */}
        <Limb x1={60} y1={80} x2={68} y2={66} />
        <Limb x1={68} y1={66} x2={72} y2={54} />
        <Limb x1={60} y1={80} x2={76} y2={66} />
        <Limb x1={76} y1={66} x2={80} y2={54} />
        {/* Band connecting opposite hand-foot */}
        <Band d="M30,52 Q50,44 72,54" />
        <Band d="M40,52 Q60,44 80,54" />
        <Arrow x1={30} y1={52} x2={22} y2={62} />
        <Arrow x1={80} y1={54} x2={90} y2={68} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={86} x1={5} x2={115} />
        {/* Lying on back */}
        <Head cx={20} cy={76} r={5} />
        <Limb x1={25} y1={78} x2={60} y2={80} />
        {/* Left arm extended back (over head), right arm up */}
        <Limb x1={35} y1={78} x2={28} y2={76} />
        <Limb x1={28} y1={76} x2={18} y2={82} />
        <Limb x1={45} y1={78} x2={42} y2={62} />
        <Limb x1={42} y1={62} x2={40} y2={52} />
        {/* Right leg extended out, left leg up */}
        <Limb x1={60} y1={80} x2={68} y2={66} />
        <Limb x1={68} y1={66} x2={72} y2={54} />
        <Limb x1={60} y1={80} x2={76} y2={80} />
        <Limb x1={76} y1={80} x2={92} y2={82} />
        {/* Band connecting remaining up limbs */}
        <Band d="M40,52 Q56,44 72,54" />
        {/* Extended limbs band (stretched) */}
        <Band d="M18,82 Q54,72 92,82" dashed />
      </g>
    ),
  };
}

function drawGeneric() {
  return {
    bandSetup: 'Resistance band exercise',
    start: (
      <g>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={18} r={5} />
        <Torso x={60} y={24} w={10} h={22} />
        <Limb x1={55} y1={30} x2={44} y2={40} />
        <Limb x1={65} y1={30} x2={76} y2={40} />
        <Limb x1={57} y1={46} x2={52} y2={68} />
        <Limb x1={52} y1={68} x2={50} y2={88} />
        <Limb x1={63} y1={46} x2={68} y2={68} />
        <Limb x1={68} y1={68} x2={70} y2={88} />
        <BandLine x1={44} y1={40} x2={76} y2={40} />
        <Arrow x1={60} y1={40} x2={60} y2={28} />
      </g>
    ),
    end: (
      <g transform={`translate(${FRAME_OFFSET},0)`}>
        <Ground y={90} x1={5} x2={115} />
        <Head cx={60} cy={18} r={5} />
        <Torso x={60} y={24} w={10} h={22} />
        <Limb x1={55} y1={30} x2={38} y2={24} />
        <Limb x1={65} y1={30} x2={82} y2={24} />
        <Limb x1={57} y1={46} x2={52} y2={68} />
        <Limb x1={52} y1={68} x2={50} y2={88} />
        <Limb x1={63} y1={46} x2={68} y2={68} />
        <Limb x1={68} y1={68} x2={70} y2={88} />
        <Band d="M38,24 Q60,18 82,24" />
      </g>
    ),
  };
}

/* ------------------------------------------------------------------ */
/*  Exercise registry                                                  */
/* ------------------------------------------------------------------ */

const EXERCISE_MAP = {
  // Day A — Upper Push
  pushups: drawPushups,
  ohp: drawOhp,
  flyes: drawFlyes,
  tricep_ext: drawTricepExt,
  plank_pull: drawPlankPull,

  // Day B — Lower Body
  squats: drawSquats,
  rdl: drawRdl,
  lateral_walks: drawLateralWalks,
  glute_bridges: drawGluteBridges,
  calf_raises: drawCalfRaises,

  // Day C — Upper Pull
  rows: drawRows,
  face_pulls: drawFacePulls,
  bicep_curls: drawBicepCurls,
  pull_aparts: drawPullAparts,
  dead_bugs: drawDeadBugs,
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ExerciseIllustration({ exerciseId, size = 280 }) {
  const data = useMemo(() => {
    const drawFn = EXERCISE_MAP[exerciseId] || drawGeneric;
    return drawFn();
  }, [exerciseId]);

  const viewBoxWidth = 260;
  const viewBoxHeight = 110;
  const aspect = viewBoxWidth / viewBoxHeight;
  const width = size;
  const height = size / aspect;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Illustration for ${exerciseId || 'exercise'}`}
      >
        {/* Start frame */}
        {data.start}

        {/* End frame */}
        {data.end}

        {/* Frame labels */}
        <text
          x={60}
          y={106}
          textAnchor="middle"
          fill={COLORS.label}
          fontSize={11}
          fontFamily="sans-serif"
        >
          Start
        </text>
        <text
          x={60 + FRAME_OFFSET}
          y={106}
          textAnchor="middle"
          fill={COLORS.label}
          fontSize={11}
          fontFamily="sans-serif"
        >
          End
        </text>
      </svg>

      {/* Band setup hint */}
      <span
        className="text-[10px] leading-tight text-center max-w-[240px]"
        style={{ color: COLORS.label }}
      >
        Band: {data.bandSetup}
      </span>
    </div>
  );
}
