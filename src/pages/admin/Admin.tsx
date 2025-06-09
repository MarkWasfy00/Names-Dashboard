import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
 
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  LinkIcon,
  MoreHorizontal,
  SmileIcon,
  SmilePlus,
  Text,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { useSearchParams, useNavigate } from "react-router";
import { BreadcrumbModal } from "@/components/breadcrumb-modal/breadcrumbModal";
import { getWatchersQuery, deleteWatcherMutation, deleteAllWatchersMutation, type Watcher } from "@/queries/watchers/WatcherQuery";
import { useQuery, useMutation } from "@tanstack/react-query";
import { server } from "@/lib/server";
import { toast } from "sonner";
import { useState } from "react";

const Admin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('perPage')) || 10;
  const search = searchParams.get('search') || "";
  const sortBy = searchParams.get('sortBy') || "";
  
  const { data: watchersData, refetch: refetchWatchers } = useQuery(getWatchersQuery({ page, pageSize, prefix: search, sortBy }));

  const deleteMutation = useMutation({
    ...deleteWatcherMutation(),
    onSuccess: () => {
      refetchWatchers();
      toast.success("Watcher deleted successfully");
    },
    onError: (error: { message: string; status?: number }) => {
      if (error.status === 401) {
        // Token expired, auth interceptor will handle the redirect
        return;
      }
      toast.error(error.message || "Failed to delete watcher");
    }
  });

  const deleteAllMutation = useMutation({
    ...deleteAllWatchersMutation(),
    onSuccess: () => {
      refetchWatchers();
      toast.success("All watchers deleted successfully");
    },
    onError: (error: { message: string; status?: number }) => {
      if (error.status === 401) {
        // Token expired, auth interceptor will handle the redirect
        return;
      }
      toast.error(error.message || "Failed to delete all watchers");
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all watchers? This action cannot be undone.")) {
      deleteAllMutation.mutate();
    }
  };

  const columns = React.useMemo<ColumnDef<Watcher>[]>(
    () => [
      {
        id: "username",
        accessorKey: "username",
        header: ({ column }: { column: Column<Watcher, unknown> }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ cell }) => <div>{cell.getValue<Watcher["username"]>()}</div>,
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
        header: ({ column }: { column: Column<Watcher, unknown> }) => (
          <DataTableColumnHeader column={column} title="Platform" />
        ),
        cell: ({ cell }) => {
          const platform = cell.getValue<Watcher["platform"]>();
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
        enableColumnFilter: false,
      },
      {
        id: "interaction",
        accessorKey: "interaction",
        header: ({ column }: { column: Column<Watcher, unknown> }) => (
          <DataTableColumnHeader column={column} title="Interaction" />
        ),
        cell: ({ cell }) => {
          const interaction = cell.getValue<Watcher["interaction"]>();
 
          return (
            <Badge variant="outline" className="capitalize">
              {interaction}
            </Badge>
          );
        },
        meta: {
          label: "Interaction",
          variant: "select",
          options: [
            { label: "Comment", value: "comment" },
            { label: "Tip", value: "tip" },
            { label: "Subscription", value: "subscription" },
            { label: "Membership Gift", value: "membershipGift" },
            { label: "Superchat", value: "superchat" },
          ],
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  variant="destructive"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    [handleDelete],
  );
 
  const { table } = useDataTable({
    data: watchersData?.data || [],
    columns,
    pageCount: watchersData?.totalPages || 1,
    getRowId: (row) => row.id,
    initialState: {
      pagination: {
        pageIndex: Number(page) - 1,
        pageSize: Number(pageSize),
      },
      columnFilters: [
        { id: "username", value: search },
      ],
    },
    history: "replace",
    shallow: true,
  });

  const tablePagination = table.getState().pagination;
  const tableColumnFilters = table.getState().columnFilters;

  React.useEffect(() => {
    const interactionFilter = tableColumnFilters.find(filter => filter.id === "interaction");
    if (interactionFilter) {
      console.log("Selected interaction type:", interactionFilter.value);
    }
  }, [tableColumnFilters]);

  React.useEffect(() => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const { columnFilters } = table.getState();
    const usernameFilter = columnFilters.find(filter => filter.id === "username");
    const interactionFilter = columnFilters.find(filter => filter.id === "interaction");
    const searchValue = usernameFilter?.value as string || "";
    const sortValue = Array.isArray(interactionFilter?.value) 
      ? interactionFilter.value[0] 
      : (interactionFilter?.value as string || "");
  
    // Avoid re-setting the same params unnecessarily
    const currentPage = Number(searchParams.get("page")) || 1;
    const currentPerPage = Number(searchParams.get("perPage")) || 10;
    const currentSearch = searchParams.get("search") || "";
    const currentSort = searchParams.get("sortBy") || "";
  
    if (currentPage !== pageIndex + 1 || 
        currentPerPage !== pageSize || 
        currentSearch !== searchValue ||
        currentSort !== sortValue) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("page", String(pageIndex + 1));
      newParams.set("perPage", String(pageSize));
      if (searchValue) {
        newParams.set("search", searchValue);
      } else {
        newParams.delete("search");
      }
      if (sortValue) {
        newParams.set("sortBy", sortValue);
      } else {
        newParams.delete("sortBy");
      }
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [tablePagination, tableColumnFilters, navigate, searchParams, table]);

  return (
    <main className="p-10">
      <div className="flex flex-col md:flex-row justify-between  p-4 gap-4">
        <div className="flex flex-col gap-2">
          <BreadcrumbModal path={["Admin"]} />
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-gray-500">Total Users: {watchersData?.totalItems || 0}</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md h-fit disabled:opacity-50" 
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
          >
            {deleteAllMutation.isPending ? "Deleting..." : "Delete All"} <Trash2 className="w-4 h-4" />
          </button>
          <button 
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md h-fit disabled:opacity-50" 
            onClick={async () => {
              try {
                setIsExporting(true);
                const response = await fetch(`${server.baseUrl}/dashboard/watchers/plaintext`);
                const text = await response.text();
                await navigator.clipboard.writeText(text);
                toast.success("Export data copied to clipboard");
              } catch (error: unknown) {
                console.error('Export error:', error);
                toast.error("Failed to copy export data");
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
          >
            {isExporting ? "Copying..." : "Export Link"} <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="data-table-container">
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>
    </main>
  );
};

export default Admin;