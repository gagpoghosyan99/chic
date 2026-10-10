'use client';

import { useCallback, useRef, useState } from 'react';
import { Modal } from './Modal';
import { useT } from '../I18n';

/** Promise-based confirmation dialog: `if (await confirm(text, { danger: true })) ...` */
export function useConfirm() {
  const t = useT();
  const [state, setState] = useState<{ text: string; danger?: boolean; confirmLabel?: string } | null>(null);
  const resolver = useRef<(v: boolean) => void>(undefined);

  const confirm = useCallback((text: string, opts: { danger?: boolean; confirmLabel?: string } = {}) => {
    setState({ text, ...opts });
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    setState(null);
  };

  const dialog = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={t('confirm')}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={() => close(false)}>
            {t('cancel')}
          </button>
          <button type="button" className={state?.danger ? 'btn bg-red-600 text-white hover:bg-red-700' : 'btn-primary'} onClick={() => close(true)} autoFocus>
            {state?.confirmLabel ?? t('confirm')}
          </button>
        </>
      }
    >
      <p className="text-[15px] text-slate-700">{state?.text}</p>
    </Modal>
  );

  return { confirm, dialog };
}
