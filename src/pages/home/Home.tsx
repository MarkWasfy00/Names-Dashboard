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
import { useState } from "react";
import { BreadcrumbModal } from "@/components/breadcrumb-modal/breadcrumbModal";
 
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
  {
    id: "5",
    name: "Sarah Johnson",
    interaction: "like",
    platform: "youtube"
  },
  {
    id: "6",
    name: "Michael Brown",
    interaction: "share",
    platform: "twitter"
  },
  {
    id: "7",
    name: "Emily Davis",
    interaction: "comment",
    platform: "youtube"
  },
  {
    id: "8",
    name: "David Wilson",
    interaction: "like",
    platform: "facebook"
  },
  {
    id: "9",
    name: "Lisa Anderson",
    interaction: "share",
    platform: "youtube"
  },
  {
    id: "10",
    name: "James Taylor",
    interaction: "comment",
    platform: "twitter"
  }
];
 
export default function Home() {
  const [connectionInfo, setConnectionInfo] = useState<boolean>(false);
  const navigate = useNavigate();
 

  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
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
    ],
    [],
  );
 
  const { table } = useDataTable({
    data: data,
    columns,
    pageCount: 1,
    
    getRowId: (row) => row.id,
  });

  const handleConnect = () => {
    
  }
 
  return (
    <main className="p-10">

      <div className="flex flex-col md:flex-row justify-between  p-4 gap-4">
        <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/admin")}><ShieldUser className="w-4 h-4" /></Button>
            <Button><LogOut className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-col gap-2">
            <BreadcrumbModal path={[]} />
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">This is the home page</p>
        </div>

        <div className="flex flex-col gap-2 ml-auto w-fit bg-gray-100 rounded-md p-4 ">
          <p className="flex items-center gap-2">connection info : <Cable className={`w-4 h-4 ${connectionInfo ? "text-green-500" : "text-red-500"}`} /> </p>
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
    </main>
  );
}