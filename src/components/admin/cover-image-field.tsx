"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function CoverImageField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [brokenPreview, setBrokenPreview] = useState(false);

  async function upload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Falha ao enviar a imagem.");
      setBrokenPreview(false);
      onChange(json.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  const message = uploadError ?? error;

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="coverImage" value={value} />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="group relative aspect-video overflow-hidden rounded-lg border bg-muted">
          {brokenPreview ? (
            <div className="flex size-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Não foi possível carregar a imagem. Verifique o link.
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Pré-visualização da capa"
              className="size-full object-cover"
              onError={() => setBrokenPreview(true)}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Trocar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="text-destructive"
              onClick={() => {
                onChange("");
                setBrokenPreview(false);
              }}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50",
            dragging && "border-primary bg-muted/50"
          )}
        >
          {uploading ? (
            <Loader2 className="size-8 animate-spin" />
          ) : (
            <ImagePlus className="size-8" />
          )}
          <span className="font-medium text-foreground">
            {uploading ? "Enviando..." : "Clique ou arraste uma imagem"}
          </span>
          <span className="text-xs">JPG, PNG, WEBP ou GIF · até 5MB · ideal 16:9</span>
        </button>
      )}

      {showUrl ? (
        <Input
          aria-label="URL da imagem de capa"
          placeholder="https://exemplo.com/imagem.jpg"
          value={value}
          onChange={(e) => {
            setBrokenPreview(false);
            onChange(e.target.value);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowUrl(true)}
          className="flex items-center gap-1 self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <Link2 className="size-3" /> Usar um link de imagem
        </button>
      )}

      {message && <p className="text-sm text-destructive">{message}</p>}
    </div>
  );
}
