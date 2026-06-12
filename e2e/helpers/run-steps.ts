import type { Page } from "@playwright/test";

export async function runSteps(
  page: Page,
  commands: Record<string, (page: Page) => Promise<void>>,
  steps: string[]
): Promise<void> {
  for (const step of steps) {
    if (!(step in commands)) throw new Error(`Unknown step: "${step}"`);
    await commands[step](page);
  }
}
