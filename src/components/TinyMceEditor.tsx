import { useEffect, useId, useRef } from 'react';
import tinymce from 'tinymce/tinymce';
import type { Editor as TinyMceInstance } from 'tinymce/tinymce';

import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.min.css';
import oxideContentCss from 'tinymce/skins/ui/oxide/content.min.css?inline';
import defaultContentCss from 'tinymce/skins/content/default/content.min.css?inline';

import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';

interface TinyMceEditorProps {
  value: string;
  onChange: (html: string) => void;
  authToken: string;
  editorKey?: string;
}

export function TinyMceEditor({
  value,
  onChange,
  authToken,
  editorKey,
}: TinyMceEditorProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const textareaId = `p2b-tinymce-${reactId}`;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<TinyMceInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const authTokenRef = useRef(authToken);
  const latestValueRef = useRef(value);

  onChangeRef.current = onChange;
  authTokenRef.current = authToken;
  latestValueRef.current = value;

  useEffect(() => {
    const target = textareaRef.current;
    if (!target) return;

    let cancelled = false;

    const uploadMediaFile = async (file: File): Promise<{ url: string; fileName: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (authTokenRef.current) {
        headers.Authorization = `Bearer ${authTokenRef.current}`;
      }

      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        media?: { url: string; fileName: string };
      };

      if (!res.ok || !data.ok || !data.media?.url) {
        throw new Error(data.message || 'Gagal mengunggah berkas ke server.');
      }

      return { url: data.media.url, fileName: data.media.fileName };
    };

    void tinymce.init({
      target,
      license_key: 'gpl',
      skin: false,
      content_css: false,
      menubar: 'file edit view insert format tools table',
      plugins: [
        'advlist',
        'autolink',
        'autoresize',
        'charmap',
        'code',
        'fullscreen',
        'image',
        'insertdatetime',
        'link',
        'lists',
        'media',
        'preview',
        'searchreplace',
        'table',
        'visualblocks',
        'wordcount',
      ],
      toolbar:
        'undo redo | blocks fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table blockquote hr | removeformat preview code fullscreen',
      toolbar_mode: 'sliding',
      min_height: 360,
      max_height: 640,
      autoresize_bottom_margin: 24,
      promotion: false,
      branding: false,
      elementpath: true,
      relative_urls: false,
      remove_script_host: false,
      convert_urls: false,
      paste_data_images: true,
      automatic_uploads: true,
      file_picker_types: 'image file',
      content_style: `
        ${oxideContentCss}
        ${defaultContentCss}
        body {
          font-family: "Helvetica Regular", ui-sans-serif, system-ui, sans-serif;
          color: #3E544B;
          font-size: 15.5px;
          line-height: 1.75;
          padding: 16px 20px;
          background-color: #ffffff;
        }
        h1, h2, h3, h4 {
          color: #164234;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        p {
          text-align: justify;
          margin-bottom: 1rem;
        }
        a {
          color: #164234;
          text-decoration: underline;
        }
        blockquote {
          border-left: 3px solid #C9A45A;
          padding-left: 1rem;
          color: #164234;
          font-style: italic;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 14px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid rgba(201, 164, 90, 0.35);
          padding: 8px 12px;
        }
        th {
          background: #F6F3EC;
          color: #164234;
        }
      `,
      images_upload_handler: async (blobInfo) => {
        const blob = blobInfo.blob();
        const file = new File([blob], blobInfo.filename() || 'gambar-berita.png', {
          type: blob.type || 'image/png',
        });
        const uploaded = await uploadMediaFile(file);
        return uploaded.url;
      },
      file_picker_callback: (callback, _value, meta) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute(
          'accept',
          meta.filetype === 'image'
            ? 'image/jpeg,image/png,image/webp,image/gif'
            : 'application/pdf,image/jpeg,image/png,image/webp'
        );
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const uploaded = await uploadMediaFile(file);
            if (meta.filetype === 'image') {
              callback(uploaded.url, { alt: uploaded.fileName });
            } else {
              callback(uploaded.url, { text: uploaded.fileName, title: uploaded.fileName });
            }
          } catch {
            // Silently ignore cancelled/failed upload inside picker
          }
        };
        input.click();
      },
      setup: (editor) => {
        editor.on('init', () => {
          if (cancelled) {
            editor.remove();
            return;
          }
          editorRef.current = editor;
          if (latestValueRef.current) {
            editor.setContent(latestValueRef.current);
          }
        });
        editor.on('change input keyup SetContent Undo Redo', () => {
          onChangeRef.current(editor.getContent());
        });
      },
    });

    return () => {
      cancelled = true;
      const existing = editorRef.current;
      editorRef.current = null;
      if (existing) {
        existing.remove();
      } else {
        tinymce.get(textareaId)?.remove();
      }
    };
  }, [textareaId, editorKey]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[#C9A45A]/35 bg-white shadow-xs">
      <textarea
        id={textareaId}
        ref={textareaRef}
        defaultValue={value}
        className="w-full min-h-[360px]"
      />
    </div>
  );
}
