// Logo: rejilla 3x3 por la que un punto de luz recorre el anillo en bucle; el centro queda quieto.
// Solo CSS: sin JavaScript en el cliente. Con reduce-motion se queda estática.
const RING_ORDER = [0, 1, 2, 5, 8, 7, 6, 3]; // sentido horario, por posición de celda (fila a fila)

export function BrandMark() {
  return (
    <span aria-hidden="true" className="brand-mark">
      {Array.from({ length: 9 }, (_, cell) => {
        const step = RING_ORDER.indexOf(cell);
        return step === -1 ? (
          <i key={cell} className="brand-cell brand-cell-core" />
        ) : (
          <i key={cell} className="brand-cell" style={{ ["--i" as string]: step }} />
        );
      })}
    </span>
  );
}
