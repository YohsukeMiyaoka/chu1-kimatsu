import type { ReactNode } from 'react';

export interface DialogAction {
  label: string;
  kind?: 'primary' | 'danger' | 'plain';
  onClick: () => void;
}

/**
 * アプリ内の確認ダイアログ。
 * iPad の「ホーム画面に追加」したアプリでは window.confirm が出ないことがあるので、ブラウザの confirm は使わない。
 */
export function Dialog({ title, children, actions }: { title: string; children?: ReactNode; actions: DialogAction[] }) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="dialog">
        <h2 className="dialog-title">{title}</h2>
        {children && <div className="dialog-body">{children}</div>}
        <div className="dialog-actions">
          {actions.map((a) => (
            <button key={a.label} className={`btn ${a.kind === 'plain' ? '' : a.kind ?? ''}`} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
