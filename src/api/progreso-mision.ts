export interface MisionConEstado {
  id: string;
  bloqueada: boolean;
  completada: boolean;
}

interface NivelConMisiones<TMision extends MisionConEstado> {
  misiones: TMision[];
}

export function buscarSiguienteMision<TMision extends MisionConEstado>(
  niveles: NivelConMisiones<TMision>[],
  misionActualId: string,
): TMision | undefined {
  const misiones = niveles.flatMap((nivel) => nivel.misiones);
  const indiceActual = misiones.findIndex(
    (mision) => String(mision.id) === String(misionActualId),
  );
  const siguientes =
    indiceActual >= 0
      ? misiones.slice(indiceActual + 1)
      : misiones.filter(
          (mision) => String(mision.id) !== String(misionActualId),
        );

  return siguientes.find(
    (mision) => !mision.bloqueada && !mision.completada,
  );
}