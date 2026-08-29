"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconArrowRight,
  IconCheck,
  IconUsers,
  IconPencil,
  IconMessage,
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
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${domain}`);
      if (res.ok) {
        const body = await res.json();
        setPosts(body.posts ?? []);
        setJoined(Boolean(body.joined));
        setMemberCount(body.memberCount ?? 0);
      } else if (res.status === 401) {
        // Unauthenticated guest browsing
        setPosts([]);
        setJoined(false);
      }
    } catch (_err) {
      // Resilience against server reloads / momentary drops
    }
  }, [domain]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      load();
    }
    return () => {
      mounted = false;
    };
  }, [load]);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${domain}/join`, { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/login?next=/community/${domain}`;
          return;
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to join community");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join community");
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
      setShowCompose(false);
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
    <div className="space-y-4">
      
      {/* ================= CARD 1: ENROLLED MEMBERS STATS & JOIN BUTTON ================= */}
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left Side: Users Icon + Count + Sparkline Wave */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shrink-0">
              <IconUsers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {memberCount}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                Enrolled Members
              </div>
            </div>
          </div>

          {/* Green Sparkline Curve Wave Graph */}
          <div className="hidden sm:block">
            <svg viewBox="0 0 100 24" className="w-24 h-7 overflow-visible">
              <defs>
                <linearGradient id="emeraldCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 20 Q 25 24, 45 14 T 80 8 T 100 2 L 100 24 L 0 24 Z" fill="url(#emeraldCurveGrad)" />
              <path d="M0 20 Q 25 24, 45 14 T 80 8 T 100 2" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="100" cy="2" r="2.5" fill="#10B981" />
            </svg>
          </div>
        </div>

        {/* Right Side: Join Guild CTA / New Discussion */}
        <div className="flex items-center gap-2">
          {joined ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs">
                <IconCheck className="h-4 w-4 text-emerald-600" />
                <span>Community Member</span>
              </span>
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#6D28D9] transition-all cursor-pointer"
              >
                <IconPencil className="h-3.5 w-3.5" />
                <span>{showCompose ? "Close Form" : "New Discussion"}</span>
              </button>
            </>
          ) : (
            <button
              disabled={joining}
              onClick={join}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#6366F1] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>✨ Join Community Guild</span>
              <IconArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

      {/* ================= CARD 2: NOTICE CARD WITH 3D AVATAR TRIO ================= */}
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-3 shadow-xs flex items-center justify-between gap-4 overflow-hidden select-none">
        
        {/* Left Side: Purple Rounded Icon + Message */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED] shrink-0">
            <IconUsers className="h-5 w-5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
            Join this community above to publish discussions and reply to peers.
          </p>
        </div>

        {/* Right Side: Exact 3D Character Trio Graphics */}
        <div className="shrink-0 hidden md:block">
          <Image
            src="/images/community/avatars_trio_3d.png"
            alt="Community Members"
            width={160}
            height={56}
            className="object-contain select-none"
            unoptimized
          />
        </div>

      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* ================= ACTIVE COMPOSE BOX (IF OPEN) ================= */}
      {showCompose && (
        <div className="rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Start a Discussion</h3>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Ask a question, share a breakthrough, or discuss concepts with peers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setShowCompose(false); setDraft(""); }}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={posting || !draft.trim()}
              onClick={submitPost}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{posting ? "Posting..." : "Publish Post"}</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= CARD 3: POSTS FEED OR EXACT EMPTY STATE ================= */}
      {!posts ? (
        <div className="py-12 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 text-[#7C3AED] text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-[#7C3AED] animate-ping" />
            <span>Loading Community Discussions...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        /* Exact Empty State matching user screenshot */
        <div className="rounded-3xl border border-slate-100 bg-white py-14 px-8 shadow-xs flex flex-col items-center justify-center text-center select-none">
          
          {/* 3D Purple Chat Bubbles with Radiating Sparkles */}
          <div className="mb-1">
            <Image
              src="/images/community/chat_bubbles_3d.png"
              alt="No Discussions Yet"
              width={140}
              height={70}
              className="object-contain select-none drop-shadow-sm"
              unoptimized
            />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-3">
            No discussions posted in this community yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 max-w-md">
            Be the first to start a conversation and help this community grow!
          </p>

          <button
            onClick={() => {
              if (!joined) join();
              setShowCompose(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-purple-200/90 bg-[#FAF5FF]/40 px-6 py-2.5 text-xs sm:text-sm font-bold text-[#7C3AED] hover:bg-purple-50 shadow-xs transition-all mt-6 cursor-pointer"
          >
            <span>Start a Discussion</span>
            <IconPencil className="h-3.5 w-3.5" />
          </button>

        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(({ post, authorName, replies }) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all hover:border-purple-200 hover:shadow-md"
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
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
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
