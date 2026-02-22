import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Dropdown({ field, value, onChange, onSelect, sizeClass }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [dropdownTop, setDropdownTop] = useState(null);

  useEffect(() => {
    function onDocClick(e) { if (triggerRef.current && !triggerRef.current.contains(e.target) && dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => { const r = triggerRef.current.getBoundingClientRect(); setRect(r); setDropdownTop(r.bottom + 8); };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => { window.removeEventListener('scroll', updatePos, true); window.removeEventListener('resize', updatePos); };
  }, [open]);

  useEffect(() => {
    if (!open || !rect) return;
    const adjust = () => {
      if (!dropdownRef.current) return;
      const dh = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < dh + 16 && spaceAbove > spaceBelow) setDropdownTop(rect.top - dh - 8);
      else setDropdownTop(rect.bottom + 8);
    };
    requestAnimationFrame(adjust);
  }, [rect, open]);

  const toggle = () => { if (!open && triggerRef.current) { const r = triggerRef.current.getBoundingClientRect(); setRect(r); setOpen(true); } else setOpen(false); };

  return (
    <div className="px-1">
      <div ref={triggerRef} onClick={toggle} className={`flex items-center justify-between w-full border border-[var(--input-border)] bg-[var(--input-bg)] rounded-[14px] p-2 cursor-pointer select-none ${sizeClass}`}>
        <span className={`truncate ${sizeClass}`}>{ value || "Selecciona una opción" }</span>
        <svg className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
      {open && rect && dropdownTop != null && createPortal(
        <div style={{ position: 'fixed', top: dropdownTop, left: rect.left, width: rect.width, zIndex: 9999 }}>
          <div ref={dropdownRef} className="bg-[var(--card-bg)] border border-[var(--card-stroke)] rounded-[14px] shadow-lg overflow-hidden">
            {field.options && field.options.map((opt, idx) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const key = typeof opt === 'object' ? opt.id : idx;
              const handle = () => {
                if (typeof onSelect === 'function') onSelect(val);
                else if (typeof onChange === 'function') onChange(field.id, val);
                setOpen(false);
              };
              return (
                <div key={key} onClick={handle} className="px-4 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--stroke-selectors-and-search-bars)] cursor-pointer">{val}</div>
              );
            })}
          </div>
        </div>, document.body)
      }
    </div>
  );
}
