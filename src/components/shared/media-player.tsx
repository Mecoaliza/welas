import { toEmbedUrl } from "@/modules/media/embed";

export function MediaPlayer({
  type,
  url,
}: {
  type: "VIDEO" | "PODCAST";
  url: string;
}) {
  if (type === "PODCAST") {
    return (
      <audio controls className="w-full" preload="none">
        <source src={url} />
        Seu navegador não suporta reprodução de áudio.
      </audio>
    );
  }

  const embedUrl = toEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title="Reprodutor de vídeo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full"
        />
      </div>
    );
  }

  return (
    <video controls className="aspect-video w-full rounded-lg bg-black" preload="none">
      <source src={url} />
      Seu navegador não suporta reprodução de vídeo.
    </video>
  );
}
