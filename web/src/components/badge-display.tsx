"use client";

import { useState } from "react";
import { Badge as BadgeType } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface BadgeDisplayProps {
  badges: BadgeType[];
}

const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {badges.map((badge, index) => (
          <div
            key={`${badge.slug}-${index}`}
            className="hover:bg-muted/50 flex w-full max-w-[200px] cursor-pointer flex-col items-center rounded-lg border p-5 transition-colors"
            onClick={() => setSelectedBadge(badge)}
          >
            <div className="relative mb-3 h-20 w-20">
              <Image
                src={badge.image_url || "/placeholder.svg?height=48&width=48"}
                alt={badge.name}
                fill
                className="object-contain"
              />
            </div>
            <Badge variant="secondary" className="px-2 text-center text-xs">
              {badge.name}
            </Badge>
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <Dialog
        open={!!selectedBadge}
        onOpenChange={() => setSelectedBadge(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedBadge && (
                <div className="relative h-8 w-8">
                  <Image
                    src={
                      selectedBadge.image_url ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={selectedBadge.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              {selectedBadge?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {selectedBadge && (
                <div className="relative h-24 w-24">
                  <Image
                    src={
                      selectedBadge.image_url ||
                      "/placeholder.svg?height=96&width=96"
                    }
                    alt={selectedBadge.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Reason</h4>
              <p className="text-muted-foreground">{selectedBadge?.reason}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BadgeDisplay;
