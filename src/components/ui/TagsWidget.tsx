import { FC, useState, KeyboardEvent, ChangeEvent } from 'react';

/**
 * Props for TagsWidget component
 */
export interface TagsWidgetProps {
  /** Current array of tags */
  value?: string[];
  /** Callback when tags change */
  onChange: (tags: string[]) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the widget is disabled */
  disabled?: boolean;
  /** Maximum number of tags allowed */
  maxTags?: number;
}

/**
 * TagsWidget component allows users to add and remove tags.
 * Tags are added by typing and pressing Enter.
 *
 * @example
 * <TagsWidget
 *   value={['react', 'typescript']}
 *   onChange={(tags) => setTags(tags)}
 *   placeholder="Add a skill..."
 * />
 */
const TagsWidget: FC<TagsWidgetProps> = ({
  value = [],
  onChange,
  placeholder = 'Type and press Enter',
  disabled = false,
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const addTag = (): void => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      if (maxTags === undefined || value.length < maxTags) {
        onChange([...value, trimmedValue]);
      }
    }
    setInputValue('');
  };

  const removeTag = (index: number): void => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const isMaxReached = maxTags !== undefined && value.length >= maxTags;

  return (
    <div className="tags-widget">
      <div className="tags-container">
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
              disabled={disabled}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isMaxReached ? 'Max tags reached' : placeholder}
          className="tags-input"
          disabled={disabled || isMaxReached}
          aria-label="Add tag"
        />
      </div>
    </div>
  );
};

export default TagsWidget;
