import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import SettingsModal from "@/components/set-settings-modal/settingsModal";
 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useDataTable } from "@/hooks/use-data-table";
 
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  Cable,
  LogOut,
  ShieldUser,
  SmileIcon,
  SmilePlus,
  StarHalf,
  Text,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { BreadcrumbModal } from "@/components/breadcrumb-modal/breadcrumbModal";
import { auth } from "@/lib/auth";
import * as signalR from "@microsoft/signalr";
import { server } from "@/lib/server";
import { getWatchersQuery, type Watcher } from "@/queries/watchers/WatcherQuery";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [connectionInfo, setConnectionInfo] = useState<boolean>(false);
  const [lastAddedWatcher, setLastAddedWatcher] = useState<Watcher | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [currentUsers, setCurrentUsers] = useState<number>(0);
  
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('perPage')) || 10;
  const search = searchParams.get('search') || "";

  const [message, setMessage] = useState<{ videoId: string, token: string } | null>(null);




  const { data: watchersData } = useQuery(getWatchersQuery({ page, pageSize, prefix: "", sortBy: "" }));

  const navigate = useNavigate();

  const handleSetVideoId = useCallback(async (videoId: string, streamlabsToken: string) => {
    if (connection) {
      try {
        await connection.invoke("SetVideoId", videoId, streamlabsToken);
      } catch (error) {
        console.error("Error setting video ID:", error);
      }
    }
  }, [connection]);
 
  const handleLogout = () => {
    auth.removeToken();
    navigate('/login', { replace: true });
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
        enableColumnFilter: true,
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
            <div className="flex items-center gap-1">
              <StarHalf className="size-4" />
              {interaction.toLocaleString()}
            </div>
          );
        },
      },
    ],
    [],
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
 

  useEffect(() => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const { columnFilters } = table.getState();
    const usernameFilter = columnFilters.find(filter => filter.id === "username");
    const searchValue = usernameFilter?.value as string || "";
  
    // Avoid re-setting the same params unnecessarily
    const currentPage = Number(searchParams.get("page")) || 1;
    const currentPerPage = Number(searchParams.get("perPage")) || 10;
    const currentSearch = searchParams.get("search") || "";
  
    if (currentPage !== pageIndex + 1 || currentPerPage !== pageSize || currentSearch !== searchValue) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("page", String(pageIndex + 1));
      newParams.set("perPage", String(pageSize));
      if (searchValue) {
        newParams.set("search", searchValue);
      } else {
        newParams.delete("search");
      }
      navigate({ search: newParams.toString() }, { replace: true });
    }
  
  }, [tablePagination, tableColumnFilters, navigate, searchParams, table]);
  

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(server.websocketUrl, {
        accessTokenFactory: () => auth.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    const startConnection = async () => {
      try {
        await newConnection.start();
        setConnectionInfo(true);
        await newConnection.invoke("MakeListener");
      } catch (err) {
        console.error("Error starting connection:", err);
        setConnectionInfo(false);
      }
    };

    startConnection();

    newConnection.on("UpdateWatchers", (watchers: Watcher[]) => {
      setLastAddedWatcher(watchers[watchers.length - 1] || null);
      setCurrentUsers(watchers.length);
    });

    newConnection.on("StreamlabsTokenUpdated", (data: { message: { token: string, videoId: string } }) => {
      console.log(data);
      setMessage(data.message);
    });

    newConnection.onreconnecting(() => {
      setConnectionInfo(false);
    });

    newConnection.onreconnected(() => {
      setConnectionInfo(true);
      newConnection.invoke("MakeListener").catch(console.error);
    });

    newConnection.onclose(() => {
      setConnectionInfo(false);
    });

    return () => {
      if (newConnection) {
        newConnection.stop().catch(console.error);
      }
    };
  }, []);


  useEffect(() => {
    setCurrentUsers(watchersData?.totalItems || 0);
  }, [watchersData])

  return (
    <main className="p-10">

      <div className="flex flex-col md:flex-row justify-between  bg-gray-100 rounded-md p-4 gap-4 mb-4">
        <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/admin")}><ShieldUser className="w-4 h-4" /></Button>
            <Button onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-col gap-2">
            <BreadcrumbModal path={[]} />
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="flex items-center gap-2 text-sm text-gray-500">connection info : <Cable className={`w-4 h-4 ${connectionInfo ? "text-green-500" : "text-red-500"}`} /> </p>
          <p className="text-sm text-gray-500">last added user : {lastAddedWatcher?.username}</p>
          <p className="text-sm text-gray-500">current users : {currentUsers}</p>
        </div>

        <div className="flex flex-col gap-2 ml-auto w-fit rounded-md p-4 ">
          <p>video id : <span className="font-bold">{message?.videoId || "not set"}</span></p>
          <p>streamlabs id : <span className="font-bold">{message?.token || "not set"}</span></p>
          {/* {
            connectionInfo ? <Button className="bg-red-500 text-white px-4 py-2 rounded-md">disconnect</Button> : <SettingsModal onSetVideoId={handleSetVideoId} />
          } */}
          <SettingsModal onSetVideoId={handleSetVideoId} />
          <Button variant="destructive" onClick={() => handleSetVideoId("0", "0")}>turn off listener</Button>
        </div>
      </div>

        <div className="data-table-container">
            <DataTable table={table}/>
        </div>

        
    </main>
  );
}