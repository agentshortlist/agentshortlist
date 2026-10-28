import { testsFor } from "@/content/tests";

// Resumen de las pruebas propias de una ficha para mostrar la marca "Tested by us".
// failed: la última prueba tiene algún paso (install, handshake, tools/list) en "fail".
export type TestMark = { date: string; failed: boolean; runs: number };

export const testMark = (slug: string): TestMark | null => {
  const runs = testsFor(slug);
  if (!runs.length) return null;
  const last = runs[0];
  const failed = [last.install, last.handshake, last.toolsList.status].includes("fail");
  return { date: last.testedAt, failed, runs: runs.length };
};
