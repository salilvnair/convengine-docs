import React from 'react';

function resolveTone(section, item, defaultTone) {
  if (item && typeof item === 'object' && item.tone) return item.tone;
  if (section && section.tone) return section.tone;
  return defaultTone;
}

function resolveText(item) {
  if (item && typeof item === 'object') return item.text || '';
  return String(item || '');
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function PromptSuite({
  title = 'Consumer test prompts (copy/paste)',
  sections = [],
  defaultTone = 'default',
}) {
  const rootId = slugify(title) || 'prompt-suite';
  return (
    <div className="ce-prompt-suite" data-popup-disabled="true">
      <h2 id={rootId}>{title}</h2>
      {sections.map((section) => (
        <div key={section.title} className="ce-prompt-suite-section">
          <h3 id={`${rootId}-${slugify(section.title) || 'section'}`}>{section.title}</h3>
          <ol>
            {(section.items || []).map((item) => {
              const text = resolveText(item);
              const tone = resolveTone(section, item, defaultTone);
              return (
                <li key={`${section.title}-${text}`}>
                  <span className={`ce-prompt-inline ce-prompt-inline--${tone}`}>{text}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
