"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Users, X, Check, ArrowRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";

export default function NewGroupButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "name">("select");
  const [selectedMembers, setSelectedMembers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();
  const allUsers = useQuery(api.users.getAll);
  const createGroup = useMutation(api.groups.create);

  const filteredUsers = allUsers?.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleMember = (userId: Id<"users">) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setCreating(true);
    try {
      const conversationId = await createGroup({
        name: groupName,
        memberIds: selectedMembers,
      });
      router.push(`/conversations/${conversationId}`);
      handleClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("select");
    setSelectedMembers([]);
    setGroupName("");
    setSearchQuery("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mx-3 mt-2 flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-100 transition-all hover:bg-zinc-800"
      >
        <Users className="h-4 w-4" />
        New Group
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-20 flex flex-col bg-zinc-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-bold text-zinc-100">
              {step === "select" ? "Select Members" : "Group Name"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === "select" && (
            <>
              {/* Selected members chips */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 px-3 py-2">
                  {selectedMembers.map((id) => {
                    const user = allUsers?.find((u) => u._id === id);
                    if (!user) return null;
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200"
                      >
                        {user.name.split(" ")[0]}
                        <button
                          onClick={() => toggleMember(id)}
                          className="ml-0.5 text-zinc-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search input */}
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800/40 py-2 px-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                />
              </div>

              {/* User list with checkboxes */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                {filteredUsers?.map((user) => {
                  const isSelected = selectedMembers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleMember(user._id)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-800/50"
                    >
                      {/* Checkbox */}
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-zinc-100 bg-zinc-100"
                            : "border-zinc-600"
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-zinc-900" />
                        )}
                      </div>

                      {/* Avatar */}
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-semibold text-zinc-100">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span className="text-sm text-white">{user.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              {selectedMembers.length > 0 && (
                <div className="border-t border-zinc-800 p-3">
                  <button
                    onClick={() => setStep("name")}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {step === "name" && (
            <div className="flex flex-1 flex-col p-4">
              {/* Group avatar preview */}
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-3xl font-bold text-zinc-100">
                  {groupName.trim()
                    ? groupName.trim().charAt(0).toUpperCase()
                    : "G"}
                </div>
                <p className="text-xs text-zinc-500">
                  {selectedMembers.length + 1} members
                </p>
              </div>

              {/* Group name input */}
              <input
                type="text"
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                maxLength={50}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800/40 py-3 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
              />

              <div className="mt-auto flex gap-2 pt-4">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 rounded-md border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!groupName.trim() || creating}
                  className="flex-1 rounded-md bg-zinc-100 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
