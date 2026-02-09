import { useEffect, useMemo, useState } from "react";
import "./App.css";
import galleryJson from "./Data/gallery.json";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

type Photo = {
  id: string;
  alt: string;
  group?: string;
  tags: string[];
  width?: number;
  height?: number;
  src: string;
  srcSet?: Array<{ src: string; width: number; height: number }>;
  fixed?: boolean;
};

const GALLERY_TAG = {
  all: "all",
  portrait: "portrait",
  nature: "nature",
  landscape: "landscape",
  urban: "urban",
  documentary: "documentary",
} as const;

function App() {
  const [gallery, setGallery] = useState<Photo[]>(() => galleryJson as Photo[]);
  const [pos, setPos] = useState(0);
  const [previewTag, setPreviewTag] = useState<string>(GALLERY_TAG.all);

  const orderedIndices = useMemo(() => {
    return gallery
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        if ((a.p.fixed ?? false) === (b.p.fixed ?? false)) return a.i - b.i;
        return a.p.fixed ? 1 : -1;
      })
      .map((x) => x.i);
  }, [gallery]);

  useEffect(() => {
    if (pos < 0) setPos(0);
    if (pos >= orderedIndices.length && orderedIndices.length > 0)
      setPos(orderedIndices.length - 1);
  }, [orderedIndices, pos]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const tagMap: Record<string, string> = {
        "1": GALLERY_TAG.portrait,
        "2": GALLERY_TAG.nature,
        "3": GALLERY_TAG.landscape,
        "4": GALLERY_TAG.urban,
        "5": GALLERY_TAG.documentary,
      };

      if (tagMap[e.key]) {
        e.preventDefault();
        toggleTag(tagMap[e.key]);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (pos < orderedIndices.length - 1) saveAndMove(pos + 1);
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (pos > 0) saveAndMove(pos - 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [pos, orderedIndices]);

  if (gallery.length === 0) return <div>No photos</div>;

  const currentIndex = orderedIndices[pos];
  const current = gallery[currentIndex];

  const toggleTag = (tag: string) => {
    if (tag === GALLERY_TAG.all) return;
    setGallery((g) => {
      const copy = [...g];
      const p = { ...copy[currentIndex], tags: [...copy[currentIndex].tags] };
      const has = p.tags.includes(tag);
      if (has) p.tags = p.tags.filter((t) => t !== tag);
      else p.tags.push(tag);
      // ensure 'all' always present
      if (!p.tags.includes(GALLERY_TAG.all)) p.tags.unshift(GALLERY_TAG.all);
      copy[currentIndex] = p;
      return copy;
    });
  };

  const saveAndMove = async (newPos: number) => {
    // set fixed true for current
    setGallery((g) => {
      const copy = [...g];
      copy[currentIndex] = { ...copy[currentIndex], fixed: true };
      return copy;
    });

    // wait a tick to ensure state updated
    await new Promise((r) => setTimeout(r, 50));

    // send to server
    try {
      await fetch("/save-gallery", {
        method: "POST",
        body: JSON.stringify(gallery, null, 2),
      });
    } catch (err) {
      console.error("Save failed", err);
    }

    setPos(newPos);
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: "#2a2a2a",
          border: "1px solid #444",
          borderRadius: 6,
          padding: 16,
          marginBottom: 20,
          fontSize: 13,
          lineHeight: 1.6,
          color: "#e0e0e0",
        }}
      >
        <strong style={{ fontSize: 15, color: "#fff" }}>
          ⌨️ Keyboard Shortcuts:
        </strong>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: "#4CAF50" }}>Tags:</strong> Press{" "}
            <code
              style={{
                background: "#1a1a1a",
                padding: "3px 6px",
                borderRadius: 3,
                color: "#4CAF50",
                border: "1px solid #4CAF50",
              }}
            >
              1
            </code>
            {"-"}
            <code
              style={{
                background: "#1a1a1a",
                padding: "3px 6px",
                borderRadius: 3,
                color: "#4CAF50",
                border: "1px solid #4CAF50",
              }}
            >
              5
            </code>{" "}
            to toggle
          </div>
          <div>
            <strong style={{ color: "#4CAF50" }}>Next:</strong> Press{" "}
            <code
              style={{
                background: "#1a1a1a",
                padding: "3px 6px",
                borderRadius: 3,
                color: "#4CAF50",
                border: "1px solid #4CAF50",
              }}
            >
              Space
            </code>
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            <strong>1:</strong> portrait | <strong>2:</strong> nature |{" "}
            <strong>3:</strong> landscape | <strong>4:</strong> urban |{" "}
            <strong>5:</strong> documentary
          </div>
          <div>
            <strong style={{ color: "#4CAF50" }}>Previous:</strong> Press{" "}
            <code
              style={{
                background: "#1a1a1a",
                padding: "3px 6px",
                borderRadius: 3,
                color: "#4CAF50",
                border: "1px solid #4CAF50",
              }}
            >
              B
            </code>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => {
            if (pos > 0) saveAndMove(pos - 1);
          }}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (pos < orderedIndices.length - 1) saveAndMove(pos + 1);
          }}
        >
          Next
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ marginBottom: 8 }}>{current.id}</div>
          <div
            style={{
              width: "1000px",
              // maxWidth: "calc(100vw - 260px)",
              height: "600px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // background: "#f7f7f7",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
            }}
          >
            <img
              src={current.src}
              alt={current.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
        <div style={{ width: 220, alignSelf: "flex-start" }}>
          <h4>Tags</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.values(GALLERY_TAG).map((tag) =>
              tag === GALLERY_TAG.all ? null : (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    background: current.tags.includes(tag)
                      ? "green"
                      : undefined,
                    color: current.tags.includes(tag) ? "#fff" : undefined,
                  }}
                >
                  {tag}
                </button>
              ),
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Current tags:</strong>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {current.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <h3>Gallery preview</h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {Object.values(GALLERY_TAG).map((tag) => (
            <button
              key={tag}
              onClick={() => setPreviewTag(tag)}
              style={{
                padding: "6px 12px",
                background: previewTag === tag ? "green" : "#f0f0f0",
                color: previewTag === tag ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: previewTag === tag ? "bold" : "normal",
              }}
            >
              {tag === GALLERY_TAG.all ? "All" : tag}
            </button>
          ))}
          <button
            onClick={() => setPreviewTag("untagged")}
            style={{
              padding: "6px 12px",
              background: previewTag === "untagged" ? "green" : "#f0f0f0",
              color: previewTag === "untagged" ? "#fff" : "#000",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: previewTag === "untagged" ? "bold" : "normal",
            }}
          >
            Untagged
          </button>
        </div>
        <div style={{ maxWidth: "1200px" }}>
          <RowsPhotoAlbum
            photos={gallery
              .filter((p) => {
                if (previewTag === GALLERY_TAG.all) return true;
                if (previewTag === "untagged") return p.tags.length === 1; // only "all" tag
                return p.tags.includes(previewTag);
              })
              .map((p) => {
                const thumb = p.srcSet?.[0] || {
                  src: p.src,
                  width: p.width || 400,
                  height: p.height || 300,
                };
                return {
                  src: thumb.src,
                  width: thumb.width,
                  height: thumb.height,
                  alt: p.alt,
                };
              })}
            targetRowHeight={150}
            onClick={({ index: filteredIndex }) => {
              const filteredPhotos = gallery.filter((p) => {
                if (previewTag === GALLERY_TAG.all) return true;
                if (previewTag === "untagged") return p.tags.length === 1;
                return p.tags.includes(previewTag);
              });
              const clickedPhoto = filteredPhotos[filteredIndex];
              const clickedPhotoIndex = gallery.indexOf(clickedPhoto);
              const posInOrdered = orderedIndices.indexOf(clickedPhotoIndex);
              if (posInOrdered !== -1) {
                setPos(posInOrdered);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
