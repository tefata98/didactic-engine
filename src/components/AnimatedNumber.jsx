import useAnimatedNumber from '../hooks/useAnimatedNumber';

export default function AnimatedNumber({ value, duration = 1200, prefix = '', suffix = '' }) {
  const display = useAnimatedNumber(value, duration);
  return (
    <span>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
