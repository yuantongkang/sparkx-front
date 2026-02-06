import React, { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface ContextMenuProps {
  x: number;
  y: number;
  elementId: string | null;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  elementId,
  onClose,
}) => {
  const { t } = useI18n();
  const { removeElement, duplicateElement } = useWorkspaceStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, [x, y, elementId]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (elementId) {
      removeElement(elementId);
    }
    onClose();
  };

  const handleDuplicate = () => {
    if (elementId) {
      duplicateElement(elementId);
    }
    onClose();
  };

  if (!elementId) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="pointer-events-none fixed h-0 w-0 opacity-0"
          style={{ left: x, top: y }}
          aria-label="Open context menu"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={6}
        className="min-w-[160px] p-1"
      >
        <DropdownMenuItem
          onSelect={handleDuplicate}
          className="flex items-center gap-2 text-gray-700"
        >
          <Copy className="h-4 w-4" />
          {t("context.copy")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleDelete}
          className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          {t("context.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
