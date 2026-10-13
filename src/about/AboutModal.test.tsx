import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { AboutModal } from './AboutModal';
import { mockIPC } from "@tauri-apps/api/mocks";
import { openUrl } from "@tauri-apps/plugin-opener";

vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn()
}))

describe('AboutModal', () => {
  const VERSION_COMMAND = "plugin:app|version";

  beforeEach(() => {
    mockIPC((_cmd, _args) => {
      return;
    });
  });

  it('renders current version', async () => {
    const testVersion = "3.3.3";

    mockIPC((cmd, _args) => {
      if (cmd === VERSION_COMMAND) {
        return testVersion;
      }
      return;
    });

    render(<AboutModal />);

    expect(screen.getByText(/Clyde Dialogue Player/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(`v${testVersion}`)).toBeInTheDocument();
    })
  });


  it.each([
    ["Vinicius Gerevini", "https://thisisvini.com"],
    ["Fabiane Molon","https://fabianemolon.com"],
    ["Player documentation", "https://thisisvini.com/clyde/en/tools/player.html"],
    ["Report issues", "https://github.com/viniciusgerevini/clyde-player"],
])("opens link in browser: %s ", async (text: string, link: string) => {
    render(<AboutModal />);

    await userEvent.click(screen.getByText(text));

    expect(openUrl).toHaveBeenCalledWith(link);
  });
});
