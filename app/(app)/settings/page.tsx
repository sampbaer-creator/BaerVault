import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

import { SettingsWorkspace } from "@/features/settings/SettingsWorkspace";
export default function SettingsPage(){return <SettingsWorkspace/>}
