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
import { useNavigate } from "react-router";
import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { BreadcrumbModal } from "@/components/breadcrumb-modal/breadcrumbModal";
import { auth } from "@/lib/auth";
import * as signalR from "@microsoft/signalr";
import { server } from "@/lib/server";


type Watcher = {
  id: string;
  username: string;
  platform: string;
  interaction: string;
}
 

export default function Home() {
  const [connectionInfo, setConnectionInfo] = useState<boolean>(false);
  const [watchers, setWatchers] = useState<Watcher[]>([]);
  const [lastAddedWatcher, setLastAddedWatcher] = useState<Watcher | null>(null);
  const [currentUsers, setCurrentUsers] = useState<number>(0);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

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
    data: watchers,
    columns,
    pageCount: 1,
    
    getRowId: (row) => row.id,
  });

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
      setWatchers(watchers);
      setLastAddedWatcher(watchers[watchers.length - 1] || null);
      setCurrentUsers(watchers.length);
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
          <p>video id : <span className="font-bold">1234567890</span></p>
          <p>streamlabs id : <span className="font-bold">1234567890</span></p>
          {
            connectionInfo ? <Button className="bg-red-500 text-white px-4 py-2 rounded-md">disconnect</Button> : <SettingsModal />
          }
        </div>
      </div>

        <div className="data-table-container">
            <DataTable table={table}/>
        </div>

        <Button onClick={() => handleSetVideoId("jfKfPfyJRdk", "11")}>set video id</Button>
    </main>
  );
}