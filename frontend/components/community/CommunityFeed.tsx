"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/frontend/components/ui/badge";
import {
  IconMessage,
  IconArrowRight,
  IconCheck,
  IconUsers,
  IconMessages,
} from "@tabler/icons-react";

type Reply = { reply: { id: string; content: string; createdAt: string }; authorName: string };
type Post = { post: { id: string; content: string; createdAt: string }; authorName: string; replies: Reply[] };

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function CommunityFeed({ domain }: { domain: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/community/${domain}`);
    const body = await res.json();
    if (res.ok) {
      setPosts(body.posts);
      setJoined(body.joined);
      setMemberCount(body.memberCount);
    }
  }

  useEffect(() => {
    load();
  }, [domain]);

  async function join() {
    setJoining(true);
    try {
      await fetch(`/api/community/${domain}/join`, { method: "POST" });
      await load();
    } finally {
      setJoining(false);
    }
  }

  async function submitPost() {
    if (!draft.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${domain}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDraft("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong posting message");
    } finally {
      setPosting(false);
    }
  }

  async function submitReply(postId: string) {
    if (!replyDraft.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyDraft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setReplyDraft("");
      setOpenReplyFor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending reply");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="space-y-5">
      
      {/* Guild Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge tone="cyan" className="flex items-center gap-1.5 font-bold">
            <IconUsers className="h-4 w-4" />
            <span>{memberCount} Enrolled Members</span>
          </Badge>
        </div>
        {joined ? (
          <Badge tone="success" className="flex items-center gap-1.5 font-bold">
            <IconCheck className="h-4 w-4" />
            <span>Community Member</span>
          </Badge>
        ) : (
          <button
            disabled={joining}
            onClick={join}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#6D28D9] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{joining ? "Joining..." : "Join Community Guild"}</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* Post Compose Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        {joined ? (
          <>
            <h3 className="mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider">Start a Discussion</h3>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Ask a question, share a breakthrough, or discuss concepts with peers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
            />
            <div className="mt-3 flex justify-end">
              <button
                disabled={posting || !draft.trim()}
                onClick={submitPost}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{posting ? "Posting..." : "Publish Post"}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500 font-medium">Join this community above to publish discussions and reply to peers.</p>
        )}
      </div>

      {/* Posts Feed */}
      {!posts ? (
        <div className="py-12 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 text-[#7C3AED] text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-[#7C3AED] animate-ping" />
            <span>Loading Community Discussions...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
          <IconMessages className="h-10 w-10 text-purple-400 mx-auto mb-2 opacity-60" />
          <p className="mt-2 text-xs font-medium text-slate-500">No discussions posted in this community yet — be the first to start a conversation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(({ post, authorName, replies }) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-200 hover:shadow-md"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-[#7C3AED] shadow-xs">
                  {authorName[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">{authorName}</span>
                  <span className="text-[10px] text-slate-400 ml-2">{formatTime(post.createdAt)}</span>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 leading-relaxed pl-10.5">{post.content}</p>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="mt-4 space-y-2.5 border-l-2 border-purple-200 pl-4 ml-4">
                  {replies.map(({ reply, authorName: replyAuthor }) => (
                    <div key={reply.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{replyAuthor}</span>
                        <span className="text-[9px] text-slate-400">{formatTime(reply.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-slate-600 leading-snug">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Button / Box */}
              {joined && (
                <div className="mt-4 pt-3 border-t border-slate-100 pl-10.5">
                  {openReplyFor === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        rows={2}
                        placeholder="Write a reply..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setOpenReplyFor(null); setReplyDraft(""); }}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={replying || !replyDraft.trim()}
                          onClick={() => submitReply(post.id)}
                          className="rounded-md bg-[#7C3AED] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#6D28D9] disabled:opacity-50"
                        >
                          {replying ? "Replying..." : "Reply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenReplyFor(post.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:underline"
                    >
                      <IconMessage className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
