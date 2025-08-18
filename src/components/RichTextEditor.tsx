import React, { useMemo } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onFocus,
  placeholder,
  className = ''
}) => {
  // Configure toolbar with essential formatting options
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const formats = [
    'bold', 'italic', 'list', 'bullet'
  ];

  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .ql-editor {
          min-height: 100px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rich-text-editor .ql-toolbar {
          border-color: hsl(var(--border));
          border-radius: 6px 6px 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-color: hsl(var(--border));
          border-radius: 0 0 6px 6px;
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-editor strong {
          font-weight: 600;
        }
        
        .rich-text-editor .ql-editor em {
          font-style: italic;
        }
        
        .rich-text-editor .ql-editor ol,
        .rich-text-editor .ql-editor ul {
          padding-left: 1.5em;
        }
        
        .rich-text-editor .ql-editor li {
          margin-bottom: 0.25em;
        }
      `}</style>
      
      <ReactQuill
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
};

export default RichTextEditor;