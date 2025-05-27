"use client";
 
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
 
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  SmileIcon,
  SmilePlus,
  StarHalf,
  Text,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
 
interface Project {
  id: string;
  name: string;
  interaction: string;
  platform: string;
}
 
const data: Project[] = [
  {
    id: "1",
    name: "Mark Wasfy",
    interaction: "like",
    platform: "youtube"
  },
  {
    id: "2",
    name: "John Doe",
    interaction: "comment",
    platform: "facebook"
  },
  {
    id: "3",
    name: "Jane Smith",
    interaction: "share",
    platform: "twitter"
  },
  {
    id: "4",
    name: "Omar Abdelghany",
    interaction: "comment",
    platform: "facebook"
  },
];
 
export default function Home() {
  const [title] = useQueryState("title", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
 
  // Ideally we would filter the data server-side, but for the sake of this example, we'll filter the data client-side
  const filteredData = React.useMemo(() => {
    return data.filter((project) => {
      const matchesTitle =
        title === "" ||
        project.name.toLowerCase().includes(title.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(project.platform);
 
      return matchesTitle && matchesStatus;
    });
  }, [title, status]);
 
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<Project, unknown> }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ cell }) => <div>{cell.getValue<Project["name"]>()}</div>,
        meta: {
          label: "Name",
          placeholder: "Search names...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: "platform",
        accessorKey: "platform",
        header: ({ column }: { column: Column<Project, unknown> }) => (
          <DataTableColumnHeader column={column} title="Platform" />
        ),
        cell: ({ cell }) => {
          const platform = cell.getValue<Project["platform"]>();
          const Icon = platform === "youtube" ? SmilePlus : SmileIcon;
 
          return (
            <Badge variant="outline" className="capitalize">
              <Icon />
              {platform}
            </Badge>
          );
        },
        meta: {
          label: "Platform",
          variant: "multiSelect",
          options: [
            { label: "Youtube", value: "youtube", icon: SmilePlus },
            { label: "Facebook", value: "facebook", icon: SmileIcon },
            { label: "Twitter", value: "twitter", icon: SmileIcon },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "interaction",
        accessorKey: "interaction",
        header: ({ column }: { column: Column<Project, unknown> }) => (
          <DataTableColumnHeader column={column} title="Interaction" />
        ),
        cell: ({ cell }) => {
          const interaction = cell.getValue<Project["interaction"]>();
 
          return (
            <div className="flex items-center gap-1">
              <StarHalf className="size-4" />
              {interaction.toLocaleString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: function Cell() {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    [],
  );
 
  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "name", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });
 
  return (
    <main className="p-10">
        <div className="data-table-container">
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>
    </main>
  );
}