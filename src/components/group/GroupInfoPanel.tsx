"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { X, LogOut, UserPlus, Crown } from "lucide-react";
import Image from "next/image";
import OnlineIndicator from "../ui/OnlineIndicator";
import { useState } from "react";

interface GroupInfoPanelProps {
    conversationId: Id<"conversations">;
    onClose: () => void;
}

export default function GroupInfoPanel({
    conversationId,
    onClose,
}: GroupInfoPanelProps) {
    const router = useRouter();
    const groupDetails = useQuery(api.groups.getDetails, { conversationId });
    const currentUser = useQuery(api.users.getMe);
    const allUsers = useQuery(api.users.getAll);
    const leaveGroup = useMutation(api.groups.leaveGroup);
    const addMembers = useMutation(api.groups.addMembers);
    const [showAddMembers, setShowAddMembers] = useState(false);

    if (!groupDetails || !currentUser) {
        return (
            <div className="flex h-full items-center justify-center bg-zinc-950">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
            </div>
        );
    }

    const handleLeave = async () => {
        await leaveGroup({ conversationId });
        router.push("/");
    };

    const handleAddMember = async (userId: Id<"users">) => {
        await addMembers({ conversationId, memberIds: [userId] });
        setShowAddMembers(false);
    };

    // Users not yet in the group
    const nonMembers = allUsers?.filter(
        (u) => !groupDetails.members.some((m) => m && m._id === u._id),
    );

    return (
        <div className="flex h-full flex-col border-l border-zinc-800 bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-bold text-zinc-100">Group Info</h2>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Group avatar + name */}
                <div className="flex flex-col items-center gap-3 border-b border-zinc-800 py-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-3xl font-bold text-zinc-100">
                        {groupDetails.groupName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                        {groupDetails.groupName}
                    </h3>
                    <p className="text-xs text-zinc-500">
                        {groupDetails.memberCount} member
                        {groupDetails.memberCount !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Members list */}
                <div className="px-4 py-3">
                    <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Members
                        </h4>
                        <button
                            onClick={() => setShowAddMembers(!showAddMembers)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Add
                        </button>
                    </div>

                    {/* Add members dropdown */}
                    {showAddMembers && nonMembers && nonMembers.length > 0 && (
                        <div className="mb-3 rounded-lg border border-zinc-800 bg-zinc-900 p-2">
                            {nonMembers.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleAddMember(user._id)}
                                    className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-zinc-800"
                                >
                                    {user.imageUrl ? (
                                        <Image
                                            src={user.imageUrl}
                                            alt={user.name}
                                            width={28}
                                            height={28}
                                            className="h-7 w-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-100">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs text-zinc-300">{user.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Member rows */}
                    <div className="flex flex-col gap-1">
                        {groupDetails.members.map((member) => {
                            if (!member) return null;
                            return (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {member.imageUrl ? (
                                            <Image
                                                src={member.imageUrl}
                                                alt={member.name}
                                                width={36}
                                                height={36}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-100">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="absolute bottom-0 right-0 rounded-full border-2 border-zinc-950">
                                            <OnlineIndicator isOnline={member.isOnline} size="sm" />
                                        </span>
                                    </div>

                                    {/* Name + admin badge */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm text-white">{member.name}</span>
                                            {member._id === currentUser._id && (
                                                <span className="text-[10px] text-zinc-500">You</span>
                                            )}
                                        </div>
                                        {member.isAdmin && (
                                            <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                                <Crown className="h-3 w-3" />
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Leave group */}
            <div className="border-t border-zinc-800 p-4">
                <button
                    onClick={handleLeave}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-900/50 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
                >
                    <LogOut className="h-4 w-4" />
                    Leave Group
                </button>
            </div>
        </div>
    );
}
