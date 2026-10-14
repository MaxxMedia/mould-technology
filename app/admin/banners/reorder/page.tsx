"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BANNER_PLACEMENTS } from "@/lib/bannerPlacements";

export default function BannerReorderPage() {
  const [placement, setPlacement] = useState("HOME_MIDDLE");
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch banners for selected placement
  const fetchBanners = async (selectedPlacement: string) => {
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/banners/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const allBanners = await res.json();

    const filtered = allBanners
      .filter((b: any) => b.placement === selectedPlacement)
      .sort((a: any, b: any) => a.position - b.position);

    setBanners(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners(placement);
  }, [placement]);

  // Drag end handler
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    // Update UI immediately
    setBanners(items);

    // Persist order in backend
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/banners/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(
          items.map((b, index) => ({
            id: b.id,
            position: index,
          }))
        ),
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Reorder Advertisement Banners
      </h1>

      {/* Placement Selector */}
      <select
        value={placement}
        onChange={(e) => setPlacement(e.target.value)}
        className="border p-2 mb-6"
      >
        {BANNER_PLACEMENTS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label} ({p.dimensions})
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading banners…</p>
      ) : banners.length === 0 ? (
        <p>No banners for this placement</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="banners">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {banners.map((b, index) => (
                  <Draggable
                    key={b.id}
                    draggableId={String(b.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-4 border p-3 rounded bg-white cursor-move"
                      >
                        <span className="font-bold w-6">
                          {index + 1}
                        </span>

                        <div className="relative w-24 h-14">
  <Image
    src={b.imageUrl}
    alt={b.title || "Banner"}
    fill
    className="object-cover rounded"
    sizes="96px"
  />
</div>

                        <div>
                          <p className="font-medium">{b.title}</p>
                          <p className="text-sm text-gray-500">
                            {b.status}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
