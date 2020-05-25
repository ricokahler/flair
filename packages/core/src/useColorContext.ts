import { useContext, useMemo } from 'react';
import ColorContext from './ColorContext';
import createReadablePalette from './createReadablePalette';

interface Props {
  color?: string;
  surface?: string;
}

function useColorContext(props?: Props) {
  const colorContext = useContext(ColorContext);

  const color = props?.color || colorContext.color;
  const surface = props?.surface || colorContext.surface;

  return useMemo(
    () => ({
      color: createReadablePalette(color, surface),
      surface,
    }),
    [color, surface],
  );
}

export default useColorContext;
