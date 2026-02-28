import { useMemo } from 'react';

const FRONT_MUSCLES = {
  chest: (
    <path
      d="M38,38 Q45,36 50,38 Q55,36 62,38 L62,48 Q55,52 50,50 Q45,52 38,48 Z"
      data-muscle="chest"
    />
  ),
  shoulders: (
    <>
      <path d="M30,32 Q33,28 38,32 L38,40 Q34,38 30,40 Z" data-muscle="shoulders-left" />
      <path d="M62,32 Q67,28 70,32 L70,40 Q66,38 62,40 Z" data-muscle="shoulders-right" />
    </>
  ),
  biceps: (
    <>
      <path d="M28,42 Q26,48 27,56 Q30,56 32,54 L34,42 Q31,40 28,42 Z" data-muscle="biceps-left" />
      <path d="M66,42 Q68,48 73,56 Q70,56 68,54 L66,42 Q69,40 72,42 Z" data-muscle="biceps-right" />
    </>
  ),
  triceps: (
    <>
      <path d="M26,42 Q24,48 25,55 Q27,56 28,54 L28,42 Z" data-muscle="triceps-left" />
      <path d="M74,42 Q76,48 75,55 Q73,56 72,54 L72,42 Z" data-muscle="triceps-right" />
    </>
  ),
  core: (
    <path
      d="M42,50 L58,50 L58,68 Q55,70 50,70 Q45,70 42,68 Z"
      data-muscle="core"
    />
  ),
  quads: (
    <>
      <path d="M40,72 L48,72 L47,92 Q44,94 40,92 Z" data-muscle="quads-left" />
      <path d="M52,72 L60,72 L60,92 Q56,94 53,92 Z" data-muscle="quads-right" />
    </>
  ),
  calves: (
    <>
      <path d="M41,96 Q43,100 44,108 L40,108 Q39,102 41,96 Z" data-muscle="calves-front-left" />
      <path d="M59,96 Q57,100 56,108 L60,108 Q61,102 59,96 Z" data-muscle="calves-front-right" />
    </>
  ),
};

const BACK_MUSCLES = {
  traps: (
    <path
      d="M40,28 Q45,24 50,26 Q55,24 60,28 L58,36 Q54,34 50,35 Q46,34 42,36 Z"
      data-muscle="traps"
    />
  ),
  back: (
    <path
      d="M42,37 L58,37 L60,52 Q55,54 50,53 Q45,54 40,52 Z"
      data-muscle="back"
    />
  ),
  lats: (
    <>
      <path d="M36,38 L42,40 L40,54 Q37,50 36,44 Z" data-muscle="lats-left" />
      <path d="M64,38 L58,40 L60,54 Q63,50 64,44 Z" data-muscle="lats-right" />
    </>
  ),
  shoulders: (
    <>
      <path d="M30,32 Q33,28 38,32 L36,40 Q33,38 30,40 Z" data-muscle="shoulders-back-left" />
      <path d="M62,32 Q67,28 70,32 L70,40 Q67,38 64,40 Z" data-muscle="shoulders-back-right" />
    </>
  ),
  triceps: (
    <>
      <path d="M26,42 Q24,48 25,55 Q28,56 30,54 L30,42 Z" data-muscle="triceps-back-left" />
      <path d="M74,42 Q76,48 75,55 Q72,56 70,54 L70,42 Z" data-muscle="triceps-back-right" />
    </>
  ),
  glutes: (
    <>
      <path d="M40,62 Q45,60 50,64 L50,72 Q45,74 40,72 Z" data-muscle="glutes-left" />
      <path d="M50,64 Q55,60 60,62 L60,72 Q55,74 50,72 Z" data-muscle="glutes-right" />
    </>
  ),
  hamstrings: (
    <>
      <path d="M40,74 L48,74 L47,94 Q44,96 40,94 Z" data-muscle="hamstrings-left" />
      <path d="M52,74 L60,74 L60,94 Q56,96 53,94 Z" data-muscle="hamstrings-right" />
    </>
  ),
  calves: (
    <>
      <path d="M41,96 Q43,100 44,108 L40,108 Q39,102 41,96 Z" data-muscle="calves-back-left" />
      <path d="M59,96 Q57,100 56,108 L60,108 Q61,102 59,96 Z" data-muscle="calves-back-right" />
    </>
  ),
};

const BODY_OUTLINE_FRONT = (
  <path
    d="M50,8 Q56,8 58,12 Q60,16 58,20 Q57,24 56,26
       Q60,28 66,30 Q72,32 74,36 Q76,40 76,46
       Q76,52 74,58 Q72,62 70,64 L68,62 Q66,60 64,58
       Q62,60 62,64 Q62,68 62,72
       Q62,78 62,84 Q62,90 60,96
       Q59,100 60,106 Q60,110 58,114
       Q56,116 52,114 L52,110 Q52,106 52,100
       Q52,96 50,94
       Q48,96 48,100 Q48,106 48,110
       L48,114 Q44,116 42,114
       Q40,110 40,106 Q41,100 38,96
       Q38,90 38,84 Q38,78 38,72
       Q38,68 38,64 Q38,60 36,58
       Q34,60 32,62 L30,64
       Q28,62 26,58 Q24,52 24,46
       Q24,40 26,36 Q28,32 34,30
       Q40,28 44,26 Q43,24 42,20
       Q40,16 42,12 Q44,8 50,8 Z"
    fill="none"
    strokeWidth="1.2"
  />
);

const BODY_OUTLINE_BACK = (
  <path
    d="M50,8 Q56,8 58,12 Q60,16 58,20 Q57,24 56,26
       Q60,28 66,30 Q72,32 74,36 Q76,40 76,46
       Q76,52 74,58 Q72,62 70,64 L68,62 Q66,60 64,58
       Q62,60 62,64 Q62,68 62,72
       Q62,78 62,84 Q62,90 60,96
       Q59,100 60,106 Q60,110 58,114
       Q56,116 52,114 L52,110 Q52,106 52,100
       Q52,96 50,94
       Q48,96 48,100 Q48,106 48,110
       L48,114 Q44,116 42,114
       Q40,110 40,106 Q41,100 38,96
       Q38,90 38,84 Q38,78 38,72
       Q38,68 38,64 Q38,60 36,58
       Q34,60 32,62 L30,64
       Q28,62 26,58 Q24,52 24,46
       Q24,40 26,36 Q28,32 34,30
       Q40,28 44,26 Q43,24 42,20
       Q40,16 42,12 Q44,8 50,8 Z"
    fill="none"
    strokeWidth="1.2"
  />
);

function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export default function MuscleGroupDiagram({
  highlightedMuscles = [],
  primaryMuscles = [],
  size = 120,
  view = 'front',
  accentColor = '#a78bfa',
}) {
  const musclePaths = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  const defaultFill = 'rgba(255,255,255,0.06)';
  const primaryFill = hexToRgba(accentColor, 0.6);
  const secondaryFill = hexToRgba(accentColor, 0.3);
  const outlineStroke = 'rgba(255,255,255,0.15)';

  const allHighlighted = useMemo(() => {
    const set = new Set([...highlightedMuscles, ...primaryMuscles]);
    return set;
  }, [highlightedMuscles, primaryMuscles]);

  const primarySet = useMemo(() => new Set(primaryMuscles), [primaryMuscles]);

  const getFill = (muscleId) => {
    if (primarySet.has(muscleId)) return primaryFill;
    if (allHighlighted.has(muscleId)) return secondaryFill;
    return defaultFill;
  };

  const viewLabel = view === 'front' ? 'Front' : 'Back';

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size * 1.2}
        viewBox="20 4 60 116"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke={outlineStroke}>
          {view === 'front' ? BODY_OUTLINE_FRONT : BODY_OUTLINE_BACK}
        </g>

        {Object.entries(musclePaths).map(([muscleId, pathElement]) => (
          <g
            key={muscleId}
            fill={getFill(muscleId)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          >
            {pathElement}
          </g>
        ))}
      </svg>
      <span className="text-[10px] text-white/30 mt-1">{viewLabel}</span>
    </div>
  );
}
