import { describe, test, expect } from 'vitest';
import { NotificationService } from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */
describe('broadcast', () => {
  test('can send a notification through the Telegram Group', async () => {
    await expect(
      NotificationService.broadcast({
        sender: 'AUTOMATED_TEST',
        title: 'Integration Test',
        description:
          "Hi! If you're reading this message it's because the Telegram Module has been implemented correctly and is ready to be used in production.",
        event_time: Date.now(),
      }),
    ).resolves.toBeUndefined();
  }, 15000);
});
