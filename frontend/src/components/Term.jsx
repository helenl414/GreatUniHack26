import { useId, useState } from 'react';
import { IconHelp } from './Icons';

export const GLOSSARY = {
  safeWeekly: 'What you can spend each week on food, travel and everyday things, after your fixed bills, if you plan on a low month.',
  steadyPay: 'The amount you pay yourself every month, whatever comes in. It is set at a low month (lower than 3 in 4 of your recent months), so it is safe to rely on.',
  buffer: 'Savings kept aside for weak months. You add to it when you earn more than your steady pay and take from it when you earn less.',
  average: 'Your total income divided by the number of months. Your best months pull it up, so planning on it can leave you short.',
  shortfall: 'The most money you would be missing at the worst point: what you would need to borrow, get help with, or cut.',
};

/** A word with a plain-English definition the user can open by click, tap or keyboard. */
export function Term({ children, def }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button type="button" className="term" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {children}
        <IconHelp aria-hidden="true" />
        <span className="sr-only">{open ? '(hide meaning)' : '(what does this mean?)'}</span>
      </button>
      <span id={id} className="term-def" role="note" hidden={!open}>
        {def}
      </span>
    </>
  );
}
